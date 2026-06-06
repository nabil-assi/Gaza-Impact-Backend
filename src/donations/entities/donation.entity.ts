import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Initiative } from '../../initiatives/entities/initiative.entity';

@Entity('donations')
export class Donation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  referenceId!: string; // الرقم المرجعي للتبرع الخاص بموقعنا

  @Column({ type: 'uuid' })
  initiativeId!: string; // معرف المبادرة المستهدفة

  // إعداد العلاقة الربطية مع جدول المبادرات
  @ManyToOne(() => Initiative, (initiative) => initiative.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'initiativeId' })
  initiative!: Initiative;

  // بيانات المتبرع (كلها اختيارية وقابلة للنقص لحماية الخصوصية)
  @Column({ type: 'varchar', length: 255, nullable: true })
  donorName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  donorEmail?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  donorPhone?: string;

  @Column({ type: 'text', nullable: true })
  message?: string;

  // البيانات المالية الصارمة
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', length: 10, default: 'USDT' })
  currency!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  chargedAmount!: number;

  @Column({ type: 'varchar', length: 10 })
  chargedCurrency!: string;

  // بيانات الدفع
  @Column({ type: 'enum', enum: ['Binance_Pay', 'USDT_TRC20', 'Credit_Card'] })
  paymentMethod!: 'Binance_Pay' | 'USDT_TRC20' | 'Credit_Card';

  @Column({ type: 'varchar', length: 500, nullable: true })
  transactionReference?: string; // الـ Hash الخاص بالبلوكشين أو رقم البنك

  @Column({ type: 'enum', enum: ['pending', 'verified', 'failed'], default: 'pending' })
  status!: 'pending' | 'verified' | 'failed';

  // التوثيق والأثر
  @Column({ type: 'text', array: true, default: '{}' })
  proofImages!: string[];

  @Column({ type: 'boolean', default: false })
  isReceiptSent!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}