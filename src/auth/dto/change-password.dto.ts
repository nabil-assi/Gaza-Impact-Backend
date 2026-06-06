import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'كلمة المرور الحالية مطلوبة' })
  @IsString()
  oldPassword: string;

  @IsNotEmpty({ message: 'كلمة المرور الجديدة مطلوبة' })
  @IsString()
  @MinLength(8, { message: 'يجب أن لا تقل كلمة المرور الجديدة عن 8 خانات' })
  newPassword: string;
}