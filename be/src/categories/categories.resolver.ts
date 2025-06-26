import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Resolver(() => Category)
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Mutation(() => Category)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createCategory(
    @Args('createCategoryInput') createCategoryInput: CreateCategoryInput,
  ): Promise<Category> {
    return this.categoriesService.create(createCategoryInput);
  }


  @Query(() => [Category], { name: 'categories' })
  @UseGuards(GqlAuthGuard)  // Chỉ cần đăng nhập
  findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Query(() => Category, { name: 'category' })
  @UseGuards(GqlAuthGuard)  // Chỉ cần đăng nhập
  findOne(@Args('id', { type: () => Int }) id: number): Promise<Category> {
    return this.categoriesService.findOne(id);
  }

  @Mutation(() => Category)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateCategory(
    @Args('updateCategoryInput') updateCategoryInput: UpdateCategoryInput,
  ): Promise<Category> {
    const { id, ...updateData } = updateCategoryInput;
    return this.categoriesService.update(id, updateData);
  }


  @Mutation(() => Category)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  removeCategory(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Category> {
    return this.categoriesService.remove(id);
  }
}
