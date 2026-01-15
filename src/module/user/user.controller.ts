import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';
import type { JwtPayload } from '../auth/guards/jwt-auth.guard';
import {
  AuthzGuard,
  RequirePermission,
  AuthzService,
  AuthResource,
} from '../../common/authz';

@Controller('user')
@UseGuards(JwtAuthGuard, AuthzGuard)
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authzService: AuthzService,
  ) {}

  @Get()
  @RequirePermission('user', 'read')
  async getAll() {
    return await this.userService.findAll();
  }

  @Get('me')
  async getMe(@User() user: JwtPayload) {
    const result = await this.userService.findById(user.sub);
    if (!result) {
      throw new NotFoundException('User not found');
    }
    return result;
  }

  @Get(':id')
  @ApiParam({ name: 'id', required: true, description: 'User ID' })
  async getOne(
    @Param('id', ParseIntPipe) id: number,
    @User() user: JwtPayload,
  ) {
    const targetUser = await this.userService.findById(id);
    if (!targetUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    // Check authorization - can read if super-admin OR own profile
    await this.checkUserReadPermission(user, targetUser);
    return targetUser;
  }

  @Put(':id')
  @ApiParam({ name: 'id', required: true, description: 'User ID' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @User() user: JwtPayload,
  ) {
    const targetUser = await this.userService.findById(id);
    if (!targetUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if sensitive fields are being updated
    if (updateUserDto.roleId || updateUserDto.departmentId) {
      await this.checkUserSensitiveWritePermission(user);
    }

    // Check basic write permission
    await this.checkUserWritePermission(user, targetUser);

    return await this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', required: true, description: 'User ID' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @User() user: JwtPayload,
  ) {
    const targetUser = await this.userService.findById(id);
    if (!targetUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.checkUserWritePermission(user);
    return await this.userService.delete(id);
  }

  private async checkUserReadPermission(
    actor: JwtPayload,
    targetUser: { id: number },
  ) {
    const subject = {
      id: actor.sub,
      role: actor.role,
      department: actor.departmentId,
    };
    const resource: AuthResource = { type: 'user', writer: targetUser.id };
    const allowed = await this.authzService.enforce(subject, resource, 'read');
    if (!allowed) {
      throw new ForbiddenException('Access denied: cannot read this user');
    }
  }

  private async checkUserWritePermission(
    actor: JwtPayload,
    targetUser?: { id: number },
  ) {
    const subject = {
      id: actor.sub,
      role: actor.role,
      department: actor.departmentId,
    };
    const resource: AuthResource = { type: 'user', writer: targetUser?.id };
    const allowed = await this.authzService.enforce(subject, resource, 'write');
    if (!allowed) {
      throw new ForbiddenException('Access denied: cannot modify users');
    }
  }

  private async checkUserSensitiveWritePermission(actor: JwtPayload) {
    const subject = {
      id: actor.sub,
      role: actor.role,
      department: actor.departmentId,
    };
    const resource: AuthResource = { type: 'user' };
    const allowed = await this.authzService.enforce(
      subject,
      resource,
      'write:sensitive',
    );
    if (!allowed) {
      throw new ForbiddenException(
        'Access denied: cannot modify sensitive fields (role/department)',
      );
    }
  }
}
