import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuthzService } from 'src/common/authz/authz.service';
import { CreatePolicyDto } from './dto/createPolicy.dto';

export interface PolicyFilter {
    ptype?: string;
    v0?: string;
    v1?: string;
    v2?: string;
    v3?: string;
    v4?: string;
    v5?: string;
}

@Injectable()
export class PolicyService {
    constructor(
        private prisma: PrismaService,
        private authzService: AuthzService,
    ) { }

    async findAll(filter?: PolicyFilter) {
        const where: PolicyFilter = {};
        if (filter?.ptype) where.ptype = filter.ptype;
        if (filter?.v0) where.v0 = filter.v0;
        if (filter?.v1) where.v1 = filter.v1;
        if (filter?.v2) where.v2 = filter.v2;
        if (filter?.v3) where.v3 = filter.v3;
        if (filter?.v4) where.v4 = filter.v4;
        if (filter?.v5) where.v5 = filter.v5;
        return this.prisma.casbinRule.findMany({ where });
    }

    async create(dto: CreatePolicyDto) {
        const rule = await this.prisma.casbinRule.create({ data: dto });
        await this.authzService.reloadPolicies();
        return rule;
    }

    async delete(id: number) {
        const rule = await this.prisma.casbinRule.delete({ where: { id } });
        await this.authzService.reloadPolicies();
        return rule;
    }

    async reloadPolicies() {
        await this.authzService.reloadPolicies();
        return { message: 'Policies reloaded successfully' };
    }
}

