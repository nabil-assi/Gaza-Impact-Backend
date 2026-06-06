import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Initiative } from '../../initiatives/entities/initiative.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'text', array: true, default: '{}' })
  images!: string[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  videoUrl?: string;

  @Column({ type: 'uuid', nullable: true })
  initiativeId?: string; // معرف المبادرة المرتبطة (nullable لأن هناك أخبار عامة لا تتبع حملة معينة)

  // إعداد العلاقة مع جدول المبادرات
  @ManyToOne(() => Initiative, (initiative) => initiative.id, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'initiativeId' })
  initiative?: Initiative;

  @Column({ type: 'varchar', length: 255 })
  createdBy!: string; // معرف الآدمن الذي قام بالنشر

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}