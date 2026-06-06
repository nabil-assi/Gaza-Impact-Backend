import { Controller, Post, UseInterceptors, UploadedFile, UploadedFiles, BadRequestException, Req } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import express from 'express'; // استيراد كائن الـ Request من Express
import { imageFileFilter, editFileName } from './utils/file-upload.utils';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {

  // 1. رفع صورة واحدة ديناميكية
  @Post('single')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
   uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: express.Request) {
    if (!file) {
      throw new BadRequestException('File upload failed or file missing.');
    }

    // استخراج البروتوكول (http/https) والـ Host (localhost:3000 أو الدومين الحقيقي) تلقائياً
    const protocol = req.protocol;
    const host = req.get('host');

    return {
      imageUrl: `${protocol}://${host}/uploads/${file.filename}`,
    };
  }

  // 2. رفع عدة صور معاً ديناميكية
  @Post('multiple')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[], @Req() req: express.Request) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded.');
    }

    const protocol = req.protocol;
    const host = req.get('host');
    
    // بناء مصفوفة الروابط ديناميكياً بناءً على السيرفر الحالي
    const urls = files.map(file => `${protocol}://${host}/uploads/${file.filename}`);
    return { imageUrls: urls };
  }
}