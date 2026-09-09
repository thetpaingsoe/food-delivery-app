import { resolveCorrelationId } from './correlation.storage';

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
