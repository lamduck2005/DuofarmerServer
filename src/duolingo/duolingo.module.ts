import { Module } from '@nestjs/common';
import { DuolingoService } from './duolingo.service';

@Module({
  providers: [DuolingoService],
  exports: [DuolingoService],
})
export class DuolingoModule {}

