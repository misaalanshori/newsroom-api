import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/createDepartment.dto';
import { UpdateDepartmentDto } from './dto/updateDepartment.dto';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthzGuard, RequirePermission } from '../../common/authz';

@Controller('department')
@UseGuards(JwtAuthGuard, AuthzGuard)
@ApiBearerAuth()
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) { }

  @Get()
  @RequirePermission('department', 'read')
  async getAll() {
    return await this.departmentService.getAll();
  }

  @Get(':id')
  @RequirePermission('department', 'read')
  @ApiParam({ name: 'id', required: true, description: 'Department ID' })
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return await this.departmentService.getOne(id);
  }

  @Post()
  @RequirePermission('department', 'create')
  async create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return await this.departmentService.create(createDepartmentDto);
  }

  @Put(':id')
  @RequirePermission('department', 'update')
  @ApiParam({ name: 'id', required: true, description: 'Department ID' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return await this.departmentService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @RequirePermission('department', 'delete')
  @ApiParam({ name: 'id', required: true, description: 'Department ID' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.departmentService.delete(id);
  }
}
