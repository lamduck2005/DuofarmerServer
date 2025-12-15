import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DuolingoService } from '../../duolingo/duolingo.service';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class StreakService {
  constructor(
    private readonly duolingoService: DuolingoService,
    private readonly authService: AuthService,
  ) {}

  async farmStreak(jwt: string): Promise<{ success: boolean; message?: string }> {
    try {
      this.authService.validateJwt(jwt);
      const userId = this.authService.getUserId(jwt);

      const userInfo = await this.duolingoService.getUserInfo(userId.toString(), jwt);
      if (!userInfo) {
        throw new HttpException('User info not found', HttpStatus.NOT_FOUND);
      }

      const SECONDS_PER_DAY = 86400;
      const now = Math.floor(Date.now() / 1000);

      const streakStartDate = userInfo?.streakData?.currentStreak?.startDate;
      const streakNumber = typeof userInfo?.streak === 'number' ? userInfo.streak : 0;

      let startTime = now - SECONDS_PER_DAY; // default: backdate 1 day

      if (streakStartDate) {
        startTime = Math.floor(new Date(streakStartDate).getTime() / 1000) - SECONDS_PER_DAY;
      } else if (streakNumber > 0) {
        startTime = now - streakNumber * SECONDS_PER_DAY;
      }

      const endTime = startTime + 60;

      await this.duolingoService.farmSession(
        userId.toString(),
        jwt,
        userInfo,
        {
          sessionPayload: {},
          updateSessionPayload: {},
          startTime,
          endTime,
        },
      );

      return { success: true, message: 'Streak farmed successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to farm streak: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async maintainStreak(jwt: string): Promise<{ success: boolean; message?: string }> {
    try {
      this.authService.validateJwt(jwt);
      const userId = this.authService.getUserId(jwt);

      const userInfo = await this.duolingoService.getUserInfo(userId.toString(), jwt);
      if (!userInfo) {
        throw new HttpException('User info not found', HttpStatus.NOT_FOUND);
      }

      // Copy exact behavior of story 50xp (empty config)
      const config = { storyPayload: {} };

      await this.duolingoService.farmStory(userId.toString(), jwt, userInfo, config);

      return { success: true, message: 'Streak maintained successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to maintain streak: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

