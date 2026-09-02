import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
} from '@nestjs/terminus';
import { NeonHealthIndicator } from './neon.health';
import { RmqHealthIndicator } from './rmq.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private neon: NeonHealthIndicator,
    private rmq: RmqHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  liveness(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }

  @Get('readiness')
  @HealthCheck()
  readiness(): Promise<HealthCheckResult> {
    return this.health.check([this.neon.pingCheck(), this.rmq.pingCheck()]);
  }
}
