// export const searchEbayProducts = async (query: string) => {
//     // return mock data for now
//     return [
//       {
//         title: "Logitech G502 Hero Mouse",
//         price: "$45.99",
//         rating: "⭐️ 4.8",
//         link: "https://www.ebay.com/itm/mock-link",
//       },
//       {
//         title: "Razer Basilisk V3",
//         price: "$39.00",
//         rating: "⭐️ 4.6",
//         link: "https://www.ebay.com/itm/mock-link-2",
//       },
//     ];
//   };
  
// utils/ebayAPI.ts
// utils/ebayAPI.ts

import { EXPO_PUBLIC_EBAY_CLIENT_ID, EXPO_PUBLIC_EBAY_CLIENT_SECRET, EXPO_PUBLIC_EBAY_CAMPAIGN_ID } from '@env';

const MARKETPLACE_ID = 'EBAY_US';
const BASE_URL = 'https://api.ebay.com';

let accessTokenCache: string | null = null;

// Get eBay OAuth2 token
async function getEbayAccessToken(): Promise<string> {
  if (accessTokenCache) return accessTokenCache;

  const credentials = Buffer.from(`${EXPO_PUBLIC_EBAY_CLIENT_ID}:${EXPO_PUBLIC_EBAY_CLIENT_SECRET}`).toString('base64');

  const response = await fetch(`${BASE_URL}/identity/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
  });

  const data = await response.json();

  if (!data.access_token) {
    console.error('❌ Failed to get eBay token:', data);
    throw new Error('Failed to get eBay token');
  }

  accessTokenCache = data.access_token;
  if (!accessTokenCache) {
    throw new Error("No access token available");
  }
  return accessTokenCache;
  
}

// Search eBay products
export async function searchEbayProducts(productTitles: string[]) {
  console.log("📡 Querying eBay individually for:", productTitles);

  const token = await getEbayAccessToken();
  const results: any[] = [];

  for (const title of productTitles) {
    try {
      const response = await fetch(`${BASE_URL}/buy/browse/v1/item_summary/search?q=${encodeURIComponent(title)}&limit=1`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': MARKETPLACE_ID,
        },
      });

      const data = await response.json();
      console.log(`🔍 Result for "${title}":`, JSON.stringify(data));

      if (data.itemSummaries && data.itemSummaries.length > 0) {
        const item = data.itemSummaries[0];
        results.push({
          title: item.title,
          price: item.price?.value ? `$${item.price.value}` : 'Price unknown',
          rating: '⭐️?', // eBay doesn't return rating info here
          link: `${item.itemWebUrl}?campid=${EXPO_PUBLIC_EBAY_CAMPAIGN_ID}`,
        });
      }
    } catch (err) {
      console.error(`❌ Failed to fetch for "${title}":`, err);
    }
  }

  if (results.length === 0) {
    throw new Error("No products found");
  }

  return results;
}
