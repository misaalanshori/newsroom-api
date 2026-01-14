import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/createNews.dto';
import { UpdateNewsDto } from './dto/updateNews.dto';
import { ApiParam } from '@nestjs/swagger';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  async getAll() {
    return await this.newsService.getAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', required: true, description: 'News ID' })
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return await this.newsService.getOne(id);
  }

  @Post()
  async create(@Body() createNewsDto: CreateNewsDto) {
    return await this.newsService.create(createNewsDto);
  }

  @Put(':id')
  @ApiParam({ name: 'id', required: true, description: 'News ID' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNewsDto: UpdateNewsDto,
  ) {
    return await this.newsService.update(id, updateNewsDto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', required: true, description: 'News ID' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.newsService.delete(id);
  }
}
