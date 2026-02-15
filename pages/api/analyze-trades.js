// Serverless function for comprehensive trade analysis (POST /analyze-trades)
import { MongoClient } from 'mongodb';

// Simple authentication middleware for Next.js API routes
async function authenticate(req, res) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return { error: 'Unauthorized: No token provided', status: 401 };
  }
  
  const token = authHeader.split(' ')[1];

  if (!token) {
    return { error: 'Unauthorized: Invalid token format', status: 401 };
  }

  try {
    // Parse Firebase JWT token to extract user_id
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    
    // Firebase tokens use 'user_id' field
    const uid = payload.user_id || payload.sub || payload.uid;
    
    if (!uid) {
      return { error: 'Unauthorized: Invalid token - no user_id', status: 401 };
    }
    
    return { uid };
  } catch (error) {
    console.error('Error parsing token:', error);
    return { error: 'Unauthorized: Invalid token format', status: 401 };
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
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const mongoUri = process.env.MONGO_URL;

    if (!geminiApiKey) {
      return res.status(500).json({ message: 'Gemini API key not configured' });
    }

    if (!mongoUri) {
      return res.status(500).json({ message: 'Database connection not configured' });
    }

    // Get user's trades from database
    const client = new MongoClient(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxIdleTimeMS: 30000,
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
    });

    await client.connect();
    const db = client.db();
    const userTrades = await db.collection('trades').find({ userId }).sort({ date: -1 }).toArray();
    await client.close();

    if (userTrades.length === 0) {
      return res.status(200).json({
        analysis: {
          summary: 'No trades found in your portfolio. Start by adding some trades to get personalized analysis.',
          recommendations: [
            'Add your first trade using the Add Trade button',
            'Include both profitable and losing trades for better analysis',
            'Add detailed reasons for each trade to improve insights'
          ],
          metrics: {
            totalTrades: 0,
            totalPnL: 0,
            winRate: 0,
            avgWin: 0,
            avgLoss: 0,
            profitFactor: 0
          },
          verdict: {
            rating: 'No Data',
            confidence: 'N/A',
            analysis: 'No trades available for analysis'
          }
        }
      });
    }

    // Calculate comprehensive metrics
    const totalTrades = userTrades.length;
    const totalPnL = userTrades.reduce((sum, trade) => sum + (trade.pl || 0), 0);
    const profitableTrades = userTrades.filter(t => t.pl > 0);
    const losingTrades = userTrades.filter(t => t.pl < 0);
    const winRate = totalTrades > 0 ? (profitableTrades.length / totalTrades * 100).toFixed(1) : 0;
    const avgWin = profitableTrades.length > 0 ? profitableTrades.reduce((sum, t) => sum + t.pl, 0) / profitableTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? losingTrades.reduce((sum, t) => sum + t.pl, 0) / losingTrades.length : 0;
    const profitFactor = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0;

    // Group trades by stock
    const stockGroups = {};
    userTrades.forEach(trade => {
      if (!stockGroups[trade.name]) {
        stockGroups[trade.name] = [];
      }
      stockGroups[trade.name].push(trade);
    });

    // Calculate monthly performance
    const monthlyPerformance = {};
    userTrades.forEach(trade => {
      const month = new Date(trade.date).toISOString().slice(0, 7);
      if (!monthlyPerformance[month]) {
        monthlyPerformance[month] = 0;
      }
      monthlyPerformance[month] += trade.pl || 0;
    });

    // Create comprehensive prompt for AI analysis
    const analysisPrompt = `You are a senior trading analyst. Analyze this trading portfolio and provide comprehensive insights.

**PORTFOLIO METRICS:**
- Total Trades: ${totalTrades}
- Total P&L: $${totalPnL.toFixed(2)}
- Win Rate: ${winRate}%
- Average Win: $${avgWin.toFixed(2)}
- Average Loss: $${avgLoss.toFixed(2)}
- Profit Factor: ${profitFactor.toFixed(2)}

**RECENT TRADES:**
${userTrades.slice(0, 15).map(trade => `- ${trade.name}: $${trade.pl} (${trade.reason || 'No reason provided'})`).join('\n')}

**STOCK CONCENTRATION:**
${Object.entries(stockGroups).map(([stock, trades]) => {
  const totalPl = trades.reduce((sum, t) => sum + t.pl, 0);
  return `- ${stock}: ${trades.length} trades, $${totalPl.toFixed(2)} total P&L`;
}).join('\n')}

**MONTHLY PERFORMANCE:**
${Object.entries(monthlyPerformance).map(([month, pnl]) => `- ${month}: $${pnl.toFixed(2)}`).join('\n')}

Provide analysis in this format:

**EXECUTIVE SUMMARY**
Overall performance assessment and key insights.

**TRADING PATTERNS**
Frequency, timing, and behavioral patterns identified.

**PERFORMANCE ANALYSIS**
Win rate, profit factor, and risk management assessment.

**DIVERSIFICATION**
Stock concentration and sector analysis.

**RECOMMENDATIONS**
3-5 specific actionable improvements.

**VERDICT**
Overall rating: Excellent/Good/Needs Improvement/Poor
Confidence: High/Medium/Low
Key reason for this verdict.`;

    // Call Gemini API for analysis - using the correct endpoint
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
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

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const analysis = geminiData.candidates[0].content.parts[0].text;

    // Extract verdict from analysis
    const verdictMatch = analysis.match(/\*\*VERDICT\*\*[\s\S]*?rating:\s*(Excellent|Good|Needs Improvement|Poor)[\s\S]*?Confidence:\s*(High|Medium|Low)/i);
    const verdict = verdictMatch ? {
      rating: verdictMatch[1],
      confidence: verdictMatch[2],
      analysis: analysis
    } : {
      rating: 'Needs Improvement',
      confidence: 'Medium',
      analysis: analysis
    };

    res.status(200).json({
      analysis: {
        summary: analysis,
        verdict: verdict,
        metrics: {
          totalTrades,
          totalPnL,
          winRate,
          avgWin,
          avgLoss,
          profitFactor
        }
      }
    });

  } catch (error) {
    console.error('Error analyzing trades:', error);
    res.status(500).json({ 
      message: 'Internal Server Error', 
      error: error.message,
      details: 'Trade analysis failed'
    });
  }
} 