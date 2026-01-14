import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateNewsDto } from './dto/createNews.dto';
import { UpdateNewsDto } from './dto/updateNews.dto';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  getAll() {
    return this.prisma.news.findMany({
      include: { department: true, writer: { omit: { password_hash: true } } },
    });
  }

  async getOne(id: number) {
    const news = await this.prisma.news.findUnique({
      where: { id },
      include: { department: true, writer: { omit: { password_hash: true } } },
    });
    if (!news) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }
    return news;
  }

  create(dto: CreateNewsDto, writerId: number, userDepartmentId: number) {
    const departmentId = dto.departmentId ?? userDepartmentId;
    return this.prisma.news.create({
      data: {
        title: dto.title,
        contents: dto.contents,
        departmentId,
        writerId,
      },
      include: { department: true, writer: { omit: { password_hash: true } } },
    });
  }

  async update(id: number, dto: UpdateNewsDto) {
    await this.getOne(id);
    return this.prisma.news.update({
      where: { id },
      data: dto,
      include: { department: true, writer: { omit: { password_hash: true } } },
    });
  }

  async delete(id: number) {
    await this.getOne(id);
    return this.prisma.news.delete({ where: { id } });
  }
}
