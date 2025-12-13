import { Module } from '@nestjs/common';
import { FarmingController } from './farming.controller';
import { FarmingService } from './farming.service';
import { AuthModule } from '../auth/auth.module';
import { DuolingoModule } from '../duolingo/duolingo.module';
import { StreakModule } from './streak/streak.module';

@Module({
  imports: [AuthModule, DuolingoModule, StreakModule],
  controllers: [FarmingController],
  providers: [FarmingService],
})
export class FarmingModule {}

