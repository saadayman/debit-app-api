import { JobType } from '@prisma/client';
export declare class CreateJobDto {
    name: string;
    type: JobType;
    employer?: string;
    expectedAmount?: number;
    payDayOfMonth?: number | null;
    active?: boolean;
    notes?: string;
}
declare const UpdateJobDto_base: import("@nestjs/common").Type<Partial<CreateJobDto>>;
export declare class UpdateJobDto extends UpdateJobDto_base {
}
export {};
