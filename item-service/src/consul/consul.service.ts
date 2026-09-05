import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hostname } from 'os';

@Injectable()
export class ConsulService implements OnModuleDestroy {
  private readonly logger = new Logger(ConsulService.name);
  private readonly serviceId: string;
  private registered = false;

  constructor(private readonly configService: ConfigService) {
    const name = this.configService.get<string>(
      'SERVICE_NAME',
      'item-service',
    );
    this.serviceId = `${name}-${hostname()}`;
  }

  private get baseUrl(): string {
    return this.configService.get<string>(
      'CONSUL_URL',
      'http://localhost:8500',
    );
  }

  async register(): Promise<void> {
    const name = this.configService.get<string>(
      'SERVICE_NAME',
      'item-service',
    );
    const port = this.configService.get<number>('PORT', 3001);
    const address = this.configService.get<string>(
      'SERVICE_ADDRESS',
      name,
    );
    try {
      const res = await fetch(`${this.baseUrl}/v1/agent/service/register`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ID: this.serviceId,
          Name: name,
          Address: address,
          Port: port,
          Check: {
            HTTP: `http://${address}:${port}/health`,
            Interval: '10s',
            DeregisterCriticalServiceAfter: '1m',
          },
        }),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) {
        throw new Error(`Consul responded ${res.status}`);
      }
      this.registered = true;
      this.logger.log(`Registered ${this.serviceId} with Consul`);
    } catch (error) {
      this.logger.warn(
        `Consul registration skipped: ${(error as Error).message}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.registered) {
      return;
    }
    try {
      await fetch(
        `${this.baseUrl}/v1/agent/service/deregister/${this.serviceId}`,
        { method: 'PUT', signal: AbortSignal.timeout(5000) },
      );
      this.logger.log(`Deregistered ${this.serviceId} from Consul`);
    } catch (error) {
      this.logger.warn(
        `Consul deregistration failed: ${(error as Error).message}`,
      );
    }
  }
}
