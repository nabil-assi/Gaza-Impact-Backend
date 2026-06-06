import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

// 1. فلترة الملفات وقبول الصور فقط
export const imageFileFilter = (req: any, file: any, callback: any) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
    return callback(new BadRequestException('Only image files (jpg, jpeg, png, webp) are allowed!'), false);
  }
  callback(null, true);
};

// 2. توليد اسم فريد لكل ملف مرفوع
export const editFileName = (req: any, file: any, callback: any) => {
  const name = file.originalname.split('.')[0].replace(/\s+/g, '-'); // استبدال المسافات بشرطات
  const fileExtName = extname(file.originalname);
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  
  callback(null, `${name}-${Date.now()}-${randomName}${fileExtName}`);
};