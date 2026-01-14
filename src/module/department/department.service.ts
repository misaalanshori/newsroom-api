import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateDepartmentDto } from './dto/createDepartment.dto';
import { UpdateDepartmentDto } from './dto/updateDepartment.dto';

@Injectable()
export class DepartmentService {
  constructor(private prisma: PrismaService) {}

  getAll() {
    return this.prisma.department.findMany();
  }

  async getOne(id: number) {
    const department = await this.prisma.department.findUnique({
      where: { id },
    });
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return department;
  }

  create(dto: CreateDepartmentDto) {
    return this.prisma.department.create({ data: dto });
  }

  async update(id: number, dto: UpdateDepartmentDto) {
    await this.getOne(id);
    return this.prisma.department.update({ where: { id }, data: dto });
  }

  async delete(id: number) {
    await this.getOne(id);
    return this.prisma.department.delete({ where: { id } });
  }
}
