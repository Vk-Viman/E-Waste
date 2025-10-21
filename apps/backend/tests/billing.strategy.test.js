const { FlatFeeStrategy, WeightBasedStrategy, selectBillingStrategy } = require('../src/features/configuration/service');

describe('Billing Strategy', () => {
  test('FlatFeeStrategy calculates constant fee', () => {
    const s = new FlatFeeStrategy(25);
    expect(s.calculate({})).toBe(25);
    expect(s.calculate({ weightKg: 100 })).toBe(25);
  });

  test('WeightBasedStrategy calculates rate * weight', () => {
    const s = new WeightBasedStrategy(10);
    expect(s.calculate({ weightKg: 0 })).toBe(0);
    expect(s.calculate({ weightKg: 5 })).toBe(50);
  });

  test('selectBillingStrategy returns correct strategy', () => {
    let cfg = { billingModels: [{ name: 'weight', rate: 3 }] };
    let s = selectBillingStrategy(cfg);
    expect(s).toBeInstanceOf(WeightBasedStrategy);
    expect(s.calculate({ weightKg: 4 })).toBe(12);

    cfg = { billingModels: [{ name: 'flat', rate: 7 }] };
    s = selectBillingStrategy(cfg);
    expect(s).toBeInstanceOf(FlatFeeStrategy);
    expect(s.calculate({})).toBe(7);
  });
});
