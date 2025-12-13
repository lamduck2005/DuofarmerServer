import { Module } from '@nestjs/common';
import { StreakService } from './streak.service';
import { DuolingoModule } from '../../duolingo/duolingo.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [DuolingoModule, AuthModule],
  providers: [StreakService],
  exports: [StreakService],
})
export class StreakModule {}

