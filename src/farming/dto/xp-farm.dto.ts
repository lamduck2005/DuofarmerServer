import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class XpFarmDto {
  @IsString()
  @IsNotEmpty()
  jwt: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  times?: number;
}

