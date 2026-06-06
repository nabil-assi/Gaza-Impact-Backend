import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Initiative } from '../../initiatives/entities/initiative.entity'; // تأكد من صحة مسار الـ Entity عندك
import { Post } from '../../posts/entities/post.entity'; // تأكد من صحة مسار الـ Entity عندك

@Module({
  imports: [
    // تسجيل الـ Entities المطلوبة للحسابات الإحصائية داخل الـ Service
    TypeOrmModule.forFeature([Initiative, Post]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService], // تصديره اختياري في حال احتجت الإحصائيات في موديلات أخرى
})
export class DashboardModule {}