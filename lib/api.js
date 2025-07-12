// API Configuration for Next.js serverless API routes
// This uses Next.js API routes instead of a separate backend

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  // For Next.js, API routes are relative to the current domain
  const fullUrl = `/api${endpoint}`;
  return fullUrl;
};

// Common API headers
export const getApiHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}; 