import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('initiatives') // اسم الجدول في قاعدة البيانات
export class Initiative {
  @PrimaryGeneratedColumn('uuid') // توليد معرف فريد تلقائياً بنظام UUID
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 255, unique: true }) // الـ slug يجب أن يكون فريداً لمنع تكرار الروابط
  slug!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 }) // دقة عشرية للمبالغ المالية
  targetAmount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  raisedAmount!: number;

  @Column({ type: 'varchar', length: 10, default: 'USDT' })
  currency!: string;

  @Column({ type: 'text', array: true, default: '{}' }) // مصفوفة نصوص لتخزين روابط الصور في Postgres
  images!: string[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  videoUrl?: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'varchar', length: 255 })
  createdBy!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}