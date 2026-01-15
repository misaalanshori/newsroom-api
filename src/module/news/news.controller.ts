import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/createNews.dto';
import { UpdateNewsDto } from './dto/updateNews.dto';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';
import type { JwtPayload } from '../auth/guards/jwt-auth.guard';

@Controller('news')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NewsController {
  constructor(private readonly newsService: NewsService) { }

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
  async create(@Body() createNewsDto: CreateNewsDto, @User() user: JwtPayload) {
    return await this.newsService.create(
      createNewsDto,
      user.sub,
      user.departmentId,
    );
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
