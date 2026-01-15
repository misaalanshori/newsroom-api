import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class RoleService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.role.findMany();
    }
}
