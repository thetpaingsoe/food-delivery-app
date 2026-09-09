import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

export interface CorrelationStore {
  correlationId: string;
}

export const correlationStorage =
  new AsyncLocalStorage<CorrelationStore>();

export function resolveCorrelationId(provided?: string): {
  correlationId: string;
  minted: boolean;
} {
  if (provided && provided.length > 0) {
    return { correlationId: provided, minted: false };
  }
  return { correlationId: randomUUID(), minted: true };
}
