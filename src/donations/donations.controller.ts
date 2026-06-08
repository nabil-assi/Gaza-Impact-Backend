import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DonationsService } from './donations.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { VerifyDonationDto } from './dto/verify-donation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Post()
  create(@Body() createDonationDto: CreateDonationDto) {
    return this.donationsService.create(createDonationDto);
  }

  @Post(':id/checkout')
  async createCheckout(@Param('id') id: string) {
    return await this.donationsService.createBinanceOrder(id);
  }

  @Post('webhook/binance')
  @HttpCode(HttpStatus.OK)
  async handleBinanceWebhook(
    @Body() body: any,
    @Headers('binance-pay-signature') signature: string,
  ) {
    // نستخدم الـ HTTP 200 OK دائماً لأن بينانس تتوقع هذا الرد لتوقف إعادة الإرسال
    return await this.donationsService.processBinancePayment(body, signature);
  }

  @Get()
  findAll() {
    return this.donationsService.findAll();
  }

  @Get('track/:referenceId')
  findByReference(@Param('referenceId') referenceId: string) {
    return this.donationsService.findByReference(referenceId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/verify')
  verifyDonation(
    @Param('id') id: string,
    @Body() verifyDonationDto: VerifyDonationDto,
  ) {
    return this.donationsService.verifyDonation(id, verifyDonationDto.status);
  }
}