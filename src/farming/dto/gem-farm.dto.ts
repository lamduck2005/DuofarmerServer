import { IsString, IsNotEmpty } from 'class-validator';

export class GemFarmDto {
  @IsString()
  @IsNotEmpty()
  jwt: string;
}

