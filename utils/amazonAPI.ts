import { generateAffiliateLink } from "./affiliateLink";

const AFFILIATE_TAG = "buyingassista-20";

export const fetchAmazonProducts = async (parsed: any[]) => {
  return parsed.map((item) => ({
    ...item,
    rating: "⭐️?", // placeholder
    price: "Price unknown",
    link: generateAffiliateLink(item.asin, AFFILIATE_TAG),
  }));
};
