import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  roleId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  departmentId?: number;
}
