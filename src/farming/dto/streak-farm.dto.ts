import { IsString, IsNotEmpty } from 'class-validator';

export class StreakFarmDto {
  @IsString()
  @IsNotEmpty()
  jwt: string;
}

