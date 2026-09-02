import { Injectable, Inject } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { ClientProxy, Transport } from '@nestjs/microservices';

@Injectable()
export class RmqHealthIndicator {
  constructor(
    private healthIndicatorService: HealthIndicatorService,
    @Inject('KITCHEN_SERVICE') private kitchenClient: ClientProxy,
  ) {}

  pingCheck() {
    return this.healthIndicatorService
      .check('rmq')
      .attempt(async () => {
        await this.kitchenClient.connect();
      });
  }
}
