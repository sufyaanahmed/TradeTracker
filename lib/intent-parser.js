// Natural Language Trade Intent Parser
// Extracts structured trade intent from free-form text
// Uses deterministic regex parsing with Gemini fallback

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Common stock symbol patterns
const SYMBOL_PATTERNS = /\b([A-Z]{1,5})\b/g;
const QUANTITY_PATTERNS = /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:shares?|lots?|qty|units?|nos?|quantities?)?/i;
const PRICE_PATTERNS = /(?:at|@|price)\s*\$?\s*(\d+(?:\.\d+)?)/i;
const LIMIT_PATTERNS = /(?:limit|target|tp|sl|stop.?loss)\s*(?:at|@|of)?\s*\$?\s*(\d+(?:\.\d+)?)/i;

const BUY_WORDS = ['buy', 'purchase', 'acquire', 'long', 'enter', 'get', 'add', 'accumulate', 'pick', 'invest'];
const SELL_WORDS = ['sell', 'exit', 'short', 'dump', 'offload', 'liquidate', 'close', 'unload', 'book profit', 'square off'];

const NOISE_WORDS = new Set([
  'I', 'A', 'AT', 'IN', 'TO', 'OF', 'THE', 'MY', 'IS', 'IT', 'ON', 'FOR',
  'AND', 'OR', 'NOT', 'BUT', 'ALL', 'DO', 'IF', 'SO', 'UP', 'AM', 'AN',
  'BE', 'BY', 'GO', 'HE', 'ME', 'NO', 'OK', 'US', 'WE', 'AS', 'CAN',
  'BUY', 'SELL', 'NOW', 'QTY', 'MKT', 'LTP', 'SET', 'PUT', 'GET',
  'WANT', 'LIKE', 'SOME', 'WITH', 'FROM', 'WILL', 'THAT', 'THIS', 'HAVE',
  'JUST', 'BEEN', 'THEM', 'EACH', 'MORE', 'ALSO', 'THAN', 'VERY', 'MUCH',
  'TODAY', 'PRICE', 'MARKET', 'LIMIT', 'SHARES', 'STOCK', 'TRADE'
]);

/**
 * Parse trade intent from natural language text (deterministic)
 */
export function parseTradeIntentLocal(text) {
  if (!text || typeof text !== 'string') {
    return { success: false, error: 'Empty or invalid input' };
  }

  const normalized = text.trim();
  const lower = normalized.toLowerCase();

  // 1. Detect action
  let action = null;
  for (const word of BUY_WORDS) {
    if (lower.includes(word)) { action = 'BUY'; break; }
  }
  if (!action) {
    for (const word of SELL_WORDS) {
      if (lower.includes(word)) { action = 'SELL'; break; }
    }
  }
  if (!action) action = 'BUY'; // Default to BUY

  // 2. Extract quantity
  let quantity = null;
  const qtyMatch = lower.match(QUANTITY_PATTERNS);
  if (qtyMatch) {
    quantity = parseFloat(qtyMatch[1].replace(/,/g, ''));
  }

  // 3. Extract symbol (find uppercase words that look like tickers)
  let symbol = null;
  const upperWords = normalized.match(SYMBOL_PATTERNS) || [];
  const candidates = upperWords.filter(w => !NOISE_WORDS.has(w) && w.length >= 1);
  if (candidates.length > 0) {
    symbol = candidates[0]; // Take first valid ticker candidate
  }

  // If no uppercase match, try finding capitalized words in original
  if (!symbol) {
    const words = normalized.split(/\s+/);
    for (const word of words) {
      const clean = word.replace(/[^A-Za-z]/g, '');
      if (clean.length >= 2 && clean.length <= 5 && !NOISE_WORDS.has(clean.toUpperCase())) {
        // Check if it looks like a ticker (not a common English word)
        if (/^[A-Z]/.test(clean) || clean === clean.toUpperCase()) {
          symbol = clean.toUpperCase();
          break;
        }
      }
    }
  }

  // 4. Extract price type and target price
  let priceType = 'MARKET';
  let targetPrice = null;

  const limitMatch = normalized.match(LIMIT_PATTERNS);
  if (limitMatch) {
    priceType = 'LIMIT';
    targetPrice = parseFloat(limitMatch[1]);
  } else {
    const priceMatch = normalized.match(PRICE_PATTERNS);
    if (priceMatch) {
      targetPrice = parseFloat(priceMatch[1]);
      priceType = 'LIMIT';
    }
  }

  // Check for market price keywords
  if (lower.includes('market price') || lower.includes('market order') ||
      lower.includes("today's price") || lower.includes('current price') ||
      lower.includes('cmp') || lower.includes('ltp')) {
    priceType = 'MARKET';
    targetPrice = null;
  }

  // Validate
  if (!symbol) {
    return { success: false, error: 'Could not identify stock symbol. Use uppercase (e.g., AAPL, TSLA).' };
  }

  return {
    success: true,
    intent: {
      action,
      symbol: symbol.toUpperCase(),
      quantity: quantity || 1,
      priceType,
      targetPrice,
      rawInput: normalized
    }
  };
}

/**
 * Parse trade intent using Gemini AI (fallback for complex inputs)
 */
export async function parseTradeIntentAI(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return parseTradeIntentLocal(text); // Fall back to local parsing
  }

  try {
    const prompt = `Parse this trade intent into structured data. Return ONLY valid JSON, no markdown.

Input: "${text}"

Return exactly this JSON structure:
{
  "action": "BUY" or "SELL",
  "symbol": "STOCK_TICKER_SYMBOL",
  "quantity": number,
  "priceType": "MARKET" or "LIMIT",
  "targetPrice": number or null
}

Rules:
- symbol must be a valid stock ticker (1-5 uppercase letters)
- quantity defaults to 1 if not specified
- priceType is MARKET unless a specific price is mentioned
- targetPrice is null for MARKET orders`;

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 200 }
      })
    });

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in AI response');

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate AI output
    if (!parsed.symbol || typeof parsed.symbol !== 'string') {
      throw new Error('Invalid symbol from AI');
    }

    return {
      success: true,
      intent: {
        action: parsed.action === 'SELL' ? 'SELL' : 'BUY',
        symbol: parsed.symbol.toUpperCase().replace(/[^A-Z]/g, ''),
        quantity: Math.max(1, parseInt(parsed.quantity) || 1),
        priceType: parsed.priceType === 'LIMIT' ? 'LIMIT' : 'MARKET',
        targetPrice: parsed.targetPrice ? parseFloat(parsed.targetPrice) : null,
        rawInput: text,
        aiParsed: true
      }
    };
  } catch (error) {
    console.error('[intent-parser] AI parsing failed, using deterministic:', error.message);
    return parseTradeIntentLocal(text);
  }
}

/**
 * Main entry point: tries deterministic first, falls back to AI
 */
export async function parseTradeIntent(text) {
  const local = parseTradeIntentLocal(text);
  if (local.success && local.intent.symbol) {
    return local;
  }
  // If deterministic parsing couldn't find a symbol, try AI
  return parseTradeIntentAI(text);
}
