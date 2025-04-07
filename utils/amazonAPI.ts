export const fetchAmazonProducts = async (params: {
    keywords: string;
    priceMax?: number;
    category?: string;
  }) => {
    return [
      {
        title: "Logitech G502 Gaming Mouse",
        price: "$49.99",
        rating: 4.7,
        link: "https://amazon.com/product-link",
        image: "https://via.placeholder.com/150",
      },
    ];
  };
  