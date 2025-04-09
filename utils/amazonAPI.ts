const AFFILIATE_TAG = "buyingassista-20";

// Helper to add tag to any Amazon link
const addAffiliateTag = (url: string, tag: string) => {
  if (!url.includes("amazon.com")) return url;

  const hasTag = url.includes("tag=");
  if (hasTag) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}tag=${tag}`;
};

export const fetchAmazonProducts = async (parsed: {
  keywords: string;
  priceMax: number;
  category: string;
}) => {
  const keywordList = parsed.keywords.split(",").map(k => k.trim());

  return keywordList.map((keyword) => ({
    title: keyword,
    link: addAffiliateTag(`https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`, AFFILIATE_TAG),
    price: "Price unknown",
    rating: "⭐️?",
  }));
};