import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  findByUsername(username: string) {
    return this.prisma.user.findFirst({
      where: { username },
      include: { role: true, department: true },
    });
  }

  findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true, department: true },
      omit: { password_hash: true },
    });
  }

  async create(
    username: string,
    password: string,
    roleId = 1,
    departmentId = 1,
  ) {
    const userCount = await this.prisma.user.count();
    let finalRoleId = roleId;

    if (userCount === 0) {
      const superAdminRole = await this.prisma.role.findUnique({
        where: { slug: 'super-admin' },
      });
      if (superAdminRole) {
        finalRoleId = superAdminRole.id;
      }
    }

    const password_hash = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { username, password_hash, roleId: finalRoleId, departmentId },
      include: { role: true, department: true },
      omit: { password_hash: true },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      include: { role: true, department: true },
      omit: { password_hash: true },
    });
  }

  async update(
    id: number,
    data: { username?: string; roleId?: number; departmentId?: number },
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
      include: { role: true, department: true },
      omit: { password_hash: true },
    });
  }

  async delete(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
