import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min, MinLength, IsNumber, IsPositive } from 'class-validator';

export class CreateProductDto {
  @IsString() @MinLength(1) @MaxLength(64) sku!: string;
  @IsString() @MinLength(1) @MaxLength(160) name!: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsUUID() categoryId!: string;
  @IsOptional() @IsString() @MaxLength(24) unit?: string;
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) costPrice!: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) quantity?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) minStockLevel?: number;
}
export class UpdateProductDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(160) name?: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsOptional() @IsUUID() categoryId?: string;
  @IsOptional() @IsString() @MaxLength(24) unit?: string;
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) costPrice?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) minStockLevel?: number;
}
export class CreateCategoryDto {
  @IsString() @MinLength(1) @MaxLength(100) name!: string;
}
export class UpdateCategoryDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(100) name?: string;
}
export class StockOperationDto {
  @IsUUID() productId!: string;
  @Type(() => Number) @IsInt() @IsPositive() quantity!: number;
  @IsOptional() @IsString() @MaxLength(500) note?: string;
}
export class MovementQueryDto {
  @IsOptional() @IsUUID() productId?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit = 20;
}
