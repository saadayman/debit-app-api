import { PrismaService } from '../prisma/prisma.service';
import { GoldPriceService } from './gold-price.service';

describe('GoldPriceService', () => {
  afterEach(() => jest.restoreAllMocks());

  it('converts Gold API spot USD/oz into JOD values by karat', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ price: 2400 }),
    } as Response);
    const service = new GoldPriceService({} as PrismaService);

    const price = await service.getGoldPrice();

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.gold-api.com/price/XAU',
      expect.objectContaining({
        headers: { Accept: 'application/json' },
      }),
    );
    expect(price).toEqual(
      expect.objectContaining({
        source: 'gold-api.com',
        currency: 'JOD',
        spotUsdPerOz: 2400,
        perGramPure: 54.71,
      }),
    );
    expect(price?.perGramBuyByKarat['21']).toBe(47.87);
    expect(price?.perGramByKarat['21']).toBe(50.26);
    await expect(service.valueGold(10, 21)).resolves.toBe(478.7);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('returns unavailable when the replacement provider rejects the request', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 403,
    } as Response);
    const service = new GoldPriceService({} as PrismaService);

    await expect(service.getGoldPrice()).resolves.toBeNull();
  });
});
