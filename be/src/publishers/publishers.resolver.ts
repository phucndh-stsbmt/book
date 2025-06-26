import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PublishersService } from './publishers.service';
import { Publisher } from './entities/publisher.entity';
import { CreatePublisherInput } from './dto/create-publisher.input';
import { UpdatePublisherInput } from './dto/update-publisher.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Resolver(() => Publisher)
export class PublishersResolver {
  constructor(private readonly publishersService: PublishersService) {}

  @Mutation(() => Publisher)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createPublisher(
    @Args('createPublisherInput') createPublisherInput: CreatePublisherInput,
  ): Promise<Publisher> {
    return this.publishersService.create(createPublisherInput);
  }

  @Query(() => [Publisher], { name: 'publishers' })
  findAll() {
    return this.publishersService.findAll();
  }

  @Query(() => Publisher, { name: 'publisher' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.publishersService.findOne(id);
  }

  @Mutation(() => Publisher)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updatePublisher(
    @Args('updatePublisherInput') updatePublisherInput: UpdatePublisherInput,
  ): Promise<Publisher> {
    return this.publishersService.update(
      updatePublisherInput.id,
      updatePublisherInput,
    );
  }

  @Mutation(() => Publisher)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  removePublisher(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Publisher> {
    return this.publishersService.remove(id);
  }
}
