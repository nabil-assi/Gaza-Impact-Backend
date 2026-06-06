import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Initiative } from '../../initiatives/entities/initiative.entity';
import { Post } from '../../posts/entities/post.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Initiative)
    private readonly initiativeRepository: Repository<Initiative>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async getOverviewStats() {
    // 1. جلب المبادرات بشكل آمن وحساب المبالغ
    const initiatives = await this.initiativeRepository.find();

    const totalRaised = initiatives.reduce((sum, init) => {
      const val = parseFloat(String(init.raisedAmount || '0'));
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    const activeCount = initiatives.filter((init) => init.isActive).length;
    const pendingVerifications = 3; 

    // 2. تجهيز أعلى 5 مبادرات
    const topInitiatives = [...initiatives]
      .sort((a, b) => {
        const valA = parseFloat(String(a.raisedAmount || '0'));
        const valB = parseFloat(String(b.raisedAmount || '0'));
        return (isNaN(valB) ? 0 : valB) - (isNaN(valA) ? 0 : valA);
      })
      .slice(0, 5)
      .map((init) => ({
        name: init.title && init.title.length > 20
          ? init.title.substring(0, 17) + '...'
          : init.title || 'مبادرة بدون عنوان',
        goal: parseFloat(String(init.targetAmount || '0')),
        raised: parseFloat(String(init.raisedAmount || '0')),
        image: init.images?.[0] || '',
      }));

    // 3. توليد بيانات التبرعات لـ 30 يوماً
    const donationTrend: { date: string; raised: number }[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      donationTrend.push({
        date: dayName,
        raised: Math.floor(Math.random() * 2000) + 300,
      });
    }

    // 4. التعديل الجوهري: جلب آخر النشاطات باستخدام نمط الـ Array للـ relations لمنع أخطاء التفسير
    // جلب آخر النشاطات المتوافقة مع النوع الحديث لـ FindOptionsRelations
const recentPosts = await this.postRepository.find({
  relations: {
    initiative: true, // تفعيل العلاقة ككائن صريح متوافق مع نسخة TypeORM الحالية
  },
  order: { 
    createdAt: 'DESC' 
  },
  take: 5,
});
    const recentActivity = recentPosts.map((post) => ({
      id: post.id,
      type: 'post',
      description: `تم نشر تحديث جديد: ${post.title}`,
      time: post.createdAt 
        ? new Date(post.createdAt).toLocaleDateString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        : 'الآن',
      amount: null,
    }));

    return {
      metrics: {
        totalRaised,
        activeCount,
        totalInitiatives: initiatives.length,
        pendingVerifications,
      },
      donationTrend,
      topInitiatives,
      recentActivity,
    };
  }
}