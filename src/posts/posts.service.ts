import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  // 1. إنشاء منشور توثيقي جديد
  async create(createPostDto: CreatePostDto): Promise<Post> {
    const post = this.postRepository.create({
      ...createPostDto,
      createdBy: 'ADMIN_TEMP_ID', // معرف مؤقت حتى تركيب الـ Auth
    });
    return await this.postRepository.save(post);
  }

  // 2. جلب جميع المنشورات (تظهر في صفحة الأخبار العامة للأحدث أولاً)
  async findAll(): Promise<Post[]> {
    return await this.postRepository.find({
      relations: {
        initiative: true, // جلب بيانات المبادرة المرتبطة بالمنشور إن وجدت
      },
      order: { createdAt: 'DESC' },
    });
  }

  // 3. جلب المنشورات التوثيقية التابعة لمبادرة معينة فقط
  async findByInitiative(initiativeId: string): Promise<Post[]> {
    return await this.postRepository.find({
      where: { initiativeId },
      order: { createdAt: 'DESC' },
    });
  }

  // 4. حذف منشور توثيقي (في حال الخطأ)
  async remove(id: string): Promise<{ message: string }> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post with ID "${id}" not found.`);
    }
    await this.postRepository.remove(post);
    return { message: 'Post deleted successfully.' };
  }
  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post with ID "${id}" not found.`);
    }
    Object.assign(post, updatePostDto);
    return await this.postRepository.save(post);
  }
  // أضف هذه الدالة في ملف posts.service.ts
async findOne(id: string): Promise<Post> {
  const post = await this.postRepository.findOne({ where: { id } });
  if (!post) {
    throw new NotFoundException(`Post with ID "${id}" not found.`);
  }
  return post;
}
}