import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { DuolingoModule } from '../duolingo/duolingo.module';

@Module({
  imports: [AuthModule, DuolingoModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}

