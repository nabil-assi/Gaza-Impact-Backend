import {
  Injectable,
  UnauthorizedException,
  OnModuleInit,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Admin } from './entities/admin.entity';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly jwtService: JwtService,
  ) {}
  async onModuleInit() {
    const adminCount = await this.adminRepository.count();
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('Admin@Gaza2026', 10);
      const defaultAdmin = this.adminRepository.create({
        name: 'المشرف العام',
        email: 'admin@gazaimpact.com',
        password: hashedPassword,
      });
      await this.adminRepository.save(defaultAdmin);
      console.log(
        '--- DEFAULT ADMIN ACCOUNT CREATED (admin@gazaimpact.com) ---',
      );
    }
  }

  // منطق تسجيل الدخول
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. البحث عن الآدمن بالإيميل
    const admin = await this.adminRepository.findOne({ where: { email } });
    if (!admin) {
      throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور خاطئة');
    }

    // 2. مقارنة كلمة المرور المشفرة
    const isPasswordMatching = await bcrypt.compare(password, admin.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور خاطئة');
    }

    // 3. توليد الـ JWT Token وضخ بيانات الآدمن بداخلها
    const payload = { sub: admin.id, email: admin.email, name: admin.name };

    return {
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
      accessToken: this.jwtService.sign(payload),
    };
  }
  async getAdminProfile(userId: string) {
    const user = await this.adminRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(
        'حساب الأدمن غير موجود في النظام أو تم حذفه.',
      );
    }

    return user;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.adminRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود.');
    }

    // إذا كان الأدمن يريد تغيير البريد الإلكتروني، نتحقق أولاً أنه غير محجوز لحساب آخر
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const emailExists = await this.adminRepository.findOne({
        where: { email: updateProfileDto.email },
      });
      if (emailExists) {
        throw new ConflictException(
          'البريد الإلكتروني مُستخدم بالفعل من قِبل حساب آخر.',
        );
      }
    }

    // دمج البيانات الجديدة وحفظها
    Object.assign(user, updateProfileDto);
    await this.adminRepository.save(user);

    // إرجاع البيانات المحدثة بدون كلمة المرور
    const { password, ...result } = user;
    return result;
  }
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    // جلب الأدمن مع إجبار اختيار حقل الباسورد لتفادي مشكلة الـ select: false
    const user = await this.adminRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      throw new NotFoundException('حساب الأدمن غير موجود.');
    }

    // التحقق من كلمة المرور الحالية
    const isOldPasswordValid = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('كلمة المرور الحالية غير صحيحة.');
    }

    // تشفير كلمة المرور الجديدة وتحديثها
    user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.adminRepository.save(user);

    return { message: 'تم تغيير كلمة المرور بنجاح.' };
  }
}
