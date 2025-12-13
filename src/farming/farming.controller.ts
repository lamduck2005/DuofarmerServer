import { Controller, Post, Body } from '@nestjs/common';
import { FarmingService } from './farming.service';
import { StreakService } from './streak/streak.service';
import { GemFarmDto } from './dto/gem-farm.dto';
import { XpFarmDto } from './dto/xp-farm.dto';
import { StreakFarmDto } from './dto/streak-farm.dto';

@Controller('farming')
export class FarmingController {
  constructor(
    private readonly farmingService: FarmingService,
    private readonly streakService: StreakService,
  ) {}

  @Post('gem')
  async farmGem(@Body() gemFarmDto: GemFarmDto) {
    return await this.farmingService.farmGem(gemFarmDto.jwt);
  }

  @Post('xp/session')
  async farmXpSession(@Body() xpFarmDto: XpFarmDto) {
    return await this.farmingService.farmXpSession(xpFarmDto.jwt, xpFarmDto.amount);
  }

  @Post('xp/story')
  async farmXpStory(@Body() xpFarmDto: XpFarmDto) {
    return await this.farmingService.farmXpStory(xpFarmDto.jwt, xpFarmDto.amount);
  }

  @Post('streak/farm')
  async farmStreak(@Body() streakFarmDto: StreakFarmDto) {
    return await this.streakService.farmStreak(streakFarmDto.jwt);
  }

  @Post('streak/maintain')
  async maintainStreak(@Body() streakFarmDto: StreakFarmDto) {
    return await this.streakService.maintainStreak(streakFarmDto.jwt);
  }
}

