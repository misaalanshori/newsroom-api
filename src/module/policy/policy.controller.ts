import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { PolicyService } from './policy.service';
import type { PolicyFilter } from './policy.service';
import { CreatePolicyDto } from './dto/createPolicy.dto';
import { JwtAuthGuard } from 'src/module/auth/guards/jwt-auth.guard';
import { AuthzGuard } from 'src/common/authz/authz.guard';
import { RequirePermission } from 'src/common/authz/authz.decorators';

@Controller('policy')
@UseGuards(JwtAuthGuard, AuthzGuard)
export class PolicyController {
    constructor(private readonly policyService: PolicyService) { }

    @Get()
    @RequirePermission('policy', 'read')
    async findAll(@Query() filter: PolicyFilter) {
        return this.policyService.findAll(filter);
    }

    @Post()
    @RequirePermission('policy', 'create')
    async create(@Body() dto: CreatePolicyDto) {
        return this.policyService.create(dto);
    }

    @Post('reload')
    @RequirePermission('policy', 'read')
    async reload() {
        return this.policyService.reloadPolicies();
    }

    @Delete(':id')
    @RequirePermission('policy', 'delete')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.policyService.delete(id);
    }
}

