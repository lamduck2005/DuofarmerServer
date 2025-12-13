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
    return {
      success: false,
      message: 'Not implemented yet',
    };
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

