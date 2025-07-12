// Serverless function for fetching stock data using Alpha Vantage API

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
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
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
    const { symbol } = req.query;
    const alphaVantageKey = "PFBS35Y0O9X1ZO2Y"; // Use hardcoded key for now

    if (!symbol) {
      return res.status(400).json({ error: 'Stock symbol is required' });
    }

    if (!alphaVantageKey) {
      return res.status(500).json({ error: 'Alpha Vantage API key not configured' });
    }

    // Fetch current stock price from Alpha Vantage
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${alphaVantageKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch stock data');
    }

    const data = await response.json();
    
    console.log('Alpha Vantage response:', data);
    
    // Check if API returned an error
    if (data['Error Message']) {
      console.log('Alpha Vantage error:', data['Error Message']);
      return res.status(400).json({ error: `Invalid stock symbol: ${data['Error Message']}` });
    }

    if (data['Note']) {
      console.log('Alpha Vantage API limit:', data['Note']);
      return res.status(429).json({ error: `API call frequency limit reached: ${data['Note']}` });
    }

    const quote = data['Global Quote'];
    
    if (!quote || !quote['01. symbol']) {
      console.log('No valid quote data found for symbol:', symbol);
      return res.status(404).json({ error: `Stock data not found for symbol: ${symbol}. Please verify the symbol is correct.` });
    }

    // Format the response
    const stockData = {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: quote['10. change percent'],
      volume: parseInt(quote['06. volume']),
      previousClose: parseFloat(quote['08. previous close']),
      open: parseFloat(quote['02. open']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      timestamp: quote['07. latest trading day']
    };

    res.status(200).json(stockData);

  } catch (error) {
    console.error('Stock data error:', error);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
} 