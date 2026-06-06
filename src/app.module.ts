import { Module } from '@nestjs/common';
import { InitiativesModule } from './initiatives/initiatives.module';
import { DonationsModule } from './donations/donations.module';
import { PostsModule } from './posts/posts.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadsModule } from './uploads/uploads.module';
import { AuthModule } from './auth/auth.module';
import { PaymentModule } from './payment/payment.module';
import { DashboardModule } from './auth/dashboard/dashboard.module';

@Module({
 imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule,AuthModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true, 
        synchronize: true, 
        extra: process.env.NODE_ENV === 'production' ? {
    ssl: {
      rejectUnauthorized: false,
    },
  } : {},
      }),
    }), // الفاصلة هنا طبيعية لفصل الـ Modules
    InitiativesModule,
    DonationsModule,
    PostsModule,
    UploadsModule,
    AuthModule,
    PaymentModule,
    DashboardModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
