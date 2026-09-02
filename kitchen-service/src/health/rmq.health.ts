import { Injectable, Inject } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RmqHealthIndicator {
  constructor(
    private healthIndicatorService: HealthIndicatorService,
    @Inject('RIDER_SERVICE') private riderClient: ClientProxy,
  ) {}

  pingCheck() {
    return this.healthIndicatorService
      .check('rmq')
      .attempt(async () => {
        await this.riderClient.connect();
      });
  }
}
