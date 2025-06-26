import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenService } from '../services/token.service';
import { JwtPayload, AuthUser } from '../interfaces/jwt-payload.interface';
import { RedisService } from '../services/redis.service';
import { TokenRevokedException } from '../exceptions/token-revoked.exception';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private tokenService: TokenService,
    private redisService: RedisService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fallback-secret',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    // Check if token is blacklisted - ALWAYS check, not optional
    const isBlacklisted = await this.redisService.isInBlacklist(payload.jti);
    if (isBlacklisted) {
      throw new TokenRevokedException();
    }

    // Fetch full User entity from database
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      select: [
        'id',
        'email',
        'first_name',
        'last_name',
        'phone',
        'address',
        'role',
        'is_banned',
        'note',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Return AuthUser format instead of User entity
    const authUser: AuthUser = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenId: payload.jti
    };

    console.log('JWT Strategy - AuthUser created:', authUser);
    return authUser;
  }
}
