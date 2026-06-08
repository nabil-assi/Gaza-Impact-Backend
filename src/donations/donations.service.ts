import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Donation } from './entities/donation.entity';
import { Initiative } from '../initiatives/entities/initiative.entity';
import { Pay } from '@binance/connector';
import { CreateDonationDto } from './dto/create-donation.dto';

@Injectable()
export class DonationsService implements OnModuleInit {

  private payClient: Pay;

  constructor(
    @InjectRepository(Donation)
    private readonly donationRepository: Repository<Donation>,
    private readonly dataSource: DataSource,
  ) {}

  onModuleInit() {
    // استخدم مفاتيحك من ملف .env
    this.payClient = new Pay(
      process.env.BINANCE_API_KEY,
      process.env.BINANCE_SECRET_KEY,
      { baseURL: 'https://bpay.binanceapi.com' }
    );
  }
// 1. إنشاء تبرع جديد
  async create(createDonationDto: CreateDonationDto): Promise<Donation> {
    const initiativeExists = await this.dataSource.getRepository(Initiative).findOne({
      where: { id: createDonationDto.initiativeId, isActive: true },
    });

    if (!initiativeExists) throw new NotFoundException('Initiative not found or inactive');

    const generatedReferenceId = `IMPACT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const donation = this.donationRepository.create({
      ...createDonationDto,
      initiative: initiativeExists,
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

  // 4. التحقق اليدوي للآدمن
  async verifyDonation(id: string, status: 'verified' | 'failed'): Promise<Donation> {
    const donation = await this.donationRepository.findOne({ where: { id } });
    
    if (!donation) throw new NotFoundException('Donation not found');
    
    // منع تغيير حالة التبرع إذا كان قد تم التحقق منه مسبقاً
    if (donation.status === 'verified') {
        throw new BadRequestException('This donation is already verified');
    }

    donation.status = status;
    return await this.donationRepository.save(donation);
  }

  async createBinanceOrder(donationId: string) {
    const donation = await this.donationRepository.findOne({ 
      where: { id: donationId },
      relations: { initiative: true } 
    });

    if (!donation) throw new NotFoundException('Donation not found');

    // البيانات المطلوبة حسب الـ SDK
    const orderData = {
      env: { terminalType: 'WEB' },
      merchantTradeNo: donation.referenceId,
      orderAmount: Number(donation.amount),
      currency: 'USDT',
      goods: {
        goodsType: '01',
        goodsCategory: 'Z000',
        referenceGoodsId: donation.initiativeId,
        goodsName: donation.initiative?.title || 'Donation',
      }
    };

    try {
      const response = await this.payClient.createOrder(orderData);
      return response.data; // هذا يحتوي على checkoutUrl
    } catch (error) {
      console.error('Binance Order Error:', error?.response?.data || error.message);
      throw new BadRequestException('Payment gateway error');
    }
  }

  async processBinancePayment(body: any, signature: string) {
    // التحقق من التوقيع (المكتبة تتكفل بالتفاصيل خلف الكواليس إذا استخدمت أدواتها)
    const { merchantTradeNo, status } = body;

    if (status === 'SUCCESS') {
      const donation = await this.donationRepository.findOne({
        where: { referenceId: merchantTradeNo },
      });

      if (donation && donation.status === 'pending') {
        return await this.completeOnlineDonation(donation.id);
      }
    }
    return { success: false };
  }

  async completeOnlineDonation(donationId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const donation = await queryRunner.manager.findOne(Donation, { where: { id: donationId }, relations: { initiative: true } });
      if (!donation || donation.status === 'verified') throw new Error('Invalid status');

      donation.status = 'verified';
      await queryRunner.manager.save(donation);

      const initiative = donation.initiative;
      initiative.raisedAmount = Number(initiative.raisedAmount) + Number(donation.amount);
      await queryRunner.manager.save(initiative);

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}