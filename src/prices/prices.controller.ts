import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GoldPriceService } from './gold-price.service';

@ApiTags('prices')
@ApiBearerAuth()
@Controller('prices')
export class PricesController {
  constructor(private goldPrice: GoldPriceService) {}

  @Get('gold')
  async gold() {
    const price = await this.goldPrice.getGoldPrice();
    if (!price) {
      throw new ServiceUnavailableException('Gold price is currently unavailable');
    }
    return price;
  }
}
