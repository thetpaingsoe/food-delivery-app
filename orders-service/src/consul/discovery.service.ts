import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface PassingInstance {
  Service: { Address: string; Port: number };
}

const CACHE_TTL_MS = 10_000;

@Injectable()
export class DiscoveryService {
  private readonly logger = new Logger(DiscoveryService.name);
  private readonly cache = new Map<
    string,
    { url: string; expiresAt: number }
  >();

  constructor(private readonly configService: ConfigService) {}

  async getServiceUrl(
    serviceName: string,
    fallbackUrl: string,
  ): Promise<string> {
    const cached = this.cache.get(serviceName);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.url;
    }
    try {
      const consul = this.configService.get<string>(
        'CONSUL_URL',
        'http://localhost:8500',
      );
      const res = await fetch(
        `${consul}/v1/health/service/${serviceName}?passing=1`,
        { signal: AbortSignal.timeout(3000) },
      );
      if (!res.ok) {
        throw new Error(`Consul responded ${res.status}`);
      }
      const instances = (await res.json()) as PassingInstance[];
      if (instances.length === 0) {
        throw new Error(`no healthy instances of ${serviceName}`);
      }
      const pick =
        instances[Math.floor(Math.random() * instances.length)];
      const url = `http://${pick.Service.Address}:${pick.Service.Port}`;
      this.cache.set(serviceName, {
        url,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
      return url;
    } catch (error) {
      this.logger.warn(
        `Discovery fallback for ${serviceName}: ${(error as Error).message}`,
      );
      return fallbackUrl;
    }
  }

  invalidate(serviceName: string): void {
    this.cache.delete(serviceName);
  }
}
