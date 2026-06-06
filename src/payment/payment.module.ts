import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { DonationsModule } from '../donations/donations.module'; // سنربطه لاحقاً

@Module({
  imports: [HttpModule, DonationsModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}