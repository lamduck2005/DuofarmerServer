import { Controller, Get, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtDto } from './dto/jwt.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMe(@Body() jwtDto: JwtDto) {
    return await this.userService.getUserInfo(jwtDto.jwt);
  }
}

