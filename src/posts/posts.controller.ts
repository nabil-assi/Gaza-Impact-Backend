import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get('initiative/:initiativeId')
  findByInitiative(@Param('initiativeId') initiativeId: string) {
    return this.postsService.findByInitiative(initiativeId);
  }
// أضف هذه الدالة في ملف posts.controller.ts
@Get(':id')
findOne(@Param('id') id: string) {
  return this.postsService.findOne(id);
}
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

@UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}