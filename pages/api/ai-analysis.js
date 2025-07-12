// Serverless function for AI analysis using Gemini API with original comprehensive prompt

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
    // For Next.js, we'll extract the uid from the token payload
    console.log('Extracting UID from token');
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const uid = payload.user_id || payload.sub || payload.uid || 'test-user';
    console.log('Extracted UID:', uid);
    return { uid };
  } catch (error) {
    console.error('Error verifying token:', error);
    return { error: 'Unauthorized: Invalid token', status: 401 };
  }
}

export default async function handler(req, res) {
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

  try {
    const { symbol, question, trades, stockSymbol, exchange } = req.body;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;

    if (!geminiApiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    let analysisPrompt;
    let stockData = null;

    // If analyzing a specific stock
    if (stockSymbol || symbol) {
      const targetSymbol = stockSymbol || symbol;
      
      // Fetch real stock data from Alpha Vantage
      let realDataSection = '';
      
      if (alphaVantageKey) {
        try {
          // Get comprehensive stock data
          const [quoteResponse, overviewResponse] = await Promise.all([
            fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${targetSymbol}&apikey=${alphaVantageKey}`),
            fetch(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${targetSymbol}&apikey=${alphaVantageKey}`)
          ]);

          const quoteData = await quoteResponse.json();
          const overviewData = await overviewResponse.json();

          if (quoteData['Global Quote'] && overviewData['Symbol']) {
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

            stockData = {
              symbol: overview.Symbol,
              name: overview.Name,
              price: quote['05. price'],
              change: quote['09. change'],
              changePercent: quote['10. change percent']
            };
          }
        } catch (error) {
          console.error('Error fetching Alpha Vantage data:', error);
        }
      }

      if (!realDataSection) {
        realDataSection = 
`**NOTE:** Unable to fetch real-time data from Alpha Vantage. Using analytical framework for ${targetSymbol}.
Please ensure the stock symbol is correct and try again.`;
      }

      // Create comprehensive analysis prompt with original structure
      analysisPrompt =
`You are a senior financial analyst at a leading investment bank writing a professional equity research report. Analyze ${targetSymbol} with real market data and provide actionable investment insights.

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

**Company:** ${targetSymbol}
**Exchange:** ${exchange || 'N/A'}
**Date:** ${new Date().toLocaleDateString()}

Now, write a polished research note as if you were publishing it to clients. Do not use fallback language. Do not insert templates. Use the data and write analytically.`;

    } else if (trades && trades.length > 0) {
      // Portfolio analysis
      analysisPrompt = `As a professional trading analyst, analyze the following trading portfolio:

**User's Trading History:**
${trades.map(trade => 
  `- ${trade.name}: P&L: ${trade.pl >= 0 ? '+' : ''}$${trade.pl} on ${new Date(trade.date).toLocaleDateString()} - Reason: ${trade.reason}`
).join('\n')}

Provide insights on:
1. **Trading Performance**: Overall P&L analysis and patterns
2. **Risk Assessment**: Position sizing and risk management
3. **Strategy Analysis**: Trading patterns and decision quality
4. **Recommendations**: Actionable improvements for future trades

Keep it professional and actionable.`;
    } else {
      return res.status(400).json({ error: 'Please provide either a stock symbol or trading data for analysis' });
    }

    // Call Gemini API (using fetch since we're in serverless environment)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
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
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!analysisText) {
      throw new Error('No analysis generated');
    }

    res.status(200).json({ 
      analysis: analysisText,
      symbol: stockSymbol || symbol || 'Portfolio',
      timestamp: new Date().toISOString(),
      confidence: 0.85,
      stockData
    });

  } catch (error) {
    console.error('AI Analysis error:', error);
    res.status(500).json({ error: 'Failed to generate AI analysis' });
  }
} 