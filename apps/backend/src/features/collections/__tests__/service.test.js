const CollectionsService = require('../service');

jest.mock('../model.bin', () => ({
  findOne: jest.fn(),
}));

jest.mock('../model', () => ({
  create: jest.fn(),
}));

const Bin = require('../model.bin');
const Collection = require('../model');

describe('CollectionsService.recordScan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('records a collection when bin exists', async () => {
    Bin.findOne.mockResolvedValue({ binId: 'BIN-1' });
    Collection.create.mockResolvedValue({ _id: 'abc123', binId: 'BIN-1' });

    const result = await CollectionsService.recordScan({ binId: 'BIN-1', collectorId: 'COL-1', weight: 5 });

    expect(Bin.findOne).toHaveBeenCalledWith({ binId: 'BIN-1' });
    expect(Collection.create).toHaveBeenCalledWith(expect.objectContaining({ binId: 'BIN-1', collectorId: 'COL-1' }));
    expect(result).toEqual(expect.objectContaining({ ok: true, id: 'abc123', binId: 'BIN-1' }));
  });

  test('throws 404 when bin not found', async () => {
    Bin.findOne.mockResolvedValue(null);

    await expect(CollectionsService.recordScan({ binId: 'NOPE', collectorId: 'COL-1' })).rejects.toEqual(expect.objectContaining({ status: 404 }));
    expect(Collection.create).not.toHaveBeenCalled();
  });

  test('throws when required fields missing', async () => {
    await expect(CollectionsService.recordScan({ collectorId: 'COL-1' })).rejects.toThrow();
  });
});
