import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNewsDto {
  @ApiProperty({ description: 'News title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'News contents' })
  @IsString()
  @IsNotEmpty()
  contents: string;

  @ApiProperty({
    description: 'Department ID (optional, defaults to user department)',
    required: false,
  })
  @IsInt()
  @IsOptional()
  departmentId?: number;
}
