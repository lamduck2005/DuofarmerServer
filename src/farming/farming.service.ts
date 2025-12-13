import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { DuolingoService } from '../duolingo/duolingo.service';

@Injectable()
export class FarmingService {
  constructor(
    private readonly authService: AuthService,
    private readonly duolingoService: DuolingoService,
  ) {}

  private extractSkillId(currentCourse: any): string | null {
    if (!currentCourse?.pathSectioned) {
      return null;
    }

    const sections = currentCourse.pathSectioned || [];
    for (const section of sections) {
      const units = section.units || [];
      for (const unit of units) {
        const levels = unit.levels || [];
        for (const level of levels) {
          const skillId =
            level.pathLevelMetadata?.skillId || level.pathLevelClientData?.skillId;
          if (skillId) {
            return skillId;
          }
        }
      }
    }
    return null;
  }

  getSessionConfig(amount: number, skillId?: string): any {
    const configs: Record<number, any> = {
      10: {
        sessionPayload: {},
        updateSessionPayload: {},
      },
      20: {
        sessionPayload: {},
        updateSessionPayload: { hasBoost: true },
      },
      40: {
        sessionPayload: {},
        updateSessionPayload: { hasBoost: true, type: 'TARGET_PRACTICE' },
      },
      50: {
        sessionPayload: {},
        updateSessionPayload: {
          enableBonusPoints: true,
          hasBoost: true,
          happyHourBonusXp: 10,
          type: 'TARGET_PRACTICE',
        },
      },
      110: {
        sessionPayload: {
          type: 'UNIT_TEST',
          skillIds: skillId ? [skillId] : [],
        },
        updateSessionPayload: {
          type: 'UNIT_TEST',
          hasBoost: true,
          happyHourBonusXp: 10,
          pathLevelSpecifics: { unitIndex: 0 },
        },
      },
    };

    return configs[amount] || null;
  }

  getStoryConfig(amount: number): any {
    const configs: Record<number, any> = {
      50: {
        storyPayload: {},
      },
      100: {
        storyPayload: { happyHourBonusXp: 50 },
      },
      200: {
        storyPayload: { happyHourBonusXp: 150 },
      },
      300: {
        storyPayload: { happyHourBonusXp: 250 },
      },
      400: {
        storyPayload: { happyHourBonusXp: 350 },
      },
      499: {
        storyPayload: { happyHourBonusXp: 449 },
      },
    };

    return configs[amount] || null;
  }

  async farmGem(jwt: string): Promise<{ success: boolean; message?: string }> {
    try {
      this.authService.validateJwt(jwt);
      const userId = this.authService.getUserId(jwt);

      const userInfo = await this.duolingoService.getUserInfo(userId.toString(), jwt);
      if (!userInfo) {
        throw new HttpException('User info not found', HttpStatus.NOT_FOUND);
      }

      await this.duolingoService.farmGem(userId.toString(), jwt, userInfo);

      return { success: true, message: 'Gem farmed successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to farm gem: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async farmXpSession(
    jwt: string,
    amount: number,
  ): Promise<{ success: boolean; xpGained?: number; message?: string }> {
    try {
      const validAmounts = [10, 20, 40, 50, 110];
      if (!validAmounts.includes(amount)) {
        throw new HttpException(
          `Invalid amount. Valid amounts are: ${validAmounts.join(', ')}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      this.authService.validateJwt(jwt);
      const userId = this.authService.getUserId(jwt);

      const userInfo = await this.duolingoService.getUserInfo(userId.toString(), jwt);
      if (!userInfo) {
        throw new HttpException('User info not found', HttpStatus.NOT_FOUND);
      }

      let skillId: string | null = null;
      if (amount === 110) {
        skillId = this.extractSkillId(userInfo.currentCourse);
        if (!skillId) {
          throw new HttpException(
            'SkillId not found. Cannot farm 110 XP without skillId.',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const config = this.getSessionConfig(amount, skillId || undefined);
      if (!config) {
        throw new HttpException(
          `Config not found for amount: ${amount}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const result = await this.duolingoService.farmSession(
        userId.toString(),
        jwt,
        userInfo,
        config,
      );

      const xpGained = result?.xpGain || result?.awardedXp || 0;

      return {
        success: true,
        xpGained,
        message: `Session farmed successfully. XP gained: ${xpGained}`,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to farm XP session: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async farmXpStory(
    jwt: string,
    amount: number,
  ): Promise<{ success: boolean; xpGained?: number; message?: string }> {
    try {
      const validAmounts = [50, 100, 200, 300, 400, 499];
      if (!validAmounts.includes(amount)) {
        throw new HttpException(
          `Invalid amount. Valid amounts are: ${validAmounts.join(', ')}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      this.authService.validateJwt(jwt);
      const userId = this.authService.getUserId(jwt);

      const userInfo = await this.duolingoService.getUserInfo(userId.toString(), jwt);
      if (!userInfo) {
        throw new HttpException('User info not found', HttpStatus.NOT_FOUND);
      }

      const config = this.getStoryConfig(amount);
      if (!config) {
        throw new HttpException(
          `Config not found for amount: ${amount}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const result = await this.duolingoService.farmStory(
        userId.toString(),
        jwt,
        userInfo,
        config,
      );

      const xpGained = result?.awardedXp || result?.xpGain || 0;

      return {
        success: true,
        xpGained,
        message: `Story farmed successfully. XP gained: ${xpGained}`,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to farm XP story: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

