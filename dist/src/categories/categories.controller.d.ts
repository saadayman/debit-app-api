import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesController {
    private categories;
    constructor(categories: CategoriesService);
    list(user: AuthUser): Promise<{
        id: string;
        name: string;
        nameAr: string | null;
        icon: string | null;
        color: string | null;
        isDefault: boolean;
        userId: string | null;
        createdAt: Date;
    }[]>;
    create(user: AuthUser, dto: CreateCategoryDto): import("@prisma/client").Prisma.Prisma__CategoryClient<{
        id: string;
        name: string;
        nameAr: string | null;
        icon: string | null;
        color: string | null;
        isDefault: boolean;
        userId: string | null;
        createdAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(user: AuthUser, id: string, dto: UpdateCategoryDto): Promise<{
        id: string;
        name: string;
        nameAr: string | null;
        icon: string | null;
        color: string | null;
        isDefault: boolean;
        userId: string | null;
        createdAt: Date;
    }>;
    remove(user: AuthUser, id: string): Promise<{
        message: string;
    }>;
}
