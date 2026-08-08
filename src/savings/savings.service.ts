import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SavingsAsset } from '@prisma/client';
import { GoldPriceService } from '../prices/gold-price.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSavingsAssetDto,
  UpdateSavingsAssetDto,
} from './dto/savings.dto';
import { GOLD_FORMS, roundGrams } from './gold-forms';

export const VALUATION_CURRENCY = 'JOD';
const DEFAULT_SILVER_PERMILLE = 999;

export interface ValuedAsset extends SavingsAsset {
  debtRepayment?: { id: string; debtId: string } | null;
  /** Current JOD value, or null when a live metal price is unavailable */
  value: number | null;
  /** true for metals whose value could not be priced right now */
  priceUnavailable: boolean;
}

@Injectable()
export class SavingsService {
  constructor(
    private prisma: PrismaService,
    private goldPrice: GoldPriceService,
  ) {}

  private validate(dto: CreateSavingsAssetDto) {
    if (dto.type === 'GOLD') {
      const spec = dto.goldForm ? GOLD_FORMS[dto.goldForm] : undefined;
      if (spec?.counted) {
        if (dto.quantity == null) {
          throw new BadRequestException(`${dto.goldForm} requires a quantity`);
        }
      } else if (dto.weightGrams == null || dto.karat == null) {
        throw new BadRequestException('Gold requires weightGrams and karat');
      }
    } else if (dto.type === 'SILVER') {
      if (dto.weightGrams == null) {
        throw new BadRequestException('Silver requires weightGrams');
      }
    } else if (dto.amount == null) {
      throw new BadRequestException(`${dto.type} requires an amount`);
    }
  }

  private valueOne(
    asset: SavingsAsset,
    goldBuyByKarat: Record<string, number> | null,
    silverPerGramPure: number | null,
  ): { value: number | null; priceUnavailable: boolean } {
    if (asset.type === 'GOLD') {
      if (
        goldBuyByKarat == null ||
        asset.weightGrams == null ||
        asset.karat == null
      ) {
        return { value: null, priceUnavailable: true };
      }
      // Value at the local buy-back rate for the asset's karat, falling back
      // to scaling the 24k rate when that karat isn't in the published table.
      const perGram =
        goldBuyByKarat[String(asset.karat)] ??
        (goldBuyByKarat['24'] != null
          ? (goldBuyByKarat['24'] * asset.karat) / 24
          : null);
      if (perGram == null) {
        return { value: null, priceUnavailable: true };
      }
      const grams = Number(asset.weightGrams);
      const value = Math.round(grams * perGram * 100) / 100;
      return { value, priceUnavailable: false };
    }
    if (asset.type === 'SILVER') {
      if (silverPerGramPure == null || asset.weightGrams == null) {
        return { value: null, priceUnavailable: true };
      }
      const grams = Number(asset.weightGrams);
      const permille = asset.purityPermille ?? DEFAULT_SILVER_PERMILLE;
      const value =
        Math.round(grams * silverPerGramPure * (permille / 1000) * 100) / 100;
      return { value, priceUnavailable: false };
    }
    // CASH / OTHER
    return {
      value: asset.amount != null ? Number(asset.amount) : 0,
      priceUnavailable: false,
    };
  }

  async list(userId: string) {
    const [assets, goldPrice, silver] = await Promise.all([
      this.prisma.savingsAsset.findMany({
        where: { userId },
        include: { debtRepayment: { select: { id: true, debtId: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.goldPrice.getGoldPrice(),
      this.goldPrice.getSilverPerGramPure(),
    ]);

    const goldBuyByKarat = goldPrice?.perGramBuyByKarat ?? null;
    const silverPerGramPure = silver?.perGram ?? null;

    const valued: ValuedAsset[] = [];
    for (const asset of assets) {
      const { value, priceUnavailable } = this.valueOne(
        asset,
        goldBuyByKarat,
        silverPerGramPure,
      );
      valued.push({ ...asset, value, priceUnavailable });
    }

    const total = valued.reduce((s, a) => s + (a.value ?? 0), 0);
    const byType = valued.reduce<Record<string, number>>((acc, a) => {
      acc[a.type] = (acc[a.type] ?? 0) + (a.value ?? 0);
      return acc;
    }, {});

    return {
      currency: VALUATION_CURRENCY,
      total: Math.round(total * 100) / 100,
      byType,
      goldPrice,
      assets: valued,
    };
  }

  /** Total savings value in JOD — used by the dashboard. */
  async total(userId: string): Promise<number> {
    const { total } = await this.list(userId);
    return total;
  }

  /**
   * Resolves the stored gold fields from the DTO. For counted coin forms
   * (e.g. Rashadi lira) the total grams and karat are derived from the
   * quantity and the form's fixed spec, so they stay accurate regardless of
   * what the client sent. Bars/jewellery keep the entered grams and karat.
   */
  private resolveGoldFields(dto: {
    goldForm?: string;
    quantity?: number;
    weightGrams?: number;
    karat?: number;
  }): {
    weightGrams: number | null;
    karat: number | null;
    goldForm: string | null;
    quantity: number | null;
  } {
    const spec = dto.goldForm ? GOLD_FORMS[dto.goldForm] : undefined;
    if (spec?.counted && spec.gramsPerUnit != null) {
      const qty = dto.quantity ?? 1;
      return {
        weightGrams: roundGrams(qty * spec.gramsPerUnit),
        karat: spec.karat,
        goldForm: dto.goldForm ?? null,
        quantity: qty,
      };
    }
    return {
      weightGrams: dto.weightGrams ?? null,
      karat: dto.karat ?? null,
      goldForm: dto.goldForm ?? null,
      quantity: null,
    };
  }

  async create(userId: string, dto: CreateSavingsAssetDto) {
    this.validate(dto);
    const gold = dto.type === 'GOLD' ? this.resolveGoldFields(dto) : null;
    return this.prisma.savingsAsset.create({
      data: {
        userId,
        type: dto.type,
        name: dto.name,
        weightGrams: gold
          ? gold.weightGrams
          : dto.type === 'SILVER'
            ? (dto.weightGrams ?? null)
            : null,
        karat: gold?.karat ?? null,
        goldForm: gold?.goldForm ?? null,
        quantity: gold?.quantity ?? null,
        purityPermille:
          dto.type === 'SILVER' ? (dto.purityPermille ?? null) : null,
        amount:
          dto.type === 'CASH' || dto.type === 'OTHER'
            ? (dto.amount ?? null)
            : null,
        notes: dto.notes,
      },
    });
  }

  private async findOwn(userId: string, id: string) {
    const asset = await this.prisma.savingsAsset.findFirst({
      where: { id, userId },
      include: { debtRepayment: { select: { id: true, debtId: true } } },
    });
    if (!asset) throw new NotFoundException('Savings asset not found');
    return asset;
  }

  async update(userId: string, id: string, dto: UpdateSavingsAssetDto) {
    const existing = await this.findOwn(userId, id);
    if (existing.debtRepayment) {
      throw new BadRequestException(
        'Edit this cash repayment from its debt record.',
      );
    }
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.notes !== undefined) data.notes = dto.notes;

    if (existing.type === 'GOLD') {
      // Merge the incoming form/quantity/grams over what's stored, then let
      // resolveGoldFields recompute grams+karat for counted coin forms.
      const gold = this.resolveGoldFields({
        goldForm: dto.goldForm ?? existing.goldForm ?? undefined,
        quantity: dto.quantity ?? existing.quantity ?? undefined,
        weightGrams:
          dto.weightGrams ??
          (existing.weightGrams != null
            ? Number(existing.weightGrams)
            : undefined),
        karat: dto.karat ?? existing.karat ?? undefined,
      });
      data.goldForm = gold.goldForm;
      data.quantity = gold.quantity;
      data.weightGrams = gold.weightGrams;
      data.karat = gold.karat;
    } else {
      if (dto.weightGrams !== undefined) data.weightGrams = dto.weightGrams;
      if (dto.karat !== undefined) data.karat = dto.karat;
      if (dto.purityPermille !== undefined) {
        data.purityPermille = dto.purityPermille;
      }
      if (dto.amount !== undefined) data.amount = dto.amount;
    }

    return this.prisma.savingsAsset.update({ where: { id }, data });
  }

  async remove(userId: string, id: string) {
    const asset = await this.findOwn(userId, id);
    if (asset.debtRepayment) {
      throw new BadRequestException(
        'Delete this cash repayment from its debt record.',
      );
    }
    await this.prisma.savingsAsset.delete({ where: { id } });
    return { message: 'Deleted' };
  }
}
