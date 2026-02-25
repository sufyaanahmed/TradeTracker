// MacroData Schema & Validation
// MongoDB collection: macro_data

/**
 * Schema shape:
 * {
 *   region: 'US' | 'INDIA',
 *
 *   // US Macro
 *   usInterestRate: Number,
 *   usInflation: Number,
 *   usBondYield10y: Number,
 *   dollarIndex: Number,
 *
 *   // India Macro
 *   rbiInterestRate: Number,
 *   indiaInflation: Number,
 *   indiaGDPGrowth: Number,
 *   crudeOilPrice: Number,
 *   usdInr: Number,
 *
 *   lastUpdated: Date,
 * }
 */

export function getMacroCollection(db) {
  return db.collection('macro_data');
}

export async function ensureMacroIndexes(db) {
  const col = db.collection('macro_data');
  await col.createIndex({ type: 1 }, { unique: true });
}

/**
 * Current macro data snapshot (seed/fallback)
 */
export function generateSeedMacro() {
  return {
    type: 'latest',

    // US Macro
    usInterestRate: 4.75,
    usInflation: 2.8,
    usBondYield10y: 4.32,
    dollarIndex: 104.5,

    // India Macro
    rbiInterestRate: 6.25,
    indiaInflation: 4.8,
    indiaGDPGrowth: 6.8,
    crudeOilPrice: 78.50,
    usdInr: 83.45,

    // Historical snapshots for trend
    usRateHistory: [
      { date: '2025-01', value: 5.25 },
      { date: '2025-04', value: 5.00 },
      { date: '2025-07', value: 4.75 },
      { date: '2025-10', value: 4.75 },
      { date: '2026-01', value: 4.75 },
    ],
    usInflationHistory: [
      { date: '2025-01', value: 3.1 },
      { date: '2025-04', value: 2.9 },
      { date: '2025-07', value: 2.7 },
      { date: '2025-10', value: 2.8 },
      { date: '2026-01', value: 2.8 },
    ],
    bondYieldHistory: [
      { date: '2025-01', value: 4.58 },
      { date: '2025-04', value: 4.42 },
      { date: '2025-07', value: 4.28 },
      { date: '2025-10', value: 4.35 },
      { date: '2026-01', value: 4.32 },
    ],
    dollarIndexHistory: [
      { date: '2025-01', value: 108.2 },
      { date: '2025-04', value: 106.5 },
      { date: '2025-07', value: 104.8 },
      { date: '2025-10', value: 105.2 },
      { date: '2026-01', value: 104.5 },
    ],
    rbiRateHistory: [
      { date: '2025-01', value: 6.50 },
      { date: '2025-04', value: 6.50 },
      { date: '2025-07', value: 6.25 },
      { date: '2025-10', value: 6.25 },
      { date: '2026-01', value: 6.25 },
    ],
    indiaInflationHistory: [
      { date: '2025-01', value: 5.2 },
      { date: '2025-04', value: 4.9 },
      { date: '2025-07', value: 4.6 },
      { date: '2025-10', value: 4.8 },
      { date: '2026-01', value: 4.8 },
    ],
    crudeOilHistory: [
      { date: '2025-01', value: 82.5 },
      { date: '2025-04', value: 79.8 },
      { date: '2025-07', value: 76.2 },
      { date: '2025-10', value: 78.5 },
      { date: '2026-01', value: 78.5 },
    ],
    usdInrHistory: [
      { date: '2025-01', value: 84.2 },
      { date: '2025-04', value: 83.8 },
      { date: '2025-07', value: 83.2 },
      { date: '2025-10', value: 83.5 },
      { date: '2026-01', value: 83.45 },
    ],

    lastUpdated: new Date().toISOString(),
  };
}
