// CompanyFundamentals Schema & Validation
// MongoDB collection: company_fundamentals

/**
 * Schema shape for reference:
 * {
 *   symbol: String,
 *   companyName: String,
 *   sector: String,
 *   industry: String,
 *
 *   // Financial metrics
 *   revenue: Number,
 *   revenueGrowth: Number,          // % YoY
 *   netProfit: Number,
 *   netProfitGrowth: Number,        // % YoY
 *   operatingMargin: Number,        // %
 *   ROE: Number,                    // %
 *   ROCE: Number,                   // %
 *   debtToEquity: Number,
 *   freeCashFlow: Number,
 *
 *   // Valuation
 *   peRatio: Number,
 *   pbRatio: Number,
 *   evEbitda: Number,
 *   pegRatio: Number,
 *
 *   // Institutional ownership
 *   fiiHolding: Number,             // %
 *   fiiChange: Number,              // % change QoQ
 *   diiHolding: Number,             // %
 *   diiChange: Number,              // % change QoQ
 *
 *   // Historical arrays (last 8 quarters or 5 years)
 *   revenueHistory: [{ period: String, value: Number }],
 *   profitHistory: [{ period: String, value: Number }],
 *   marginHistory: [{ period: String, value: Number }],
 *
 *   // Metadata
 *   lastUpdated: Date,
 *   dataSource: String,
 * }
 */

export function validateCompanyFundamentals(data) {
  const errors = [];

  if (!data.symbol || typeof data.symbol !== 'string') {
    errors.push('symbol is required and must be a string');
  }
  if (!data.companyName || typeof data.companyName !== 'string') {
    errors.push('companyName is required');
  }

  // Numeric fields - optional but must be numbers if present
  const numericFields = [
    'revenue', 'revenueGrowth', 'netProfit', 'netProfitGrowth',
    'operatingMargin', 'ROE', 'ROCE', 'debtToEquity', 'freeCashFlow',
    'peRatio', 'pbRatio', 'evEbitda', 'pegRatio',
    'fiiHolding', 'fiiChange', 'diiHolding', 'diiChange',
  ];

  for (const field of numericFields) {
    if (data[field] !== undefined && data[field] !== null && typeof data[field] !== 'number') {
      errors.push(`${field} must be a number`);
    }
  }

  // Array fields
  const arrayFields = ['revenueHistory', 'profitHistory', 'marginHistory'];
  for (const field of arrayFields) {
    if (data[field] && !Array.isArray(data[field])) {
      errors.push(`${field} must be an array`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function getCompanyFundamentalsCollection(db) {
  return db.collection('company_fundamentals');
}

export async function ensureCompanyIndexes(db) {
  const col = db.collection('company_fundamentals');
  await Promise.all([
    col.createIndex({ symbol: 1 }, { unique: true }),
    col.createIndex({ sector: 1 }),
    col.createIndex({ industry: 1 }),
    col.createIndex({ lastUpdated: 1 }),
  ]);
}

/**
 * Generate sample/seed company data for Indian equities
 */
export function generateSampleCompany(symbol) {
  const companies = {
    'RELIANCE': {
      symbol: 'RELIANCE', companyName: 'Reliance Industries Ltd', sector: 'Energy', industry: 'Oil & Gas Refining',
      revenue: 975430, revenueGrowth: 12.3, netProfit: 79020, netProfitGrowth: 9.8,
      operatingMargin: 15.2, ROE: 9.1, ROCE: 10.5, debtToEquity: 0.39, freeCashFlow: 42500,
      peRatio: 28.5, pbRatio: 2.6, evEbitda: 16.8, pegRatio: 2.3,
      fiiHolding: 22.4, fiiChange: 0.8, diiHolding: 14.2, diiChange: -0.3,
      revenueHistory: [
        { period: 'Q1 FY25', value: 243800 }, { period: 'Q2 FY25', value: 248600 },
        { period: 'Q3 FY25', value: 251200 }, { period: 'Q4 FY25', value: 231830 },
        { period: 'Q1 FY26', value: 255400 }, { period: 'Q2 FY26', value: 261200 },
      ],
      profitHistory: [
        { period: 'Q1 FY25', value: 18950 }, { period: 'Q2 FY25', value: 19820 },
        { period: 'Q3 FY25', value: 20400 }, { period: 'Q4 FY25', value: 19850 },
        { period: 'Q1 FY26', value: 21200 }, { period: 'Q2 FY26', value: 22100 },
      ],
      marginHistory: [
        { period: 'Q1 FY25', value: 14.8 }, { period: 'Q2 FY25', value: 15.1 },
        { period: 'Q3 FY25', value: 15.5 }, { period: 'Q4 FY25', value: 14.9 },
        { period: 'Q1 FY26', value: 15.3 }, { period: 'Q2 FY26', value: 15.8 },
      ],
    },
    'TCS': {
      symbol: 'TCS', companyName: 'Tata Consultancy Services', sector: 'Technology', industry: 'IT Services',
      revenue: 240893, revenueGrowth: 8.2, netProfit: 46540, netProfitGrowth: 7.1,
      operatingMargin: 24.8, ROE: 47.2, ROCE: 58.5, debtToEquity: 0.08, freeCashFlow: 38200,
      peRatio: 32.1, pbRatio: 14.8, evEbitda: 24.5, pegRatio: 3.8,
      fiiHolding: 12.8, fiiChange: -0.4, diiHolding: 8.9, diiChange: 0.6,
      revenueHistory: [
        { period: 'Q1 FY25', value: 58200 }, { period: 'Q2 FY25', value: 59692 },
        { period: 'Q3 FY25', value: 61080 }, { period: 'Q4 FY25', value: 61921 },
        { period: 'Q1 FY26', value: 63200 }, { period: 'Q2 FY26', value: 64500 },
      ],
      profitHistory: [
        { period: 'Q1 FY25', value: 11280 }, { period: 'Q2 FY25', value: 11540 },
        { period: 'Q3 FY25', value: 11800 }, { period: 'Q4 FY25', value: 11920 },
        { period: 'Q1 FY26', value: 12100 }, { period: 'Q2 FY26', value: 12400 },
      ],
      marginHistory: [
        { period: 'Q1 FY25', value: 24.2 }, { period: 'Q2 FY25', value: 24.5 },
        { period: 'Q3 FY25', value: 25.1 }, { period: 'Q4 FY25', value: 24.8 },
        { period: 'Q1 FY26', value: 25.0 }, { period: 'Q2 FY26', value: 25.3 },
      ],
    },
    'HDFCBANK': {
      symbol: 'HDFCBANK', companyName: 'HDFC Bank Ltd', sector: 'Financial Services', industry: 'Banking',
      revenue: 297450, revenueGrowth: 24.5, netProfit: 58340, netProfitGrowth: 18.2,
      operatingMargin: 32.5, ROE: 16.8, ROCE: 7.2, debtToEquity: 6.5, freeCashFlow: 28500,
      peRatio: 19.8, pbRatio: 3.2, evEbitda: null, pegRatio: 1.1,
      fiiHolding: 33.2, fiiChange: 1.2, diiHolding: 21.5, diiChange: -0.5,
      revenueHistory: [
        { period: 'Q1 FY25', value: 68200 }, { period: 'Q2 FY25', value: 72300 },
        { period: 'Q3 FY25', value: 75800 }, { period: 'Q4 FY25', value: 81150 },
        { period: 'Q1 FY26', value: 84500 }, { period: 'Q2 FY26', value: 88200 },
      ],
      profitHistory: [
        { period: 'Q1 FY25', value: 13200 }, { period: 'Q2 FY25', value: 14100 },
        { period: 'Q3 FY25', value: 15040 }, { period: 'Q4 FY25', value: 16000 },
        { period: 'Q1 FY26', value: 16800 }, { period: 'Q2 FY26', value: 17500 },
      ],
      marginHistory: [
        { period: 'Q1 FY25', value: 31.2 }, { period: 'Q2 FY25', value: 31.8 },
        { period: 'Q3 FY25', value: 32.5 }, { period: 'Q4 FY25', value: 33.0 },
        { period: 'Q1 FY26', value: 32.8 }, { period: 'Q2 FY26', value: 33.2 },
      ],
    },
    'INFY': {
      symbol: 'INFY', companyName: 'Infosys Ltd', sector: 'Technology', industry: 'IT Services',
      revenue: 162890, revenueGrowth: 5.8, netProfit: 29640, netProfitGrowth: 4.2,
      operatingMargin: 21.2, ROE: 32.5, ROCE: 40.1, debtToEquity: 0.11, freeCashFlow: 22400,
      peRatio: 27.8, pbRatio: 8.9, evEbitda: 20.1, pegRatio: 4.7,
      fiiHolding: 34.5, fiiChange: -0.9, diiHolding: 16.2, diiChange: 0.4,
      revenueHistory: [
        { period: 'Q1 FY25', value: 39310 }, { period: 'Q2 FY25', value: 40250 },
        { period: 'Q3 FY25', value: 41410 }, { period: 'Q4 FY25', value: 41920 },
        { period: 'Q1 FY26', value: 42800 }, { period: 'Q2 FY26', value: 43500 },
      ],
      profitHistory: [
        { period: 'Q1 FY25', value: 7120 }, { period: 'Q2 FY25', value: 7280 },
        { period: 'Q3 FY25', value: 7540 }, { period: 'Q4 FY25', value: 7700 },
        { period: 'Q1 FY26', value: 7850 }, { period: 'Q2 FY26', value: 8000 },
      ],
      marginHistory: [
        { period: 'Q1 FY25', value: 20.8 }, { period: 'Q2 FY25', value: 21.0 },
        { period: 'Q3 FY25', value: 21.5 }, { period: 'Q4 FY25', value: 21.2 },
        { period: 'Q1 FY26', value: 21.4 }, { period: 'Q2 FY26', value: 21.8 },
      ],
    },
    'ICICIBANK': {
      symbol: 'ICICIBANK', companyName: 'ICICI Bank Ltd', sector: 'Financial Services', industry: 'Banking',
      revenue: 218500, revenueGrowth: 22.1, netProfit: 44780, netProfitGrowth: 24.5,
      operatingMargin: 35.2, ROE: 17.8, ROCE: 7.8, debtToEquity: 5.8, freeCashFlow: 22100,
      peRatio: 21.5, pbRatio: 3.8, evEbitda: null, pegRatio: 0.9,
      fiiHolding: 42.8, fiiChange: 0.6, diiHolding: 18.9, diiChange: 0.3,
      revenueHistory: [
        { period: 'Q1 FY25', value: 50200 }, { period: 'Q2 FY25', value: 53100 },
        { period: 'Q3 FY25', value: 55800 }, { period: 'Q4 FY25', value: 59400 },
        { period: 'Q1 FY26', value: 62500 }, { period: 'Q2 FY26', value: 65300 },
      ],
      profitHistory: [
        { period: 'Q1 FY25', value: 10100 }, { period: 'Q2 FY25', value: 10850 },
        { period: 'Q3 FY25', value: 11430 }, { period: 'Q4 FY25', value: 12400 },
        { period: 'Q1 FY26', value: 13100 }, { period: 'Q2 FY26', value: 13800 },
      ],
      marginHistory: [
        { period: 'Q1 FY25', value: 34.5 }, { period: 'Q2 FY25', value: 35.0 },
        { period: 'Q3 FY25', value: 35.5 }, { period: 'Q4 FY25', value: 35.8 },
        { period: 'Q1 FY26', value: 35.2 }, { period: 'Q2 FY26', value: 35.6 },
      ],
    },
    'WIPRO': {
      symbol: 'WIPRO', companyName: 'Wipro Ltd', sector: 'Technology', industry: 'IT Services',
      revenue: 89820, revenueGrowth: 1.8, netProfit: 12450, netProfitGrowth: -2.1,
      operatingMargin: 16.2, ROE: 15.8, ROCE: 19.2, debtToEquity: 0.22, freeCashFlow: 9800,
      peRatio: 24.5, pbRatio: 3.8, evEbitda: 17.2, pegRatio: 13.6,
      fiiHolding: 8.2, fiiChange: -1.2, diiHolding: 12.5, diiChange: 0.8,
      revenueHistory: [
        { period: 'Q1 FY25', value: 22200 }, { period: 'Q2 FY25', value: 22350 },
        { period: 'Q3 FY25', value: 22480 }, { period: 'Q4 FY25', value: 22790 },
        { period: 'Q1 FY26', value: 22900 }, { period: 'Q2 FY26', value: 23100 },
      ],
      profitHistory: [
        { period: 'Q1 FY25', value: 3100 }, { period: 'Q2 FY25', value: 3050 },
        { period: 'Q3 FY25', value: 3180 }, { period: 'Q4 FY25', value: 3120 },
        { period: 'Q1 FY26', value: 3200 }, { period: 'Q2 FY26', value: 3250 },
      ],
      marginHistory: [
        { period: 'Q1 FY25', value: 15.8 }, { period: 'Q2 FY25', value: 16.0 },
        { period: 'Q3 FY25', value: 16.5 }, { period: 'Q4 FY25', value: 16.2 },
        { period: 'Q1 FY26', value: 16.0 }, { period: 'Q2 FY26', value: 16.4 },
      ],
    },
    'TATAMOTORS': {
      symbol: 'TATAMOTORS', companyName: 'Tata Motors Ltd', sector: 'Automobile', industry: 'Auto - Cars & Jeeps',
      revenue: 437280, revenueGrowth: 26.5, netProfit: 31820, netProfitGrowth: 112.5,
      operatingMargin: 12.8, ROE: 28.5, ROCE: 16.2, debtToEquity: 1.15, freeCashFlow: 18200,
      peRatio: 8.5, pbRatio: 3.5, evEbitda: 5.2, pegRatio: 0.08,
      fiiHolding: 18.5, fiiChange: 2.1, diiHolding: 22.8, diiChange: 0.5,
      revenueHistory: [
        { period: 'Q1 FY25', value: 100500 }, { period: 'Q2 FY25', value: 108200 },
        { period: 'Q3 FY25', value: 112800 }, { period: 'Q4 FY25', value: 115780 },
        { period: 'Q1 FY26', value: 118500 }, { period: 'Q2 FY26', value: 122000 },
      ],
      profitHistory: [
        { period: 'Q1 FY25', value: 5820 }, { period: 'Q2 FY25', value: 7200 },
        { period: 'Q3 FY25', value: 8400 }, { period: 'Q4 FY25', value: 10400 },
        { period: 'Q1 FY26', value: 11200 }, { period: 'Q2 FY26', value: 12000 },
      ],
      marginHistory: [
        { period: 'Q1 FY25', value: 11.2 }, { period: 'Q2 FY25', value: 12.0 },
        { period: 'Q3 FY25', value: 12.8 }, { period: 'Q4 FY25', value: 13.5 },
        { period: 'Q1 FY26', value: 13.2 }, { period: 'Q2 FY26', value: 13.8 },
      ],
    },
    'SUNPHARMA': {
      symbol: 'SUNPHARMA', companyName: 'Sun Pharmaceutical Industries', sector: 'Healthcare', industry: 'Pharma',
      revenue: 51280, revenueGrowth: 11.2, netProfit: 10850, netProfitGrowth: 18.5,
      operatingMargin: 28.5, ROE: 16.2, ROCE: 19.8, debtToEquity: 0.18, freeCashFlow: 8500,
      peRatio: 38.2, pbRatio: 6.1, evEbitda: 28.5, pegRatio: 2.1,
      fiiHolding: 14.2, fiiChange: 0.5, diiHolding: 18.8, diiChange: 0.2,
      revenueHistory: [
        { period: 'Q1 FY25', value: 12200 }, { period: 'Q2 FY25', value: 12650 },
        { period: 'Q3 FY25', value: 13100 }, { period: 'Q4 FY25', value: 13330 },
        { period: 'Q1 FY26', value: 13800 }, { period: 'Q2 FY26', value: 14200 },
      ],
      profitHistory: [
        { period: 'Q1 FY25', value: 2500 }, { period: 'Q2 FY25', value: 2680 },
        { period: 'Q3 FY25', value: 2820 }, { period: 'Q4 FY25', value: 2850 },
        { period: 'Q1 FY26', value: 3000 }, { period: 'Q2 FY26', value: 3150 },
      ],
      marginHistory: [
        { period: 'Q1 FY25', value: 27.5 }, { period: 'Q2 FY25', value: 28.0 },
        { period: 'Q3 FY25', value: 28.8 }, { period: 'Q4 FY25', value: 28.2 },
        { period: 'Q1 FY26', value: 28.5 }, { period: 'Q2 FY26', value: 29.0 },
      ],
    },
  };

  const key = symbol.toUpperCase();
  if (companies[key]) {
    return { ...companies[key], lastUpdated: new Date().toISOString(), dataSource: 'seed' };
  }

  // Generic fallback
  return {
    symbol: key,
    companyName: `${key} Ltd`,
    sector: 'Unknown',
    industry: 'Unknown',
    revenue: Math.round(Math.random() * 100000 + 10000),
    revenueGrowth: parseFloat((Math.random() * 30 - 5).toFixed(1)),
    netProfit: Math.round(Math.random() * 20000 + 1000),
    netProfitGrowth: parseFloat((Math.random() * 40 - 10).toFixed(1)),
    operatingMargin: parseFloat((Math.random() * 25 + 5).toFixed(1)),
    ROE: parseFloat((Math.random() * 30 + 5).toFixed(1)),
    ROCE: parseFloat((Math.random() * 35 + 5).toFixed(1)),
    debtToEquity: parseFloat((Math.random() * 2).toFixed(2)),
    freeCashFlow: Math.round(Math.random() * 15000 + 1000),
    peRatio: parseFloat((Math.random() * 40 + 5).toFixed(1)),
    pbRatio: parseFloat((Math.random() * 10 + 0.5).toFixed(1)),
    evEbitda: parseFloat((Math.random() * 30 + 3).toFixed(1)),
    pegRatio: parseFloat((Math.random() * 5 + 0.2).toFixed(1)),
    fiiHolding: parseFloat((Math.random() * 40 + 2).toFixed(1)),
    fiiChange: parseFloat((Math.random() * 4 - 2).toFixed(1)),
    diiHolding: parseFloat((Math.random() * 30 + 5).toFixed(1)),
    diiChange: parseFloat((Math.random() * 3 - 1.5).toFixed(1)),
    revenueHistory: Array.from({ length: 6 }, (_, i) => ({
      period: `Q${(i % 4) + 1} FY${25 + Math.floor(i / 4)}`,
      value: Math.round(Math.random() * 25000 + 5000),
    })),
    profitHistory: Array.from({ length: 6 }, (_, i) => ({
      period: `Q${(i % 4) + 1} FY${25 + Math.floor(i / 4)}`,
      value: Math.round(Math.random() * 5000 + 500),
    })),
    marginHistory: Array.from({ length: 6 }, (_, i) => ({
      period: `Q${(i % 4) + 1} FY${25 + Math.floor(i / 4)}`,
      value: parseFloat((Math.random() * 20 + 5).toFixed(1)),
    })),
    lastUpdated: new Date().toISOString(),
    dataSource: 'generated',
  };
}
