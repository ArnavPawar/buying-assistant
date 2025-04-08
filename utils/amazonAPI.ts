const AFFILIATE_TAG = "buyingassista-20";

// Helper to add tag to any Amazon link
const addAffiliateTag = (url: string, tag: string) => {
  if (!url.includes("amazon.com")) return url;

  const hasTag = url.includes("tag=");
  if (hasTag) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}tag=${tag}`;
};

export const fetchAmazonProducts = async (parsedResults: any[]) => {
  return parsedResults.map((item) => ({
    title: item.title,
    link: addAffiliateTag(item.link, AFFILIATE_TAG),
    price: "Price unknown",
    rating: "⭐️?",
  }));
};
