import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    list(userId: string): Promise<{
        id: string;
        name: string;
        nameAr: string | null;
        icon: string | null;
        color: string | null;
        isDefault: boolean;
        userId: string | null;
        createdAt: Date;
    }[]>;
    create(userId: string, dto: CreateCategoryDto): Prisma.Prisma__CategoryClient<{
        id: string;
        name: string;
        nameAr: string | null;
        icon: string | null;
        color: string | null;
        isDefault: boolean;
        userId: string | null;
        createdAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    private findOwn;
    update(userId: string, id: string, dto: UpdateCategoryDto): Promise<{
        id: string;
        name: string;
        nameAr: string | null;
        icon: string | null;
        color: string | null;
        isDefault: boolean;
        userId: string | null;
        createdAt: Date;
    }>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
}
