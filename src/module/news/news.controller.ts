import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
  AuthResource,
} from '../../common/authz';

@Controller('news')
@UseGuards(JwtAuthGuard, AuthzGuard)
@ApiBearerAuth()
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly authzService: AuthzService,
  ) {}

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
    await this.checkNewsWritePermission(user, {
      departmentId: targetDept,
      writerId: user.sub,
    });
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
    await this.checkNewsWritePermission(user, news);
    return await this.newsService.update(id, updateNewsDto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', required: true, description: 'News ID' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @User() user: JwtPayload,
  ) {
    const news = await this.newsService.getOne(id);
    await this.checkNewsWritePermission(user, news);
    return await this.newsService.delete(id);
  }

  /**
   * Check write permission using the actual news resource data
   */
  private async checkNewsWritePermission(
    user: JwtPayload,
    news: { departmentId: number; writerId: number },
  ) {
    const subject = {
      id: user.sub,
      role: user.role,
      department: user.departmentId,
    };
    const resource: AuthResource = {
      type: 'news',
      department: news.departmentId,
      writer: news.writerId,
    };
    const allowed = await this.authzService.enforce(subject, resource, 'write');
    if (!allowed) {
      throw new ForbiddenException('Access denied: cannot write this news');
    }
  }
}
