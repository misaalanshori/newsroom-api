import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NewsModule } from './module/news/news.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { DepartmentModule } from './module/department/department.module';

@Module({
  imports: [ConfigModule.forRoot(), NewsModule, DepartmentModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
