import { Module } from '@nestjs/common';
import { ShoppingRequestsController } from './shopping-requests.controller';
import { ShoppingRequestsService } from './shopping-requests.service';

@Module({
  controllers: [ShoppingRequestsController],
  providers: [ShoppingRequestsService],
})
export class ShoppingRequestsModule {}
