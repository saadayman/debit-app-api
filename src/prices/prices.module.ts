import { Global, Module } from '@nestjs/common';
import { GoldPriceService } from './gold-price.service';
import { PricesController } from './prices.controller';

@Global()
@Module({
  controllers: [PricesController],
  providers: [GoldPriceService],
  exports: [GoldPriceService],
})
export class PricesModule {}
