import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config'; // استيراد الـ ConfigService
import { Admin } from '../entities/admin.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
 constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('FATAL ERROR: JWT_SECRET is not defined in .env file!');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret, // هنا التايب سكريبت يعلم أنها مستحيل أن تكون undefined
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const { sub: id } = payload;
    const admin = await this.adminRepository.findOne({ where: { id } });

    if (!admin) {
      throw new UnauthorizedException('Access denied. Admin account not found.');
    }

    return { id: admin.id, email: admin.email, name: admin.name };
  }
}