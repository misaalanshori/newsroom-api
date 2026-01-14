import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/createDepartment.dto';
import { UpdateDepartmentDto } from './dto/updateDepartment.dto';
import { ApiParam } from '@nestjs/swagger';

@Controller('department')
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
