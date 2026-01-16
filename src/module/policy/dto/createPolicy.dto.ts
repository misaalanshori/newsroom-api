import { IsString, IsOptional } from 'class-validator';

export class CreatePolicyDto {
    @IsString()
    ptype: string; // 'p' for policy, 'g' for grouping

    @IsString()
    v0: string; // role or subject

    @IsString()
    v1: string; // resource (p) or parent role (g)

    @IsOptional()
    @IsString()
    v2?: string; // scope

    @IsOptional()
    @IsString()
    v3?: string; // ownership

    @IsOptional()
    @IsString()
    v4?: string; // action

    @IsOptional()
    @IsString()
    v5?: string; // reserved
}
