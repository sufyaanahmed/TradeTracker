// Serverless function for AI stock analysis using Gemini API (POST /analyze-stock)
import { MongoClient } from 'mongodb';

// Simple authentication middleware for Next.js API routes
async function authenticate(req, res) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.error('No authorization header found');
    return { error: 'Unauthorized: No token provided', status: 401 };
  }
  
  const token = authHeader.split(' ')[1];

  if (!token) {
    console.error('Invalid token format');
    return { error: 'Unauthorized: Invalid token format', status: 401 };
  }

  try {
    // Parse Firebase JWT token to extract user_id
    console.log('Extracting UID from Firebase token');
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    console.log('Token payload:', payload);
    
    // Firebase tokens use 'user_id' field
    const uid = payload.user_id || payload.sub || payload.uid;
    
    if (!uid) {
      console.error('No user_id found in token payload');
      return { error: 'Unauthorized: Invalid token - no user_id', status: 401 };
    }
    
    console.log('Extracted UID:', uid);
    return { uid };
  } catch (error) {
    console.error('Error parsing token:', error);
    return { error: 'Unauthorized: Invalid token format', status: 401 };
  }
}

export default async function handler(req, res) {
  console.log('Analyze Stock API called:', req.method, req.url);
  console.log('Body:', req.body);

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Authenticate the request
  const authResult = await authenticate(req, res);
  if (authResult.error) {
    return res.status(authResult.status).json({ error: authResult.error });
  }
  
  const userId = authResult.uid;
  console.log('Authenticated user:', userId);

  try {
    const { stockSymbol, exchange } = req.body;
    // Use environment variables for API keys
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;

    if (!stockSymbol) {
      return res.status(400).json({ message: 'Stock symbol is required' });
    }

    if (!geminiApiKey) {
      return res.status(500).json({ message: 'Gemini API key not configured' });
    }

    // Check if this is a portfolio analysis
    const isPortfolioAnalysis = stockSymbol.toUpperCase() === 'PORTFOLIO';

    if (isPortfolioAnalysis) {
      // Portfolio Analysis - Get user's trades and analyze them
      try {
        const mongoUri = process.env.MONGO_URL;
        
        if (!mongoUri) {
          throw new Error('Database connection not configured');
        }
        
        const client = new MongoClient(mongoUri, {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        
        await client.connect();
        const db = client.db();
        const userTrades = await db.collection('trades').find({ userId }).sort({ date: -1 }).toArray();
        await client.close();

        if (userTrades.length === 0) {
          return res.status(200).json({
            stockSymbol: 'PORTFOLIO',
            exchange: 'ANALYSIS',
            timestamp: new Date().toISOString(),
            rawAnalysis: `**PORTFOLIO ANALYSIS**

No trades found in your portfolio. Start by adding some trades to get personalized portfolio insights and recommendations.

**Next Steps:**
1. Add your first trade using the "Add Trade" button
2. Include both profitable and losing trades for better analysis
3. Add detailed reasons for each trade to improve insights

Once you have trades, I can provide:
- Performance analysis and patterns
- Risk assessment and diversification insights
- Trading strategy recommendations
- Market timing analysis
- Sector allocation review`
          });
        }

        // Calculate portfolio statistics
        const totalTrades = userTrades.length;
        const totalPnL = userTrades.reduce((sum, trade) => sum + (trade.pl || 0), 0);
        const profitableTrades = userTrades.filter(t => t.pl > 0);
        const losingTrades = userTrades.filter(t => t.pl < 0);
        const winRate = totalTrades > 0 ? (profitableTrades.length / totalTrades * 100).toFixed(1) : 0;
        const avgWin = profitableTrades.length > 0 ? profitableTrades.reduce((sum, t) => sum + t.pl, 0) / profitableTrades.length : 0;
        const avgLoss = losingTrades.length > 0 ? losingTrades.reduce((sum, t) => sum + t.pl, 0) / losingTrades.length : 0;
        const profitFactor = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0;

        // Group trades by stock for sector analysis
        const stockGroups = {};
        userTrades.forEach(trade => {
          if (!stockGroups[trade.name]) {
            stockGroups[trade.name] = [];
          }
          stockGroups[trade.name].push(trade);
        });

        const portfolioData = {
          totalTrades,
          totalPnL,
          winRate,
          avgWin,
          avgLoss,
          profitFactor,
          trades: userTrades,
          stockGroups
        };

        const portfolioPrompt = `You are a senior portfolio analyst at a leading investment firm. Analyze this trading portfolio and provide comprehensive insights.

**PORTFOLIO DATA:**
- Total Trades: ${totalTrades}
- Total P&L: $${totalPnL.toFixed(2)}
- Win Rate: ${winRate}%
- Average Win: $${avgWin.toFixed(2)}
- Average Loss: $${avgLoss.toFixed(2)}
- Profit Factor: ${profitFactor.toFixed(2)}

**TRADE BREAKDOWN:**
${userTrades.map(trade => `- ${trade.name}: $${trade.pl} (${trade.reason})`).join('\n')}

**STOCK CONCENTRATION:**
${Object.entries(stockGroups).map(([stock, trades]) => {
  const totalPl = trades.reduce((sum, t) => sum + t.pl, 0);
  return `- ${stock}: ${trades.length} trades, $${totalPl.toFixed(2)} total P&L`;
}).join('\n')}

Provide a comprehensive portfolio analysis following this structure:

---
EXECUTIVE SUMMARY
- Overall portfolio performance assessment
- Key strengths and areas for improvement
- Risk-adjusted return analysis
---
TRADING PATTERN ANALYSIS
- Analyze your trading frequency, timing, and patterns
- Identify any biases (overconfidence, loss aversion, etc.)
- Assess position sizing and risk management
---
SECTOR & STOCK CONCENTRATION
- Analyze sector diversification
- Identify over-concentrated positions
- Recommend diversification strategies
---
PERFORMANCE METRICS
- Win rate analysis and improvement suggestions
- Profit factor interpretation
- Risk management recommendations
---
STRATEGIC RECOMMENDATIONS
- Specific actions to improve performance
- Risk management improvements
- Trading strategy refinements
- Market timing suggestions
---
FUTURE OUTLOOK
- Market conditions assessment
- Portfolio positioning recommendations
- Next steps for portfolio optimization
---

Write this as a professional portfolio analysis report. Be specific, actionable, and data-driven.`;

        // Call Gemini API for portfolio analysis
        let analysisText;
        const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
        
        for (const modelName of modelsToTry) {
          try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: portfolioPrompt
                  }]
                }]
              })
            });

            if (!response.ok) {
              throw new Error(`Gemini API error: ${response.status}`);
            }

            const data = await response.json();
            analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (analysisText) {
              break;
            }
          } catch (modelError) {
            if (modelName === modelsToTry[modelsToTry.length - 1]) {
              throw modelError;
            }
          }
        }

        if (!analysisText) {
          throw new Error('No portfolio analysis generated');
        }

        return res.status(200).json({
          stockSymbol: 'PORTFOLIO',
          exchange: 'ANALYSIS',
          timestamp: new Date().toISOString(),
          rawAnalysis: analysisText
        });

      } catch (error) {
        console.error('Error in portfolio analysis:', error);
        return res.status(500).json({ 
          message: 'Portfolio analysis failed', 
          error: error.message
        });
      }
    }

    // Individual Stock Analysis
    // Fetch real data from Alpha Vantage
    let realDataSection = '';
    if (alphaVantageKey) {
      try {
        console.log('Fetching real data from Alpha Vantage...');
        
        // Get comprehensive stock data
        const [quoteResponse, overviewResponse] = await Promise.all([
          fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${alphaVantageKey}`),
          fetch(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${stockSymbol}&apikey=${alphaVantageKey}`)
        ]);

        const quoteData = await quoteResponse.json();
        const overviewData = await overviewResponse.json();

        console.log('Alpha Vantage Quote Data:', quoteData);
        console.log('Alpha Vantage Overview Data:', overviewData);

        // Check if we got valid data
        if (quoteData['Global Quote'] && quoteData['Global Quote']['01. symbol'] && 
            overviewData['Symbol'] && overviewData['Name']) {
          const quote = quoteData['Global Quote'];
          const overview = overviewData;

          realDataSection = 
`**REAL MARKET DATA (Alpha Vantage):**
**Company:** ${overview.Name} (${overview.Symbol})
**Exchange:** ${overview.Exchange}
**Sector:** ${overview.Sector}
**Industry:** ${overview.Industry}

**Current Price Data:**
- Current Price: $${quote['05. price']}
- Change: ${quote['09. change']} (${quote['10. change percent']})
- 52-Week High: $${overview['52WeekHigh']}
- 52-Week Low: $${overview['52WeekLow']}

**Key Financial Metrics:**
- Market Cap: $${overview.MarketCapitalization}
- P/E Ratio: ${overview.PERatio}
- PEG Ratio: ${overview.PEGRatio}
- EPS (TTM): $${overview.EPS}
- Revenue (TTM): $${overview.RevenueTTM}
- Profit Margin: ${overview.ProfitMargin}
- Operating Margin: ${overview.OperatingMarginTTM}
- ROE: ${overview.ReturnOnEquityTTM}
- ROA: ${overview.ReturnOnAssetsTTM}
- Dividend Yield: ${overview.DividendYield}
- Book Value: $${overview.BookValue}
- Beta: ${overview.Beta}

**Growth Metrics:**
- Quarterly Earnings Growth YoY: ${overview.QuarterlyEarningsGrowthYOY}
- Quarterly Revenue Growth YoY: ${overview.QuarterlyRevenueGrowthYOY}

**Ownership Structure:**
- Insider Ownership: ${overview.PercentInsiders}
- Institutional Ownership: ${overview.PercentInstitutions}
- Shares Outstanding: ${overview.SharesOutstanding}
- Float: ${overview.SharesFloat}

**Analyst Data:**
- Target Price: $${overview.AnalystTargetPrice}

**Technical Indicators:**
- 50-Day MA: $${overview['50DayMovingAverage']}
- 200-Day MA: $${overview['200DayMovingAverage']}`;
        } else {
          console.log('Alpha Vantage returned invalid data for symbol:', stockSymbol);
          console.log('Quote data keys:', Object.keys(quoteData));
          console.log('Overview data keys:', Object.keys(overviewData));
          
          // Check for API limit errors
          if (quoteData['Note'] || overviewData['Note']) {
            console.log('API limit reached:', quoteData['Note'] || overviewData['Note']);
          }
          
          // Check for invalid symbol errors
          if (quoteData['Error Message'] || overviewData['Error Message']) {
            console.log('Alpha Vantage error:', quoteData['Error Message'] || overviewData['Error Message']);
          }
        }
      } catch (error) {
        console.error('Error fetching Alpha Vantage data:', error);
      }
    }

    if (!realDataSection) {
      realDataSection = 
`**NOTE:** Unable to fetch real-time data from Alpha Vantage for ${stockSymbol}.

**Possible reasons:**
- Stock symbol may be incorrect or not found
- Alpha Vantage API limit may have been reached
- Network connectivity issues

**Please verify:**
- Stock symbol is correct (e.g., AAPL, TSLA, MSFT)
- Symbol is for a publicly traded company
- Try again in a few minutes if API limit was reached

Using analytical framework for ${stockSymbol} analysis.`;
    }

    // Create comprehensive analysis prompt with original structure
    const analysisPrompt =
`You are a senior financial analyst at a leading investment bank writing a professional equity research report. Analyze ${stockSymbol} with real market data and provide actionable investment insights.

${realDataSection}

Based on this REAL MARKET DATA, provide a comprehensive analysis following this structure:
---
SUMMARY RECOMMENDATION
- Assign a rating: Strong Buy / Buy / Hold / Sell / Strong Sell
- Give a 1-sentence thesis (e.g., "despite improving margins, regulatory risk limits upside potential")
---
FINANCIAL PERFORMANCE ANALYSIS
- Interpret each of the following metrics (do not just list them)
- Use comparisons, trend insights, or red flag callouts where applicable
- Keep it concise, professional, and clear
---
OWNERSHIP & INSTITUTIONAL SENTIMENT
- Analyze who holds the stock, how it has changed recently, and what that implies
- Mention promoter confidence, FII/DII movement, and pledged shares if concerning
---
SECTOR, MACRO & NEWS IMPACT
- Summarize recent developments in the company, its industry, and relevant macro factors
- Mention how oil prices, regulatory decisions, or competitor actions could affect the company
- Reference key competitors and compare at least one metric
---
KEY STRENGTHS & RISKS
- List 3–5 of each, with evidence-based rationale. Do not repeat generic ideas.
---
VALUATION OUTLOOK
- Provide a 6-month and 1-year target price
- Mention the valuation method (PE comp, DCF, etc.) if implied
- Recommend an investment horizon: Short / Medium / Long term
---

**Company:** ${stockSymbol}
**Exchange:** ${exchange || 'N/A'}
**Date:** ${new Date().toLocaleDateString()}

Now, write a polished research note as if you were publishing it to clients. Do not use fallback language. Do not insert templates. Use the data and write analytically.`;

    // Call Gemini API with fallback models
    let analysisText;
    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    
    for (const modelName of modelsToTry) {
      try {
        console.log('Trying model:', modelName);
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: analysisPrompt
              }]
            }]
          })
        });

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (analysisText) {
          console.log('Success with model:', modelName);
          break;
        }
      } catch (modelError) {
        console.log('Model', modelName, 'failed:', modelError.message);
        if (modelName === modelsToTry[modelsToTry.length - 1]) {
          throw modelError; // Re-throw the last error if all models fail
        }
      }
    }

    if (!analysisText) {
      throw new Error('No analysis generated');
    }

    console.log('Analysis completed for', stockSymbol);
    
    // Return response in the same format as original backend
    res.status(200).json({
      stockSymbol: stockSymbol.toUpperCase(),
      exchange: exchange || 'N/A',
      timestamp: new Date().toISOString(),
      rawAnalysis: analysisText
    });
    
  } catch (error) {
    console.error('Error analyzing stock:', error);
    res.status(500).json({ 
      message: 'Stock analysis failed', 
      error: error.message
    });
  }
} 