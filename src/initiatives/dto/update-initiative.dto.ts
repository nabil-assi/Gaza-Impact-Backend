import { 
  IsString, 
  IsNumber, 
  IsBoolean, 
  IsOptional, 
  IsArray, 
  IsNotEmpty, 
  Min 
} from 'class-validator';

export class UpdateInitiativeDto {
  
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'عنوان المبادرة لا يمكن أن يكون فارغاً' })
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'المعرف النصي (Slug) مطلوب' })
  slug?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'وصف المبادرة مطلوب' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'المبلغ المستهدف يجب أن يكون رقماً صحيحاً' })
  @Min(1, { message: 'المبلغ المستهدف يجب أن يكون أكبر من صفر' })
  targetAmount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsArray({ message: 'الصور يجب أن تُمرر على هيئة مصفوفة نصوص' })
  @IsString({ each: true, message: 'رابط الصورة يجب أن يكون نصاً صحيحاً' })
  images?: string[];

  // الحقل الحرج الذي كان يسبب الأزمة — تم تأمينه كاختياري تماماً
  @IsOptional()
  @IsBoolean({ message: 'حالة النشاط يجب أن تكون قيمة منطقية (true/false)' })
  isActive?: boolean;
}