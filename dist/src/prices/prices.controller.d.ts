import { GoldPriceService } from './gold-price.service';
export declare class PricesController {
    private goldPrice;
    constructor(goldPrice: GoldPriceService);
    gold(): Promise<import("./gold-price.service").GoldPrice>;
}
