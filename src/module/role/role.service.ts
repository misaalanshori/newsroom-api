import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateRoleDto } from './dto/createRole.dto';
import { UpdateRoleDto } from './dto/updateRole.dto';

@Injectable()
export class RoleService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.role.findMany();
    }

    async findById(id: number) {
        return this.prisma.role.findUnique({ where: { id } });
    }

    async create(dto: CreateRoleDto) {
        return this.prisma.role.create({ data: dto });
    }

    async update(id: number, dto: UpdateRoleDto) {
        return this.prisma.role.update({ where: { id }, data: dto });
    }

    async delete(id: number) {
        return this.prisma.role.delete({ where: { id } });
    }
}

