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
import {
  AuthzGuard,
  RequirePermission,
  AuthzService,
} from '../../common/authz';

@Controller('news')
@UseGuards(JwtAuthGuard, AuthzGuard)
@ApiBearerAuth()
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly authzService: AuthzService,
  ) { }

  @Get()
  @RequirePermission('news', 'read')
  async getAll() {
    return await this.newsService.getAll();
  }

  @Get(':id')
  @RequirePermission('news', 'read')
  @ApiParam({ name: 'id', required: true, description: 'News ID' })
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return await this.newsService.getOne(id);
  }

  @Post()
  async create(@Body() createNewsDto: CreateNewsDto, @User() user: JwtPayload) {
    // For creation, user becomes the writer and news goes to their dept (or specified dept)
    const targetDept = createNewsDto.departmentId ?? user.departmentId;
    await this.authzService.checkPermission(
      { id: user.sub, role: user.role, department: user.departmentId },
      { type: 'news', department: targetDept, writer: user.sub },
      'create',
    );
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
    @User() user: JwtPayload,
  ) {
    const news = await this.newsService.getOne(id);
    await this.authzService.checkPermission(
      { id: user.sub, role: user.role, department: user.departmentId },
      { type: 'news', department: news.departmentId, writer: news.writerId },
      'update',
    );
    return await this.newsService.update(id, updateNewsDto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', required: true, description: 'News ID' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @User() user: JwtPayload,
  ) {
    const news = await this.newsService.getOne(id);
    await this.authzService.checkPermission(
      { id: user.sub, role: user.role, department: user.departmentId },
      { type: 'news', department: news.departmentId, writer: news.writerId },
      'delete',
    );
    return await this.newsService.delete(id);
  }
}
