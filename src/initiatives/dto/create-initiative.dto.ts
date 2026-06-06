import { IsString, IsNotEmpty, IsNumber, IsPositive, IsArray, IsOptional, IsUrl } from 'class-validator';

export class CreateInitiativeDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  @IsPositive()
  targetAmount!: number;

  @IsString()
  @IsNotEmpty()
  currency!: string;

  @IsArray()
  @IsString({ each: true })
  images!: string[];

  @IsOptional()
  @IsUrl()
  videoUrl?: string;
}