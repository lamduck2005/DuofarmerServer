import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class DuolingoService {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      },
    });
  }

  private getHeaders(jwt: string) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    };
  }

  async getUserInfo(userId: string, jwt: string): Promise<any> {
    try {
      const url = `https://www.duolingo.com/2017-06-30/users/${userId}?fields=id,username,fromLanguage,learningLanguage,streak,totalXp,level,numFollowers,numFollowing,gems,creationDate,streakData,privacySettings,currentCourse{pathSectioned{units{levels{pathLevelMetadata{skillId},pathLevelClientData{skillId}}}}}`;
      const response = await this.axiosInstance.get(url, {
        headers: this.getHeaders(jwt),
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const statusText = error.response.statusText;
        throw new HttpException(
          `Duolingo API error: ${status} - ${statusText}`,
          status,
        );
      }
      throw new HttpException(
        `Failed to get user info: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async farmGem(userId: string, jwt: string, userInfo: any): Promise<any> {
    try {
      const rewardId = 'SKILL_COMPLETION_BALANCED-dd2495f4_d44e_3fc3_8ac8_94e2191506f0-2-GEMS';
      const url = `https://www.duolingo.com/2017-06-30/users/${userId}/rewards/${rewardId}`;
      const body = {
        consumed: true,
        learningLanguage: userInfo.learningLanguage,
        fromLanguage: userInfo.fromLanguage,
      };
      const response = await this.axiosInstance.patch(url, body, {
        headers: this.getHeaders(jwt),
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const statusText = error.response.statusText;
        throw new HttpException(
          `Duolingo API error: ${status} - ${statusText}`,
          status,
        );
      }
      throw new HttpException(
        `Failed to farm gem: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async farmSession(userId: string, jwt: string, userInfo: any, config: any): Promise<any> {
    try {
      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime + 60;

      // POST session
      const sessionPayload = {
        challengeTypes: [],
        fromLanguage: userInfo.fromLanguage,
        learningLanguage: userInfo.learningLanguage,
        type: 'GLOBAL_PRACTICE',
        ...(config.sessionPayload || {}),
      };

      const sessionResponse = await this.axiosInstance.post(
        'https://www.duolingo.com/2017-06-30/sessions',
        sessionPayload,
        {
          headers: this.getHeaders(jwt),
        },
      );

      const sessionData = sessionResponse.data;

      // PUT update session
      const updateSessionPayload = {
        id: sessionData.id,
        metadata: sessionData.metadata,
        type: sessionData.type,
        fromLanguage: userInfo.fromLanguage,
        learningLanguage: userInfo.learningLanguage,
        challenges: [],
        adaptiveChallenges: [],
        sessionExperimentRecord: [],
        experiments_with_treatment_contexts: [],
        adaptiveInterleavedChallenges: [],
        sessionStartExperiments: [],
        trackingProperties: [],
        ttsAnnotations: [],
        heartsLeft: 0,
        startTime: startTime,
        enableBonusPoints: false,
        endTime: endTime,
        failed: false,
        maxInLessonStreak: 9,
        shouldLearnThings: true,
        ...(config.updateSessionPayload || {}),
      };

      const updateResponse = await this.axiosInstance.put(
        `https://www.duolingo.com/2017-06-30/sessions/${sessionData.id}`,
        updateSessionPayload,
        {
          headers: this.getHeaders(jwt),
        },
      );

      return updateResponse.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const statusText = error.response.statusText;
        throw new HttpException(
          `Duolingo API error: ${status} - ${statusText}`,
          status,
        );
      }
      throw new HttpException(
        `Failed to farm session: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async farmStory(userId: string, jwt: string, userInfo: any, config: any): Promise<any> {
    try {
      const startTime = Math.floor(Date.now() / 1000);
      const fromLanguage = userInfo.fromLanguage;
      const url = `https://stories.duolingo.com/api2/stories/en-${fromLanguage}-the-passport/complete`;

      const storyPayload = {
        awardXp: true,
        isFeaturedStoryInPracticeHub: false,
        completedBonusChallenge: true,
        mode: 'READ',
        isV2Redo: false,
        isV2Story: false,
        isLegendaryMode: true,
        masterVersion: false,
        maxScore: 0,
        numHintsUsed: 0,
        score: 0,
        startTime: startTime,
        fromLanguage: fromLanguage,
        learningLanguage: userInfo.learningLanguage,
        hasXpBoost: false,
        ...(config.storyPayload || {}),
      };

      const response = await this.axiosInstance.post(url, storyPayload, {
        headers: this.getHeaders(jwt),
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const statusText = error.response.statusText;
        throw new HttpException(
          `Duolingo API error: ${status} - ${statusText}`,
          status,
        );
      }
      throw new HttpException(
        `Failed to farm story: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

