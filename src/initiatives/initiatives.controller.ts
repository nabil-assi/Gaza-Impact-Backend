import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { InitiativesService } from './initiatives.service';
import { CreateInitiativeDto } from './dto/create-initiative.dto';
import { UpdateInitiativeDto } from './dto/update-initiative.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@Controller('initiatives')
export class InitiativesController {
  constructor(private readonly initiativesService: InitiativesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createInitiativeDto: CreateInitiativeDto) {
    return this.initiativesService.create(createInitiativeDto);
  }

  @Get()
  findAll() {
    return this.initiativesService.findAllActive();
  } 

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.initiativesService.getById(id);
  } 

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.initiativesService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateInitiativeDto: UpdateInitiativeDto) {
    return this.initiativesService.update(id, updateInitiativeDto);
  }

  @UseGuards(JwtAuthGuard) 
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.initiativesService.delete(id);
  }
}