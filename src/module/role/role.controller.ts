import { Controller, Get, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { AuthzGuard } from 'src/common/authz/authz.guard';
import { RequirePermission } from 'src/common/authz/authz.decorators';
import { JwtAuthGuard } from 'src/module/auth/guards/jwt-auth.guard';

@Controller('role')
@UseGuards(JwtAuthGuard, AuthzGuard)
export class RoleController {
    constructor(private readonly roleService: RoleService) { }

    @Get()
    @RequirePermission('role', 'read')
    async getAll() {
        return this.roleService.findAll();
    }
}
