import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Donation } from './entities/donation.entity';
import { Initiative } from '../initiatives/entities/initiative.entity';
import { CreateDonationDto } from './dto/create-donation.dto';
import { generateBinanceSignature } from '../common/utils/binance-crypto.util';
import * as crypto from 'crypto';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(Donation)
    private readonly donationRepository: Repository<Donation>,
    private readonly dataSource: DataSource,
  ) {}

  // 1. إنشاء تبرع جديد (حالة pending)
  async create(createDonationDto: CreateDonationDto): Promise<Donation> {
    const initiativeExists = await this.dataSource
      .getRepository(Initiative)
      .findOne({
        where: { id: createDonationDto.initiativeId, isActive: true },
      });

    if (!initiativeExists) throw new NotFoundException('Initiative not found');

    const generatedReferenceId = `IMPACT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const donation = this.donationRepository.create({
      ...createDonationDto,
      referenceId: generatedReferenceId,
      status: 'pending',
    });

    return await this.donationRepository.save(donation);
  }

  // 2. جلب جميع التبرعات
  async findAll(): Promise<Donation[]> {
    return await this.donationRepository.find({
      relations: { initiative: true },
      order: { createdAt: 'DESC' },
    });
  }

  // 3. جلب تبرع عبر المرجع
  async findByReference(referenceId: string): Promise<Donation> {
    const donation = await this.donationRepository.findOne({
      where: { referenceId },
      relations: { initiative: true },
    });
    if (!donation) throw new NotFoundException('Donation not found');
    return donation;
  }

  // 4. معالجة إشعار باينانس (Webhook) - التوثيق التلقائي
  async processBinancePayment(body: any, signature: string) {
    const secretKey = process.env.BINANCE_SECRET_KEY;
    if (!secretKey) {
      throw new BadRequestException('Binance secret key not configured');
    }
    const payload = JSON.stringify(body);

    const expectedSignature = generateBinanceSignature(payload, secretKey);

    if (signature !== expectedSignature) {
      throw new BadRequestException('Invalid signature');
    }

    const { merchantTradeNo, status } = body;

    // باينانس ترسل SUCCESS عند اكتمال الدفع
    if (status === 'SUCCESS') {
      const donation = await this.donationRepository.findOne({
        where: { referenceId: merchantTradeNo },
        relations: { initiative: true },
      });

      if (donation && donation.status === 'pending') {
        return await this.completeOnlineDonation(donation.id);
      }
    }
    return { success: false };
  }

  // 5. التحقق المالي (Transaction)
  async completeOnlineDonation(donationId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const donation = await queryRunner.manager.findOne(Donation, {
        where: { id: donationId },
        relations: { initiative: true },
      });

      if (!donation || donation.status === 'verified')
        throw new NotFoundException('Invalid or already processed donation');

      donation.status = 'verified';
      await queryRunner.manager.save(donation);

      const initiative = donation.initiative;
      initiative.raisedAmount =
        Number(initiative.raisedAmount) + Number(donation.amount);
      await queryRunner.manager.save(initiative);

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // 6. التحقق اليدوي للآدمن
  async verifyDonation(
    id: string,
    status: 'verified' | 'failed',
  ): Promise<Donation> {
    // نفس منطق التحقق اليدوي اللي عندك، اتركه كما هو
    // ...
    return {} as Donation; // (ضع الكود الأصلي هنا)
  }
}
