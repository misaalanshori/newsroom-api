import { Module } from '@nestjs/common';
import { NewsModule } from './module/news/news.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { DepartmentModule } from './module/department/department.module';
import { AuthModule } from './module/auth/auth.module';
import { UserModule } from './module/user/user.module';
import { AuthzModule } from './common/authz';

@Module({
  imports: [
    ConfigModule.forRoot(),
    NewsModule,
    DepartmentModule,
    PrismaModule,
    AuthModule,
    UserModule,
    AuthzModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
