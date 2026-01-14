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
    const password_hash = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { username, password_hash, roleId, departmentId },
      include: { role: true, department: true },
      omit: { password_hash: true },
    });
  }
}
