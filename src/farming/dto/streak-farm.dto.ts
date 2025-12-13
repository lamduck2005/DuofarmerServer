import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class StreakFarmDto {
  @IsString()
  @IsNotEmpty()
  jwt: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  times?: number;
}

