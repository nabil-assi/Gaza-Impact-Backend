import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Initiative } from './entities/initiative.entity';
import { CreateInitiativeDto } from './dto/create-initiative.dto';
import { UpdateInitiativeDto } from './dto/update-initiative.dto';

@Injectable()
export class InitiativesService {
  constructor(
    @InjectRepository(Initiative)
    private readonly initiativeRepository: Repository<Initiative>,
  ) {}

  // 1. إنشاء مبادرة جديدة
  async create(createInitiativeDto: CreateInitiativeDto): Promise<Initiative> {
    // التأكد من أن الـ slug غير مكرر لمنع تداخل الروابط
    const existing = await this.initiativeRepository.findOne({ where: { slug: createInitiativeDto.slug } });
    if (existing) {
      throw new ConflictException('Slug already exists! Please use a unique identifier.');
    }

    const initiative = this.initiativeRepository.create({
      ...createInitiativeDto,
      createdBy: 'ADMIN_TEMP_ID', // معرف مؤقت حتى نقوم بتركيب الـ Auth لاحقاً
    });

    return await this.initiativeRepository.save(initiative);
  }

  // 2. جلب جميع المبادرات النشطة (تظهر للمتبرعين)
  async findAllActive(): Promise<Initiative[]> {
    return await this.initiativeRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' }, // الأحدث أولاً
    });
  }

  // 3. جلب تفاصيل مبادرة واحدة عن طريق الـ Slug (رابط الصفحة)
  async findBySlug(slug: string): Promise<Initiative> {
    const initiative = await this.initiativeRepository.findOne({ where: { slug } });
    if (!initiative) {
      throw new NotFoundException(`Initiative with slug "${slug}" not found`);
    }
    return initiative;
  }

  // 4. تحديث بيانات المبادرة (لوحة تحكم الآدمن)
 async update(id: string, updateInitiativeDto: UpdateInitiativeDto): Promise<Initiative> {
  // 1. جلب المبادرة الحالية بالكامل من قاعدة البيانات
  const initiative = await this.initiativeRepository.findOne({ where: { id } });
  
  if (!initiative) {
    throw new NotFoundException(`Initiative with ID "${id}" not found`);
  }

  // 2. تحديث الحقول الممررة فقط وتجنب الخصائص الـ undefined
  Object.assign(initiative, {
    title: updateInitiativeDto.title ?? initiative.title,
    slug: updateInitiativeDto.slug ?? initiative.slug,
    description: updateInitiativeDto.description ?? initiative.description,
    targetAmount: updateInitiativeDto.targetAmount ?? initiative.targetAmount,
    currency: updateInitiativeDto.currency ?? initiative.currency,
    images: updateInitiativeDto.images ?? initiative.images,
    // هنا نضمن أنه لو كان undefined في الـ DTO فلن يلمس القيمة الحالية في الداتابيز
    isActive: updateInitiativeDto.isActive !== undefined ? updateInitiativeDto.isActive : initiative.isActive,
  });

  // 3. حفظ الكائن المحدث بشكل آمن
  return await this.initiativeRepository.save(initiative);
}
  async delete(id: string): Promise<void> {
    const initiative = await this.initiativeRepository.findOne({ where: { id } });
    if (!initiative) {
      throw new NotFoundException(`Initiative with ID "${id}" not found`);
    }
    await this.initiativeRepository.remove(initiative);
  }
  async getById(id: string): Promise<Initiative> {
    const initiative = await this.initiativeRepository.findOne({ where: { id } });
    if (!initiative) {
      throw new NotFoundException(`Initiative with ID "${id}" not found`);
    }
    return initiative;
  }


  async findOneWithDonations(id: string): Promise<Initiative> {
  const initiative = await this.initiativeRepository.findOne({
    where: { id },
  });

  if (!initiative) {
    throw new NotFoundException('المبادرة غير موجودة');
  }
  return initiative;
}
}