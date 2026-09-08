import { DiscoveryService } from './discovery.service';

function stubConfig(values: Record<string, string | number> = {}) {
  return {
    get: jest.fn((key: string, fallback?: string | number) =>
      key in values ? values[key] : fallback,
    ),
  } as any;
}

function passing(...ports: number[]) {
  return ports.map((Port) => ({ Service: { Address: 'item-service', Port } }));
}

describe('DiscoveryService', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('resolves a healthy instance URL from Consul', async () => {
    fetchSpy.mockResolvedValue({ ok: true, json: async () => passing(3001) } as Response);
    const discovery = new DiscoveryService(stubConfig());

    const url = await discovery.getServiceUrl(
      'item-service',
      'http://localhost:3001',
    );

    expect(url).toBe('http://item-service:3001');
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:8500/v1/health/service/item-service?passing=1',
      expect.anything(),
    );
  });

  it('caches the lookup within the TTL window', async () => {
    fetchSpy.mockResolvedValue({ ok: true, json: async () => passing(3001) } as Response);
    const discovery = new DiscoveryService(stubConfig());

    await discovery.getServiceUrl('item-service', 'http://localhost:3001');
    await discovery.getServiceUrl('item-service', 'http://localhost:3001');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('falls back to the env URL when Consul is unreachable', async () => {
    fetchSpy.mockRejectedValue(new Error('connect ECONNREFUSED'));
    const discovery = new DiscoveryService(stubConfig());

    const url = await discovery.getServiceUrl(
      'item-service',
      'http://localhost:3001',
    );

    expect(url).toBe('http://localhost:3001');
  });

  it('falls back when no healthy instances exist', async () => {
    fetchSpy.mockResolvedValue({ ok: true, json: async () => [] } as Response);
    const discovery = new DiscoveryService(stubConfig());

    const url = await discovery.getServiceUrl(
      'item-service',
      'http://localhost:3001',
    );

    expect(url).toBe('http://localhost:3001');
  });

  it('invalidate forces a fresh lookup on the next call', async () => {
    fetchSpy.mockResolvedValue({ ok: true, json: async () => passing(3001) } as Response);
    const discovery = new DiscoveryService(stubConfig());

    await discovery.getServiceUrl('item-service', 'http://localhost:3001');
    discovery.invalidate('item-service');
    await discovery.getServiceUrl('item-service', 'http://localhost:3001');

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
