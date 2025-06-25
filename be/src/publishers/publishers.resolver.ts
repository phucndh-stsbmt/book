import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PublishersService } from './publishers.service';
import { Publisher } from './entities/publisher.entity';
import { CreatePublisherInput } from './dto/create-publisher.input';
import { UpdatePublisherInput } from './dto/update-publisher.input';

@Resolver(() => Publisher)
export class PublishersResolver {
  constructor(private readonly publishersService: PublishersService) {}

  @Mutation(() => Publisher)
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
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.publishersService.findOne(id);
  }

  @Mutation(() => Publisher)
  updatePublisher(
    @Args('updatePublisherInput') updatePublisherInput: UpdatePublisherInput,
  ): Promise<Publisher> {
    return this.publishersService.update(
      updatePublisherInput.id,
      updatePublisherInput,
    );
  }

  @Mutation(() => Publisher)
  removePublisher(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Publisher> {
    return this.publishersService.remove(id);
  }
}
