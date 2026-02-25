// SectorData Schema & Validation
// MongoDB collection: sector_data

/**
 * Schema shape:
 * {
 *   sectorName: String,
 *   industry: String,
 *   avgPE: Number,
 *   avgGrowth: Number,               // % average revenue growth
 *   sectorIndexPerformance: Number,   // % YTD performance
 *   topPerformingStocks: [{ symbol, return: Number }],
 *   worstPerformingStocks: [{ symbol, return: Number }],
 *   lastUpdated: Date,
 * }
 */

export function validateSectorData(data) {
  const errors = [];
  if (!data.sectorName || typeof data.sectorName !== 'string') {
    errors.push('sectorName is required');
  }
  return { valid: errors.length === 0, errors };
}

export function getSectorCollection(db) {
  return db.collection('sector_data');
}

export async function ensureSectorIndexes(db) {
  const col = db.collection('sector_data');
  await Promise.all([
    col.createIndex({ sectorName: 1 }, { unique: true }),
    col.createIndex({ sectorIndexPerformance: -1 }),
  ]);
}

/**
 * Seed sector data for Indian market sectors
 */
export function generateSeedSectors() {
  return [
    {
      sectorName: 'Technology',
      industry: 'Information Technology',
      avgPE: 28.5,
      avgGrowth: 8.2,
      sectorIndexPerformance: 14.5,
      topPerformingStocks: [
        { symbol: 'TCS', return: 18.2 },
        { symbol: 'INFY', return: 12.5 },
        { symbol: 'HCLTECH', return: 22.1 },
      ],
      worstPerformingStocks: [
        { symbol: 'WIPRO', return: -4.2 },
        { symbol: 'TECHM', return: -1.8 },
        { symbol: 'MPHASIS', return: 2.1 },
      ],
      lastUpdated: new Date().toISOString(),
    },
    {
      sectorName: 'Financial Services',
      industry: 'Banking & Finance',
      avgPE: 18.2,
      avgGrowth: 18.5,
      sectorIndexPerformance: 22.8,
      topPerformingStocks: [
        { symbol: 'ICICIBANK', return: 28.5 },
        { symbol: 'HDFCBANK', return: 18.2 },
        { symbol: 'SBIN', return: 32.1 },
      ],
      worstPerformingStocks: [
        { symbol: 'BANDHANBNK', return: -18.5 },
        { symbol: 'IDFCFIRSTB', return: -8.2 },
        { symbol: 'FEDERALBNK', return: 4.5 },
      ],
      lastUpdated: new Date().toISOString(),
    },
    {
      sectorName: 'Energy',
      industry: 'Oil & Gas',
      avgPE: 12.8,
      avgGrowth: 10.5,
      sectorIndexPerformance: 8.2,
      topPerformingStocks: [
        { symbol: 'RELIANCE', return: 12.8 },
        { symbol: 'ONGC', return: 28.5 },
        { symbol: 'ADANGREEN', return: 42.1 },
      ],
      worstPerformingStocks: [
        { symbol: 'GAIL', return: -5.2 },
        { symbol: 'IOC', return: -3.8 },
        { symbol: 'BPCL', return: 1.2 },
      ],
      lastUpdated: new Date().toISOString(),
    },
    {
      sectorName: 'Automobile',
      industry: 'Auto & Auto Components',
      avgPE: 22.5,
      avgGrowth: 15.8,
      sectorIndexPerformance: 28.5,
      topPerformingStocks: [
        { symbol: 'TATAMOTORS', return: 42.5 },
        { symbol: 'M&M', return: 35.2 },
        { symbol: 'MARUTI', return: 22.1 },
      ],
      worstPerformingStocks: [
        { symbol: 'ASHOKLEY', return: -2.5 },
        { symbol: 'HEROMOTOCO', return: 5.8 },
        { symbol: 'BAJAJ-AUTO', return: 8.2 },
      ],
      lastUpdated: new Date().toISOString(),
    },
    {
      sectorName: 'Healthcare',
      industry: 'Pharmaceuticals',
      avgPE: 32.1,
      avgGrowth: 9.8,
      sectorIndexPerformance: 12.2,
      topPerformingStocks: [
        { symbol: 'SUNPHARMA', return: 22.5 },
        { symbol: 'DRREDDY', return: 18.8 },
        { symbol: 'CIPLA', return: 15.2 },
      ],
      worstPerformingStocks: [
        { symbol: 'BIOCON', return: -12.5 },
        { symbol: 'LUPIN', return: 2.1 },
        { symbol: 'AUROPHARMA', return: 5.5 },
      ],
      lastUpdated: new Date().toISOString(),
    },
    {
      sectorName: 'Consumer Goods',
      industry: 'FMCG',
      avgPE: 55.2,
      avgGrowth: 6.5,
      sectorIndexPerformance: -2.5,
      topPerformingStocks: [
        { symbol: 'ITC', return: 8.5 },
        { symbol: 'NESTLEIND', return: 5.2 },
        { symbol: 'BRITANNIA', return: 4.8 },
      ],
      worstPerformingStocks: [
        { symbol: 'HINDUNILVR', return: -12.8 },
        { symbol: 'DABUR', return: -8.5 },
        { symbol: 'MARICO', return: -5.2 },
      ],
      lastUpdated: new Date().toISOString(),
    },
    {
      sectorName: 'Metals & Mining',
      industry: 'Metals',
      avgPE: 9.8,
      avgGrowth: 12.2,
      sectorIndexPerformance: 18.5,
      topPerformingStocks: [
        { symbol: 'TATASTEEL', return: 28.5 },
        { symbol: 'HINDALCO', return: 32.1 },
        { symbol: 'JSWSTEEL', return: 25.8 },
      ],
      worstPerformingStocks: [
        { symbol: 'VEDL', return: -5.8 },
        { symbol: 'NMDC', return: 2.1 },
        { symbol: 'COALINDIA', return: 5.5 },
      ],
      lastUpdated: new Date().toISOString(),
    },
    {
      sectorName: 'Real Estate',
      industry: 'Realty',
      avgPE: 35.8,
      avgGrowth: 22.5,
      sectorIndexPerformance: 32.1,
      topPerformingStocks: [
        { symbol: 'DLF', return: 45.2 },
        { symbol: 'GODREJPROP', return: 38.5 },
        { symbol: 'OBEROIRLTY', return: 52.1 },
      ],
      worstPerformingStocks: [
        { symbol: 'PRESTIGE', return: 8.5 },
        { symbol: 'BRIGADE', return: 12.2 },
        { symbol: 'SOBHA', return: 5.8 },
      ],
      lastUpdated: new Date().toISOString(),
    },
    {
      sectorName: 'Infrastructure',
      industry: 'Construction & Engineering',
      avgPE: 28.2,
      avgGrowth: 18.2,
      sectorIndexPerformance: 15.8,
      topPerformingStocks: [
        { symbol: 'LT', return: 22.5 },
        { symbol: 'ADANIPORTS', return: 18.8 },
        { symbol: 'ULTRACEMCO', return: 15.2 },
      ],
      worstPerformingStocks: [
        { symbol: 'NBCC', return: -2.5 },
        { symbol: 'IRB', return: 5.8 },
        { symbol: 'NCC', return: 8.2 },
      ],
      lastUpdated: new Date().toISOString(),
    },
    {
      sectorName: 'Telecom',
      industry: 'Telecom Services',
      avgPE: 42.5,
      avgGrowth: 14.5,
      sectorIndexPerformance: 5.8,
      topPerformingStocks: [
        { symbol: 'BHARTIARTL', return: 18.2 },
        { symbol: 'RELIANCE', return: 12.5 },
      ],
      worstPerformingStocks: [
        { symbol: 'IDEA', return: -22.5 },
      ],
      lastUpdated: new Date().toISOString(),
    },
  ];
}
