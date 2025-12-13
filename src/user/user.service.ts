import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { DuolingoService } from '../duolingo/duolingo.service';

@Injectable()
export class UserService {
  constructor(
    private readonly authService: AuthService,
    private readonly duolingoService: DuolingoService,
  ) {}

  async getUserInfo(jwt: string): Promise<any> {
    try {
      // Validate and decode JWT
      this.authService.validateJwt(jwt);
      const userId = this.authService.getUserId(jwt);

      // Get user info from Duolingo
      const userInfo = await this.duolingoService.getUserInfo(userId.toString(), jwt);

      if (!userInfo) {
        throw new HttpException('User info not found', HttpStatus.NOT_FOUND);
      }

      return userInfo;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to get user info: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

