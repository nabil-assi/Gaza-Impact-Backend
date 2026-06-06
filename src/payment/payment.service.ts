import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  constructor(private readonly configService: ConfigService) {}

  // دالة لتوليد التوقيع المشفر المطلوب من Binance
  private generateSignature(payload: string, secretKey: string, nonce: string, timestamp: number): string {
    const signaturePayload = `${timestamp}\n${nonce}\n${payload}\n`;
    return crypto
      .createHmac('sha512', secretKey)
      .update(signaturePayload)
      .digest('hex')
      .toUpperCase();
  }

  // دالة إنشاء طلب دفع جديد لـ Binance Pay
  async createBinanceOrder(donationId: string, amount: number, initiativeTitle: string) {
    const apiUrl = this.configService.get<string>('BINANCE_PAY_API_URL');
    const apiKey = this.configService.get<string>('BINANCE_API_KEY');
    const secretKey = this.configService.get<string>('BINANCE_SECRET_KEY');

    const endpoint = '/binancepay/openapi/v3/order';
    const nonce = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();

    // تجهيز بيانات الطلب حسب توثيق Binance
    const body = {
      env: { terminalType: 'WEB' },
      merchantTradeNo: donationId, // نربط رقم العملية بـ ID التبرع لدينا في قاعدة البيانات
      orderAmount: amount.toFixed(2),
      currency: 'USDT',
      goods: {
        goodsType: '01',
        goodsCategory: 'Donation',
        referenceGoodsId: donationId,
        goodsName: initiativeTitle.substring(0, 50),
      },
    };

    const jsonBody = JSON.stringify(body);
    const signature = this.generateSignature(jsonBody, secretKey!, nonce, timestamp);

    try {
      const response = await axios.post(`${apiUrl}${endpoint}`, body, {
        headers: {
          'Content-Type': 'application/json',
          'X-CHG-APIKEY': apiKey,
          'X-CHG-SIGNATURE': signature,
          'X-CHG-NONCE': nonce,
          'X-CHG-TIMESTAMP': timestamp,
        },
      });

      if (response.data.status === 'SUCCESS') {
        return {
          universalUrl: response.data.data.universalUrl, // رابط الدفع الذي سيفتح للمتبرع
          prepayId: response.data.data.prepayId,
        };
      }
      throw new InternalServerErrorException('Binance Pay order creation failed');
    } catch (error: any) {
      console.error('Binance Pay Error:', error.response?.data || error.message);
      throw new InternalServerErrorException('Payment gateway communication error');
    }
  }
}