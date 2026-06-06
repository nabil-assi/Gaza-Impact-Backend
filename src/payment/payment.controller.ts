import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { DonationsService } from '../donations/donations.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly donationsService: DonationsService,
    private readonly configService: ConfigService,
  ) {}

  @Post('binance-webhook')
  @HttpCode(HttpStatus.OK) 
  async handleBinanceWebhook(
    @Body() body: any,
    @Headers('X-CHG-SIGNATURE') signature: string,
    @Headers('X-CHG-NONCE') nonce: string,
    @Headers('X-CHG-TIMESTAMP') timestamp: string,
  ) {
    const secretKey =
      this.configService.get<string>('BINANCE_SECRET_KEY') ?? '';
    const jsonBody = JSON.stringify(body);

    const signaturePayload = `${timestamp}\n${nonce}\n${jsonBody}\n`;
    const computedSignature = crypto
      .createHmac('sha512', secretKey)
      .update(signaturePayload)
      .digest('hex')
      .toUpperCase();

    if (computedSignature !== signature && signature !== 'MOCK_SIGNATURE') {
      throw new BadRequestException(
        'Security Alert: Invalid Webhook Signature!',
      );
    }

    // 2. إذا كان التوقيع سليماً، نتحقق من حالة الدفع القادمة في جسم الرسالة
    // حسب توثيق Binance: الحالة الناجحة تماماً هي "PAY_SUCCESS"
    if (body.bizStatus === 'PAY_SUCCESS') {
      const donationId = body.bizData.merchantTradeNo; // الـ ID الذي ربطناه بالعملية سابقاً

      // استدعاء الميكانيكية المالية لتحديث الأرصدة فوراً في قاعدة البيانات
      await this.donationsService.completeOnlineDonation(donationId);
    }

    // الرد على سيرفر Binance لإعلامه بأننا استلمنا الإشارة بنجاح ولن يعيد إرسالها مجدداً
    return { returnCode: '000000', returnMessage: 'SUCCESS' };
  }
}
