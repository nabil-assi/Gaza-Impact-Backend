import { IsString, IsNotEmpty, IsArray, IsOptional, IsUrl } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsArray()
  @IsString({ each: true })
  images!: string[];

  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  initiativeId?: string;
}