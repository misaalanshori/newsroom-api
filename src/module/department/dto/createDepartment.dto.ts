import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ description: 'Department name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Department slug (unique identifier)' })
  @IsString()
  @IsNotEmpty()
  slug: string;
}
