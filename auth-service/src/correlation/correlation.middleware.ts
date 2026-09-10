import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import {
  correlationStorage,
  resolveCorrelationId,
} from './correlation.storage';

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const incoming = req.headers['x-correlation-id'];
    const { correlationId } = resolveCorrelationId(
      Array.isArray(incoming) ? incoming[0] : incoming,
    );
    res.setHeader('x-correlation-id', correlationId);
    correlationStorage.run({ correlationId }, () => next());
  }
}
