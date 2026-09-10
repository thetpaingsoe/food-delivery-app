import {
  resolveCorrelationId,
  correlationStorage,
} from './correlation.storage';
import { CorrelationMiddleware } from './correlation.middleware';

describe('resolveCorrelationId', () => {
  it('honors a provided ID', () => {
    expect(resolveCorrelationId('abc-123')).toEqual({
      correlationId: 'abc-123',
      minted: false,
    });
  });

  it('mints a UUID when absent or empty', () => {
    for (const provided of [undefined, '']) {
      const { correlationId, minted } = resolveCorrelationId(provided);
      expect(minted).toBe(true);
      expect(correlationId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    }
  });
});

describe('CorrelationMiddleware', () => {
  const middleware = new CorrelationMiddleware();

  function mocks(id?: string | string[]) {
    return {
      req: { headers: id === undefined ? {} : { 'x-correlation-id': id } } as any,
      res: { setHeader: jest.fn() } as any,
      next: jest.fn(),
    };
  }

  it('echoes an incoming ID and exposes it in the store', () => {
    const { req, res, next } = mocks('caller-id');
    middleware.use(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith('x-correlation-id', 'caller-id');
    expect(next).toHaveBeenCalled();
  });

  it('makes the ID visible inside the request scope', () => {
    const { req, res, next } = mocks('scoped-id');
    let seen: string | undefined;
    (next as jest.Mock).mockImplementation(() => {
      seen = correlationStorage.getStore()?.correlationId;
    });
    middleware.use(req, res, next);

    expect(seen).toBe('scoped-id');
  });
});
