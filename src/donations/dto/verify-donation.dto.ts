import { IsEnum, IsNotEmpty } from 'class-validator';

export class VerifyDonationDto {
  @IsEnum(['verified', 'failed'])
  @IsNotEmpty()
  status!: 'verified' | 'failed';
}