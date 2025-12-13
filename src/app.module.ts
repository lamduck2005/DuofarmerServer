import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DuolingoModule } from './duolingo/duolingo.module';
import { UserModule } from './user/user.module';
import { FarmingModule } from './farming/farming.module';

@Module({
  imports: [AuthModule, DuolingoModule, UserModule, FarmingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
