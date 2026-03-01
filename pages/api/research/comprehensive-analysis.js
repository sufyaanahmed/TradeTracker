// POST /api/research/comprehensive-analysis
// Comprehensive stock analysis combining fundamentals, macro, portfolio context, and AI
import { authenticate } from '../../../lib/auth';
import { connectToDatabase } from '../../../lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const auth = await authenticate(req);
  if (auth.error) return res.status(auth.status).json({ error: auth.error });

  const { symbol } = req.body;
  if (!symbol) {
    return res.status(400).json({ error: 'Symbol is required' });
  }

  try {
    const { db } = await connectToDatabase();
    const userId = auth.userId;

    // 1. Fetch company fundamentals
    const companyCol = db.collection('company_fundamentals');
    const company = await companyCol.findOne({ symbol: symbol.toUpperCase() });
    
    if (!company) {
      return res.status(404).json({ error: `Company ${symbol} not found` });
    }

    // 2. Fetch macro data
    const macroCol = db.collection('macro_data');
    const macro = await macroCol.findOne({ type: 'latest' });

    // 3. Fetch user's active trades (portfolio)
    const tradesCol = db.collection('trades');
    const activeTrades = await tradesCol.find({ 
      userId, 
      status: 'open' 
    }).toArray();

    // 4. Calculate portfolio metrics
    const portfolioMetrics = calculatePortfolioMetrics(company, activeTrades);

    // 5. Analyze company valuation
    const valuationSignal = analyzeValuation(company);

    // 6. Analyze momentum and technicals
    const technicalSignal = analyzeTechnicals(company);

    // 7. Analyze macro context
    const macroSignal = analyzeMacroContext(company, macro);

    // 8. Calculate portfolio fit score
    const portfolioFitScore = calculatePortfolioFit(company, portfolioMetrics);

    // 9. Generate AI summary
    const aiSummary = await generateAISummary({
      company,
      macro,
      portfolioMetrics,
      valuationSignal,
      technicalSignal,
      macroSignal,
      portfolioFitScore
    });

    // 10. Calculate weighted rating (1-10 scale)
    const weightedRating = calculateWeightedRating({
      valuationSignal,
      technicalSignal,
      macroSignal,
      portfolioFitScore,
      company
    });

    return res.status(200).json({
      symbol: company.symbol,
      companyName: company.name,
      sector: company.sector,
      currentPrice: company.price?.current || 0,
      analysis: {
        summary: aiSummary,
        rating: weightedRating,
        signals: {
          valuation: valuationSignal,
          technical: technicalSignal,
          macro: macroSignal,
          portfolioFit: portfolioFitScore
        },
        fundamentals: {
          pe: company.valuation?.pe,
          pb: company.valuation?.pb,
          roe: company.profitability?.roe,
          debtToEquity: company.balanceSheet?.debtToEquity,
          revenueGrowth: company.growth?.revenueGrowth,
          profitGrowth: company.growth?.profitGrowth
        },
        portfolio: portfolioMetrics,
        recommendations: generateRecommendations({
          company,
          portfolioMetrics,
          weightedRating,
          valuationSignal,
          technicalSignal
        })
      }
    });
  } catch (error) {
    console.error('[comprehensive-analysis] Error:', error.message);
    return res.status(500).json({ error: 'Analysis failed', details: error.message });
  }
}

// Calculate portfolio correlation and sector exposure
function calculatePortfolioMetrics(company, activeTrades) {
  if (!activeTrades || activeTrades.length === 0) {
    return {
      hasPortfolio: false,
      totalValue: 0,
      sectorExposure: {},
      correlation: 'N/A',
      diversificationScore: 100
    };
  }

  // Calculate total portfolio value
  const totalValue = activeTrades.reduce((sum, trade) => {
    return sum + (trade.entryPrice * trade.quantity);
  }, 0);

  // Calculate sector exposure
  const sectorExposure = {};
  activeTrades.forEach(trade => {
    const sector = trade.sector || 'Unknown';
    if (!sectorExposure[sector]) {
      sectorExposure[sector] = 0;
    }
    sectorExposure[sector] += (trade.entryPrice * trade.quantity);
  });

  // Calculate percentage exposure
  Object.keys(sectorExposure).forEach(sector => {
    sectorExposure[sector] = ((sectorExposure[sector] / totalValue) * 100).toFixed(1);
  });

  // Check if company sector already exists in portfolio
  const companySector = company.sector || 'Unknown';
  const currentSectorExposure = parseFloat(sectorExposure[companySector] || 0);

  // Calculate diversification score (lower is better for adding new position)
  // If sector already has high exposure, score is lower
  let diversificationScore = 100;
  if (currentSectorExposure > 40) {
    diversificationScore = 30; // Very concentrated
  } else if (currentSectorExposure > 25) {
    diversificationScore = 60; // Moderately concentrated
  } else if (currentSectorExposure > 15) {
    diversificationScore = 80; // Good diversification
  }

  return {
    hasPortfolio: true,
    totalValue: totalValue.toFixed(2),
    sectorExposure,
    currentSectorExposure: currentSectorExposure.toFixed(1),
    diversificationScore,
    existingPositions: activeTrades.length
  };
}

// Analyze company valuation
function analyzeValuation(company) {
  const pe = company.valuation?.pe || 0;
  const pb = company.valuation?.pb || 0;
  const sectorPE = company.valuation?.sectorAvgPE || 25;
  const sectorPB = company.valuation?.sectorAvgPB || 3.5;

  let score = 50; // Neutral
  let signal = 'NEUTRAL';
  let reasons = [];

  // PE analysis
  if (pe > 0 && pe < sectorPE * 0.7) {
    score += 20;
    reasons.push(`Trading at ${((pe/sectorPE)*100).toFixed(0)}% of sector P/E (undervalued)`);
  } else if (pe > sectorPE * 1.5) {
    score -= 15;
    reasons.push(`Trading at ${((pe/sectorPE)*100).toFixed(0)}% of sector P/E (overvalued)`);
  }

  // PB analysis
  if (pb > 0 && pb < sectorPB * 0.7) {
    score += 15;
    reasons.push(`P/B below sector average (attractive)`);
  } else if (pb > sectorPB * 1.5) {
    score -= 10;
    reasons.push(`P/B above sector average (expensive)`);
  }

  // ROE analysis
  const roe = company.profitability?.roe || 0;
  if (roe > 20) {
    score += 15;
    reasons.push(`Strong ROE of ${roe.toFixed(1)}%`);
  } else if (roe < 10) {
    score -= 10;
    reasons.push(`Weak ROE of ${roe.toFixed(1)}%`);
  }

  // Determine signal
  if (score >= 70) signal = 'STRONG_BUY';
  else if (score >= 60) signal = 'BUY';
  else if (score >= 40) signal = 'NEUTRAL';
  else if (score >= 30) signal = 'SELL';
  else signal = 'STRONG_SELL';

  return { score, signal, reasons };
}

// Analyze technical momentum
function analyzeTechnicals(company) {
  const price = company.price?.current || 0;
  const week52High = company.price?.week52High || price;
  const week52Low = company.price?.week52Low || price;
  
  let score = 50;
  let signal = 'NEUTRAL';
  let reasons = [];

  // Distance from 52-week high
  const distanceFromHigh = ((price / week52High) * 100).toFixed(1);
  if (distanceFromHigh >= 95) {
    score += 20;
    reasons.push(`Near 52-week high (${distanceFromHigh}%)`);
  } else if (distanceFromHigh < 70) {
    score -= 10;
    reasons.push(`${(100-distanceFromHigh).toFixed(0)}% below 52-week high`);
  }

  // Distance from 52-week low
  const distanceFromLow = ((price / week52Low) * 100).toFixed(1);
  if (distanceFromLow < 110) {
    score += 15;
    reasons.push(`Close to 52-week low (value opportunity)`);
  }

  // Volume analysis (if available)
  if (company.technicals?.avgVolume) {
    const volumeRatio = (company.technicals.volume / company.technicals.avgVolume);
    if (volumeRatio > 1.5) {
      score += 10;
      reasons.push(`High volume activity (${(volumeRatio * 100).toFixed(0)}%)`);
    }
  }

  if (score >= 70) signal = 'STRONG_BUY';
  else if (score >= 60) signal = 'BUY';
  else if (score >= 40) signal = 'NEUTRAL';
  else signal = 'SELL';

  return { score, signal, reasons };
}

// Analyze macro economic context
function analyzeMacroContext(company, macro) {
  if (!macro) {
    return { score: 50, signal: 'NEUTRAL', reasons: ['Macro data unavailable'] };
  }

  let score = 50;
  let reasons = [];
  const sector = company.sector || 'Unknown';

  // India GDP context
  if (macro.india?.gdp?.current > 6) {
    score += 15;
    reasons.push(`Strong India GDP growth (${macro.india.gdp.current}%)`);
  } else if (macro.india?.gdp?.current < 4) {
    score -= 10;
    reasons.push(`Slowing India GDP growth (${macro.india.gdp.current}%)`);
  }

  // Inflation context
  if (macro.india?.inflation?.current < 4) {
    score += 10;
    reasons.push('Low inflation environment');
  } else if (macro.india?.inflation?.current > 6) {
    score -= 10;
    reasons.push(`High inflation (${macro.india.inflation.current}%)`);
  }

  // Interest rate context (rate cuts positive for most sectors)
  const trend = macro.india?.interestRate?.trend || 'stable';
  if (trend === 'falling') {
    score += 10;
    reasons.push('Falling interest rates (supportive)');
  } else if (trend === 'rising') {
    score -= 10;
    reasons.push('Rising interest rates (headwind)');
  }

  // Sector-specific macro impact
  if (sector === 'Banking' && macro.india?.interestRate?.current > 6) {
    score += 5;
    reasons.push('High rates benefit banking NIM');
  }
  if (sector === 'Technology' && macro.us?.gdp?.current > 2) {
    score += 10;
    reasons.push('Strong US economy supports IT services');
  }
  if (sector === 'Automobile' && macro.india?.gdp?.current > 6) {
    score += 10;
    reasons.push('Strong GDP growth supports auto demand');
  }

  let signal = 'NEUTRAL';
  if (score >= 70) signal = 'FAVORABLE';
  else if (score >= 50) signal = 'NEUTRAL';
  else signal = 'UNFAVORABLE';

  return { score, signal, reasons };
}

// Calculate portfolio fit
function calculatePortfolioFit(company, portfolioMetrics) {
  if (!portfolioMetrics.hasPortfolio) {
    return {
      score: 100,
      signal: 'EXCELLENT',
      reason: 'First position - excellent diversification opportunity'
    };
  }

  let score = portfolioMetrics.diversificationScore;
  let signal = 'GOOD';
  let reason = '';

  const sectorExposure = parseFloat(portfolioMetrics.currentSectorExposure);

  if (sectorExposure === 0) {
    score = 95;
    signal = 'EXCELLENT';
    reason = 'New sector - enhances diversification';
  } else if (sectorExposure < 15) {
    score = 85;
    signal = 'GOOD';
    reason = `Low sector exposure (${sectorExposure}%) - good fit`;
  } else if (sectorExposure < 25) {
    score = 70;
    signal = 'MODERATE';
    reason = `Moderate sector exposure (${sectorExposure}%) - consider size`;
  } else if (sectorExposure < 40) {
    score = 40;
    signal = 'CAUTION';
    reason = `High sector concentration (${sectorExposure}%) - increases risk`;
  } else {
    score = 20;
    signal = 'POOR';
    reason = `Very high sector concentration (${sectorExposure}%) - diversify`;
  }

  return { score, signal, reason };
}

// Generate AI-powered summary
async function generateAISummary(data) {
  const { company, macro, portfolioMetrics, valuationSignal, technicalSignal, macroSignal, portfolioFitScore } = data;

  const prompt = `You are a professional equity research analyst. Provide a concise 3-paragraph investment analysis for ${company.name} (${company.symbol}):

Company Context:
- Sector: ${company.sector}
- Current Price: ₹${company.price?.current || 0}
- Market Cap: ₹${company.marketCap || 'N/A'} Cr
- P/E Ratio: ${company.valuation?.pe || 'N/A'}
- ROE: ${company.profitability?.roe || 'N/A'}%
- Revenue Growth: ${company.growth?.revenueGrowth || 'N/A'}%
- Debt/Equity: ${company.balanceSheet?.debtToEquity || 'N/A'}

Valuation Signal: ${valuationSignal.signal} (Score: ${valuationSignal.score}/100)
Key Points: ${valuationSignal.reasons.join(', ')}

Technical Signal: ${technicalSignal.signal} (Score: ${technicalSignal.score}/100)
Key Points: ${technicalSignal.reasons.join(', ')}

Macro Context: ${macroSignal.signal}
India GDP: ${macro?.india?.gdp?.current || 'N/A'}%, Inflation: ${macro?.india?.inflation?.current || 'N/A'}%
Key Points: ${macroSignal.reasons.join(', ')}

Portfolio Context:
${portfolioMetrics.hasPortfolio ? `
- Total Portfolio Value: ₹${portfolioMetrics.totalValue}
- Existing Positions: ${portfolioMetrics.existingPositions}
- Current Sector Exposure: ${portfolioMetrics.currentSectorExposure}%
- Portfolio Fit: ${portfolioFitScore.signal} (${portfolioFitScore.reason})
` : '- This would be your first position'}

Write exactly 3 paragraphs:
1. Business quality and fundamental outlook (valuation, growth, profitability)
2. Technical setup and macro environment impact
3. Portfolio fit and risk considerations with clear recommendation

Be direct, data-driven, and actionable. Use specific numbers.`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600,
      },
    });

    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('[AI Summary] Error:', error.message);
    return `Unable to generate AI summary at this time. 

Based on quantitative analysis: ${company.name} shows ${valuationSignal.signal} valuation signals with ${technicalSignal.signal} technical momentum. The macro environment is ${macroSignal.signal} for the ${company.sector} sector. Portfolio fit is ${portfolioFitScore.signal}.

Key factors: ${[...valuationSignal.reasons, ...technicalSignal.reasons, ...macroSignal.reasons].slice(0, 3).join('; ')}.`;
  }
}

// Calculate overall weighted rating
function calculateWeightedRating(data) {
  const { valuationSignal, technicalSignal, macroSignal, portfolioFitScore, company } = data;

  // Weight configuration (total = 100%)
  const weights = {
    valuation: 0.35,      // 35% - Most important
    technical: 0.20,      // 20% - Timing matters
    macro: 0.20,          // 20% - Context matters
    portfolioFit: 0.15,   // 15% - Risk management
    quality: 0.10         // 10% - Business quality
  };

  // Normalize scores to 0-10 scale
  const valuationScore = (valuationSignal.score / 100) * 10;
  const technicalScore = (technicalSignal.score / 100) * 10;
  const macroScore = (macroSignal.score / 100) * 10;
  const portfolioScore = (portfolioFitScore.score / 100) * 10;

  // Quality score based on fundamentals
  let qualityScore = 5; // Neutral start
  const roe = company.profitability?.roe || 0;
  const debtToEquity = company.balanceSheet?.debtToEquity || 1;
  const revenueGrowth = company.growth?.revenueGrowth || 0;

  if (roe > 20) qualityScore += 2;
  else if (roe > 15) qualityScore += 1;
  else if (roe < 10) qualityScore -= 1;

  if (debtToEquity < 0.5) qualityScore += 1.5;
  else if (debtToEquity > 2) qualityScore -= 1.5;

  if (revenueGrowth > 20) qualityScore += 1.5;
  else if (revenueGrowth < 5) qualityScore -= 1;

  // Calculate weighted rating
  const rating = (
    valuationScore * weights.valuation +
    technicalScore * weights.technical +
    macroScore * weights.macro +
    portfolioScore * weights.portfolioFit +
    qualityScore * weights.quality
  );

  // Round to 1 decimal place
  const finalRating = Math.max(1, Math.min(10, parseFloat(rating.toFixed(1))));

  // Generate rating label
  let label = 'HOLD';
  if (finalRating >= 8) label = 'STRONG BUY';
  else if (finalRating >= 7) label = 'BUY';
  else if (finalRating >= 6) label = 'MODERATE BUY';
  else if (finalRating >= 5) label = 'HOLD';
  else if (finalRating >= 4) label = 'MODERATE SELL';
  else label = 'SELL';

  return {
    score: finalRating,
    label,
    components: {
      valuation: valuationScore.toFixed(1),
      technical: technicalScore.toFixed(1),
      macro: macroScore.toFixed(1),
      portfolioFit: portfolioScore.toFixed(1),
      quality: qualityScore.toFixed(1)
    }
  };
}

// Generate actionable recommendations
function generateRecommendations(data) {
  const { company, portfolioMetrics, weightedRating, valuationSignal, technicalSignal } = data;
  const recommendations = [];

  // Entry recommendation
  if (weightedRating.score >= 7) {
    recommendations.push({
      type: 'ENTRY',
      priority: 'HIGH',
      action: 'Consider initiating position',
      rationale: `Strong rating of ${weightedRating.score}/10 with ${valuationSignal.signal} valuation and ${technicalSignal.signal} momentum`
    });

    // Position sizing
    if (portfolioMetrics.hasPortfolio) {
      const suggestedAllocation = Math.min(10, 15 - parseFloat(portfolioMetrics.currentSectorExposure || 0));
      recommendations.push({
        type: 'SIZING',
        priority: 'MEDIUM',
        action: `Suggested allocation: ${suggestedAllocation.toFixed(0)}% of portfolio`,
        rationale: `Maintains diversification with current ${portfolioMetrics.currentSectorExposure}% sector exposure`
      });
    }
  } else if (weightedRating.score >= 5.5) {
    recommendations.push({
      type: 'ENTRY',
      priority: 'MEDIUM',
      action: 'Consider small position or wait for better entry',
      rationale: `Moderate rating of ${weightedRating.score}/10 - not compelling at current levels`
    });
  } else {
    recommendations.push({
      type: 'ENTRY',
      priority: 'LOW',
      action: 'Avoid or wait for improvement',
      rationale: `Below-average rating of ${weightedRating.score}/10 - better opportunities elsewhere`
    });
  }

  // Risk management
  if (portfolioMetrics.currentSectorExposure > 25) {
    recommendations.push({
      type: 'RISK',
      priority: 'HIGH',
      action: 'Caution on sector concentration',
      rationale: `Portfolio already has ${portfolioMetrics.currentSectorExposure}% exposure to ${company.sector}`
    });
  }

  // Valuation-based recommendation
  if (valuationSignal.score >= 70) {
    recommendations.push({
      type: 'VALUE',
      priority: 'HIGH',
      action: 'Attractive valuation opportunity',
      rationale: valuationSignal.reasons[0] || 'Trading below fair value'
    });
  }

  return recommendations;
}
