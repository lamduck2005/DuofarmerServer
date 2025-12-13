import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class XpFarmDto {
  @IsString()
  @IsNotEmpty()
  jwt: string;

  @IsNumber()
  amount: number;
}

