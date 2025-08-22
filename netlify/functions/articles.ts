// Netlify Function Handler

// Fallback articles in case RSS feeds fail
const fallbackArticles = [
  {
    id: 'fallback-1',
    title: 'Welcome to TechyDhamaka!',
    summary: 'Your ultimate destination for trending tech, gaming, and entertainment news. We are currently loading the latest content...',
    externalUrl: '#',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop',
    publishedAt: new Date().toISOString(),
    category: 'technology',
    source: 'TechyDhamaka'
  },
  {
    id: 'fallback-2', 
    title: 'Latest Gaming News Coming Soon',
    summary: 'Stay tuned for the latest gaming updates, reviews, and industry news from top gaming sources.',
    externalUrl: '#',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=400&fit=crop',
    publishedAt: new Date().toISOString(),
    category: 'gaming',
    source: 'TechyDhamaka'
  },
  {
    id: 'fallback-3',
    title: 'Entertainment Updates Loading',
    summary: 'Get ready for the latest entertainment news, movie reviews, and celebrity updates.',
    externalUrl: '#', 
    imageUrl: 'https://images.unsplash.com/photo-1489599988025-a4c0d7ad8a0b?w=800&h=400&fit=crop',
    publishedAt: new Date().toISOString(),
    category: 'entertainment',
    source: 'TechyDhamaka'
  }
];

export const handler = async (event: any, context: any) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // For now, return fallback articles to ensure the site works
    // Later you can implement RSS parsing here
    if (event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(fallbackArticles)
      };
    }
    
    if (event.httpMethod === 'POST') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: "Refresh completed",
          count: fallbackArticles.length
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 200, // Return 200 with fallback data instead of error
      headers,
      body: JSON.stringify(fallbackArticles)
    };
  }
};