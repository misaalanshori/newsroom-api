import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [RoleController],
    providers: [RoleService],
})
export class RoleModule { }
