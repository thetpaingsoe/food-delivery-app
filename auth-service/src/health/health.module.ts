import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { NeonHealthIndicator } from './neon.health';
import { DbService } from '../db/db.service';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [NeonHealthIndicator, DbService],
})
export class HealthModule {}