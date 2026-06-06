import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { DonationsService } from './donations.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { VerifyDonationDto } from './dto/verify-donation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  // 1. تسجيل تبرع جديد
  @Post()
  create(@Body() createDonationDto: CreateDonationDto) {
    return this.donationsService.create(createDonationDto);
  }

  // 2. استقبال إشعار باينانس (Webhook) - هذا لا يحتاج لحماية بـ Guard لأنه مفتوح لباينانس
  @Post('webhook/binance')
  async handleBinanceWebhook(
    @Body() body: any,
    @Headers('binance-pay-signature') signature: string,
  ) {
    return await this.donationsService.processBinancePayment(body, signature);
  }

  // 3. جلب جميع التبرعات (للوحة تحكم الآدمن)
  @Get()
  findAll() {
    return this.donationsService.findAll();
  }

  // 4. تتبع تبرع معين عبر الرقم المرجعي
  @Get('track/:referenceId')
  findByReference(@Param('referenceId') referenceId: string) {
    return this.donationsService.findByReference(referenceId);
  }

  // 5. التحقق اليدوي (للآدمن)
  @UseGuards(JwtAuthGuard)
  @Patch(':id/verify')
  verifyDonation(
    @Param('id') id: string,
    @Body() verifyDonationDto: VerifyDonationDto,
  ) {
    return this.donationsService.verifyDonation(id, verifyDonationDto.status);
  }
}
