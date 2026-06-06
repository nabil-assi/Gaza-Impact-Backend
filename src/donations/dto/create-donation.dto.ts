import { IsString, IsNotEmpty, IsNumber, IsPositive, IsOptional, IsEmail, IsIn } from 'class-validator';

export class CreateDonationDto {
  @IsString()
  @IsNotEmpty()
  initiativeId!: string;

  @IsOptional()
  @IsString()
  donorName?: string;

  @IsOptional()
  @IsEmail()
  donorEmail?: string;

  @IsOptional()
  @IsString()
  donorPhone?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  currency!: string;

  @IsNumber()
  @IsPositive()
  chargedAmount!: number;

  @IsString()
  @IsNotEmpty()
  chargedCurrency!: string;

  @IsString()
  @IsIn(['Binance_Pay', 'USDT_TRC20', 'Credit_Card'])
  paymentMethod!: 'Binance_Pay' | 'USDT_TRC20' | 'Credit_Card';

  @IsOptional()
  @IsString()
  transactionReference?: string;
}