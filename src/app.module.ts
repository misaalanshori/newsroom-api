import { Module } from '@nestjs/common';
import { NewsModule } from './module/news/news.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { DepartmentModule } from './module/department/department.module';
import { AuthModule } from './module/auth/auth.module';
import { UserModule } from './module/user/user.module';
import { AuthzModule } from './common/authz/authz.module';
import { RoleModule } from './module/role/role.module';
import { PolicyModule } from './module/policy/policy.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule,
    NewsModule,
    DepartmentModule,
    AuthzModule,
    RoleModule,
    PolicyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
