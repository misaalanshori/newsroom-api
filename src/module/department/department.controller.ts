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

@Controller('department')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  async getAll() {
    return await this.departmentService.getAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', required: true, description: 'Department ID' })
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return await this.departmentService.getOne(id);
  }

  @Post()
  async create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return await this.departmentService.create(createDepartmentDto);
  }

  @Put(':id')
  @ApiParam({ name: 'id', required: true, description: 'Department ID' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return await this.departmentService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', required: true, description: 'Department ID' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.departmentService.delete(id);
  }
}
