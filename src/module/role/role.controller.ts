import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/createRole.dto';
import { UpdateRoleDto } from './dto/updateRole.dto';
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

    @Get(':id')
    @RequirePermission('role', 'read')
    async getById(@Param('id', ParseIntPipe) id: number) {
        return this.roleService.findById(id);
    }

    @Post()
    @RequirePermission('role', 'write')
    async create(@Body() dto: CreateRoleDto) {
        return this.roleService.create(dto);
    }

    @Patch(':id')
    @RequirePermission('role', 'write')
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
        return this.roleService.update(id, dto);
    }

    @Delete(':id')
    @RequirePermission('role', 'write')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.roleService.delete(id);
    }
}

