import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InitiativesService } from './initiatives.service';
import { InitiativesController } from './initiatives.controller';
import { Initiative } from './entities/initiative.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Initiative])], // تسجيل الجدول هنا
  controllers: [InitiativesController],
  providers: [InitiativesService],
  exports: [TypeOrmModule], // سنحتاجه لاحقاً عند ربط التبرعات بالمبادرات
})
export class InitiativesModule {}