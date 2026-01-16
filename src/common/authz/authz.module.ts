import { Global, Module } from '@nestjs/common';
import { AuthzService } from './authz.service';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [AuthzService],
  exports: [AuthzService],
})
export class AuthzModule { }
