// db.js - Mock Database for FreshCart Market

const DEFAULT_PRODUCTS = [
  // --- PRODUCE ---
  {
    id: "prod-1",
    name: "Organic Honeycrisp Apples",
    category: "produce",
    price: 3.49,
    originalPrice: 4.29,
    unit: "lb",
    pricePerUnit: "$3.49 / lb",
    avgWeight: "approx 0.33 lb each",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80",
    description: "Crisp, sweet, and exceptionally juicy. These organic Honeycrisp apples are hand-picked at peak ripeness. Perfect for snacking, baking, or slicing into salads.",
    nutrition: { calories: 95, fat: "0.3g", carbs: "25g", protein: "0.5g", fiber: "4.4g" },
    expiration: "Best within 10 days of delivery. Keep refrigerated.",
    inventory: 45,
    dietary: ["organic", "vegan", "gluten-free"],
    rating: 4.8,
    reviewsCount: 24,
    reviews: [
      { name: "Sarah M.", rating: 5, comment: "Super crisp and sweet! Kids loved them.", date: "2026-06-01" },
      { name: "John D.", rating: 4, comment: "Very good quality, though one apple had a small bruise.", date: "2026-05-28" }
    ],
    weeklyDeal: true,
    bestSeller: true
  },
  {
    id: "prod-2",
    name: "Organic Bananas",
    category: "produce",
    price: 1.89,
    unit: "bunch",
    pricePerUnit: "$1.89 / bunch",
    avgWeight: "approx 5-6 bananas per bunch",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80",
    description: "Sweet, creamy, and rich in potassium. These organic bananas are delivered slightly green so they ripen perfectly in your kitchen.",
    nutrition: { calories: 105, fat: "0.3g", carbs: "27g", protein: "1.3g", fiber: "3.1g" },
    expiration: "Best within 5 days. Store at room temperature.",
    inventory: 80,
    dietary: ["organic", "vegan", "gluten-free"],
    rating: 4.9,
    reviewsCount: 42,
    reviews: [
      { name: "Emily R.", rating: 5, comment: "Perfect ripeness, no bruises at all!", date: "2026-06-03" }
    ],
    weeklyDeal: false,
    bestSeller: true
  },
  {
    id: "prod-3",
    name: "Organic Baby Spinach",
    category: "produce",
    price: 3.99,
    unit: "clamshell",
    pricePerUnit: "$3.99 / 5oz pack",
    avgWeight: "5 oz (142g)",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80",
    description: "Pre-washed and ready to eat. Tender organic baby spinach leaves, perfect for salads, smoothies, or sautéing.",
    nutrition: { calories: 7, fat: "0.1g", carbs: "1.1g", protein: "0.9g", fiber: "0.7g" },
    expiration: "Best within 7 days. Keep refrigerated in packaging.",
    inventory: 18,
    dietary: ["organic", "vegan", "gluten-free"],
    rating: 4.6,
    reviewsCount: 15,
    reviews: [
      { name: "David K.", rating: 4, comment: "Fresh and clean. Lasted a full week in the fridge.", date: "2026-05-25" }
    ],
    weeklyDeal: false,
    bestSeller: false
  },
  {
    id: "prod-4",
    name: "Fresh Avocados",
    category: "produce",
    price: 1.25,
    originalPrice: 1.75,
    unit: "each",
    pricePerUnit: "$1.25 each",
    avgWeight: "approx 0.35 lb each",
    image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=400&q=80",
    description: "Creamy Hass avocados. Rich in heart-healthy monounsaturated fats. Ready to eat in 1-2 days.",
    nutrition: { calories: 240, fat: "22g", carbs: "12g", protein: "3g", fiber: "10g" },
    expiration: "Store at room temp until ripe, then refrigerate for up to 3 days.",
    inventory: 3, // Low stock
    dietary: ["vegan", "gluten-free"],
    rating: 4.7,
    reviewsCount: 38,
    reviews: [
      { name: "Sophia L.", rating: 5, comment: "Made the best guacamole. Perfect texture.", date: "2026-06-04" }
    ],
    weeklyDeal: true,
    bestSeller: true
  },
  {
    id: "prod-5",
    name: "Fresh Broccoli Crowns",
    category: "produce",
    price: 1.99,
    unit: "lb",
    pricePerUnit: "$1.99 / lb",
    avgWeight: "approx 0.5 lb per crown",
    image: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a05?auto=format&fit=crop&w=400&q=80",
    description: "Crisp green broccoli crowns. High in vitamin C and dietary fiber. Ideal for steaming, roasting, or stir-fries.",
    nutrition: { calories: 31, fat: "0.3g", carbs: "6g", protein: "2.5g", fiber: "2.4g" },
    expiration: "Best within 7 days. Keep refrigerated in a breathable bag.",
    inventory: 25,
    dietary: ["vegan", "gluten-free"],
    rating: 4.4,
    reviewsCount: 11,
    reviews: [],
    weeklyDeal: false,
    bestSeller: false
  },

  // --- BAKERY ---
  {
    id: "prod-6",
    name: "Artisanal Sourdough Bread",
    category: "bakery",
    price: 5.49,
    unit: "loaf",
    pricePerUnit: "$5.49 each",
    avgWeight: "1.2 lbs (540g)",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80",
    description: "Baked fresh daily by our local bakery partner. Features a thick, blistered crust with a soft, airy, and tangily flavorful interior.",
    nutrition: { calories: 185, fat: "1g", carbs: "36g", protein: "6g", fiber: "2g" },
    expiration: "Best within 3-4 days. Store in paper bag. Freeze for long storage.",
    inventory: 12,
    dietary: ["vegan"],
    rating: 4.9,
    reviewsCount: 33,
    reviews: [
      { name: "Marcus G.", rating: 5, comment: "Absolutely incredible sourdough. Best in town.", date: "2026-06-05" }
    ],
    weeklyDeal: false,
    bestSeller: true
  },
  {
    id: "prod-7",
    name: "All-Butter Croissants",
    category: "bakery",
    price: 4.25,
    originalPrice: 4.99,
    unit: "pack",
    pricePerUnit: "$4.25 / 4-pack",
    avgWeight: "approx 8 oz total",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=400&q=80",
    description: "Flaky, golden, and layered with pure French-style butter. Warm in the oven for 2 minutes for a perfect bakery experience.",
    nutrition: { calories: 231, fat: "12g", carbs: "26g", protein: "5g", fiber: "1g" },
    expiration: "Best within 2 days. Store in airtight container.",
    inventory: 8,
    dietary: [],
    rating: 4.7,
    reviewsCount: 19,
    reviews: [],
    weeklyDeal: true,
    bestSeller: false
  },
  {
    id: "prod-8",
    name: "Whole Wheat Bread Loaf",
    category: "bakery",
    price: 3.29,
    unit: "loaf",
    pricePerUnit: "$3.29 each",
    avgWeight: "1.0 lb (450g)",
    image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=400&q=80",
    description: "Classic soft sliced sandwich bread made with 100% stoneground whole wheat flour. Packed with grains and fiber.",
    nutrition: { calories: 130, fat: "1.5g", carbs: "24g", protein: "5g", fiber: "3g" },
    expiration: "Best within 7 days. Store in a cool dry place.",
    inventory: 30,
    dietary: ["vegan"],
    rating: 4.5,
    reviewsCount: 14,
    reviews: [],
    weeklyDeal: false,
    bestSeller: false
  },

  // --- DAIRY ---
  {
    id: "prod-9",
    name: "Organic Whole Milk",
    category: "dairy",
    price: 4.89,
    unit: "carton",
    pricePerUnit: "$4.89 / half-gallon",
    avgWeight: "64 fl oz (1.89L)",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80",
    description: "Creamy, ultra-pasteurized organic whole milk from pasture-raised cows. Excellent source of calcium and Vitamin D.",
    nutrition: { calories: 150, fat: "8g", carbs: "12g", protein: "8g", fiber: "0g" },
    expiration: "Best within 14 days of delivery. Keep refrigerated below 40°F.",
    inventory: 24,
    dietary: ["organic", "gluten-free"],
    rating: 4.8,
    reviewsCount: 27,
    reviews: [
      { name: "Lisa T.", rating: 5, comment: "Creamiest organic milk I've ever bought.", date: "2026-05-30" }
    ],
    weeklyDeal: false,
    bestSeller: true
  },
  {
    id: "prod-10",
    name: "Sharp Cheddar Cheese Block",
    category: "dairy",
    price: 3.99,
    unit: "block",
    pricePerUnit: "$3.99 / 8oz",
    avgWeight: "8 oz (226g)",
    image: "https://images.unsplash.com/photo-1618164435735-413d3b066c9a?auto=format&fit=crop&w=400&q=80",
    description: "Aged for 9 months for a bold, sharp taste. Perfect for slicing, grating onto dishes, or serving on a charcuterie board.",
    nutrition: { calories: 110, fat: "9g", carbs: "1g", protein: "7g", fiber: "0g" },
    expiration: "Best within 30 days. Keep wrapped and refrigerated.",
    inventory: 15,
    dietary: ["gluten-free"],
    rating: 4.6,
    reviewsCount: 18,
    reviews: [],
    weeklyDeal: false,
    bestSeller: false
  },
  {
    id: "prod-11",
    name: "Greek Yogurt - Honey & Vanilla",
    category: "dairy",
    price: 1.49,
    unit: "cup",
    pricePerUnit: "$1.49 each",
    avgWeight: "5.3 oz (150g)",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80",
    description: "Thick and strained Greek yogurt blended with wild honey and natural vanilla bean. High in protein, low in fat.",
    nutrition: { calories: 130, fat: "2.5g", carbs: "15g", protein: "12g", fiber: "0g" },
    expiration: "Best within 10 days. Keep refrigerated.",
    inventory: 0, // Out of stock
    dietary: ["gluten-free"],
    rating: 4.7,
    reviewsCount: 31,
    reviews: [
      { name: "Aaron P.", rating: 5, comment: "Love the honey flavor, not too sweet.", date: "2026-06-02" }
    ],
    weeklyDeal: false,
    bestSeller: false
  },
  {
    id: "prod-12",
    name: "Pasture-Raised Large Eggs",
    category: "dairy",
    price: 5.99,
    originalPrice: 6.99,
    unit: "dozen",
    pricePerUnit: "$5.99 / dozen",
    avgWeight: "12 eggs per carton",
    image: "https://images.unsplash.com/photo-1516448424440-9dbca97779c1?auto=format&fit=crop&w=400&q=80",
    description: "Laid by hens raised on green pastures with plenty of room to roam. Deep orange yolks and rich flavor.",
    nutrition: { calories: 70, fat: "5g", carbs: "0g", protein: "6g", fiber: "0g" },
    expiration: "Best within 21 days. Keep refrigerated.",
    inventory: 19,
    dietary: ["gluten-free"],
    rating: 4.9,
    reviewsCount: 52,
    reviews: [
      { name: "Robert H.", rating: 5, comment: "You can taste the difference! Yellow yolks are beautiful.", date: "2026-06-03" }
    ],
    weeklyDeal: true,
    bestSeller: true
  },

  // --- MEAT & SEAFOOD ---
  {
    id: "prod-13",
    name: "Boneless Chicken Breasts",
    category: "meat",
    price: 4.99,
    unit: "lb",
    pricePerUnit: "$4.99 / lb",
    avgWeight: "approx 1.25 lbs per pack",
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=400&q=80",
    description: "Boneless, skinless chicken breasts from humanely raised, cage-free chickens. No added hormones or antibiotics.",
    nutrition: { calories: 120, fat: "1.5g", carbs: "0g", protein: "26g", fiber: "0g" },
    expiration: "Best within 3 days, or freeze immediately.",
    inventory: 16,
    dietary: ["gluten-free"],
    rating: 4.5,
    reviewsCount: 22,
    reviews: [],
    weeklyDeal: false,
    bestSeller: true
  },
  {
    id: "prod-14",
    name: "Grass-Fed Ribeye Steak",
    category: "meat",
    price: 16.99,
    unit: "each",
    pricePerUnit: "$16.99 each",
    avgWeight: "approx 0.75 lb (12 oz)",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80",
    description: "Premium grass-fed, grain-finished beef ribeye. Beautiful marbling yields a tender, juicy, and flavor-packed steak.",
    nutrition: { calories: 630, fat: "52g", carbs: "0g", protein: "42g", fiber: "0g" },
    expiration: "Best within 3 days, or freeze immediately.",
    inventory: 5,
    dietary: ["gluten-free"],
    rating: 4.8,
    reviewsCount: 16,
    reviews: [
      { name: "Tina C.", rating: 5, comment: "Grilled to perfection, extremely juicy.", date: "2026-05-29" }
    ],
    weeklyDeal: false,
    bestSeller: false
  },
  {
    id: "prod-15",
    name: "Fresh Atlantic Salmon Fillet",
    category: "meat",
    price: 11.99,
    originalPrice: 13.99,
    unit: "lb",
    pricePerUnit: "$11.99 / lb",
    avgWeight: "approx 0.5 lb portion",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80",
    description: "Responsibly ocean-farmed Atlantic salmon. Rich in omega-3 fatty acids. Skin-on, boneless, ready to bake or pan-sear.",
    nutrition: { calories: 280, fat: "15g", carbs: "0g", protein: "34g", fiber: "0g" },
    expiration: "Cook or freeze within 24 hours of delivery.",
    inventory: 10,
    dietary: ["gluten-free"],
    rating: 4.9,
    reviewsCount: 29,
    reviews: [
      { name: "Greg F.", rating: 5, comment: "Fabulous quality. Tastes so clean.", date: "2026-06-04" }
    ],
    weeklyDeal: true,
    bestSeller: true
  },

  // --- PANTRY ---
  {
    id: "prod-16",
    name: "Organic Tri-Color Quinoa",
    category: "pantry",
    price: 4.49,
    unit: "bag",
    pricePerUnit: "$4.49 / 16oz bag",
    avgWeight: "16 oz (454g)",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80",
    description: "A complete plant-based protein containing all nine essential amino acids. Pre-washed to remove bitter saponin. Great base for bowls.",
    nutrition: { calories: 160, fat: "2.5g", carbs: "30g", protein: "6g", fiber: "3g" },
    expiration: "Best within 1 year. Store in a cool, dry pantry.",
    inventory: 35,
    dietary: ["organic", "vegan", "gluten-free"],
    rating: 4.6,
    reviewsCount: 13,
    reviews: [],
    weeklyDeal: false,
    bestSeller: false
  },
  {
    id: "prod-17",
    name: "Extra Virgin Olive Oil",
    category: "pantry",
    price: 9.99,
    unit: "bottle",
    pricePerUnit: "$9.99 / 16.9oz",
    avgWeight: "16.9 fl oz (500ml)",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80",
    description: "Cold-pressed from olives grown in Mediterranean soils. Fruity and peppery flavor profile, perfect for dressings and light cooking.",
    nutrition: { calories: 120, fat: "14g", carbs: "0g", protein: "0g", fiber: "0g" },
    expiration: "Best within 6 months of opening. Store away from heat.",
    inventory: 20,
    dietary: ["vegan", "gluten-free"],
    rating: 4.7,
    reviewsCount: 21,
    reviews: [],
    weeklyDeal: false,
    bestSeller: true
  },
  {
    id: "prod-18",
    name: "Sea Salt Kettle Potato Chips",
    category: "pantry",
    price: 2.79,
    originalPrice: 3.49,
    unit: "bag",
    pricePerUnit: "$2.79 each",
    avgWeight: "8 oz (226g)",
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d22?auto=format&fit=crop&w=400&q=80",
    description: "Thick-sliced potatoes kettle-cooked in small batches to an extra crunchy finish, seasoned with pure sea salt.",
    nutrition: { calories: 150, fat: "8g", carbs: "16g", protein: "2g", fiber: "1g" },
    expiration: "Best within 3 months. Consume within 1 week of opening.",
    inventory: 4, // Low stock
    dietary: ["vegan", "gluten-free"],
    rating: 4.3,
    reviewsCount: 9,
    reviews: [],
    weeklyDeal: true,
    bestSeller: false
  },
  {
    id: "prod-19",
    name: "Organic Maple Syrup",
    category: "pantry",
    price: 7.99,
    unit: "bottle",
    pricePerUnit: "$7.99 / 12oz",
    avgWeight: "12 fl oz (354ml)",
    image: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=400&q=80",
    description: "100% pure Grade A Amber maple syrup harvested from Canadian forests. Rich, warm maple taste, ideal for pancakes and waffles.",
    nutrition: { calories: 200, fat: "0g", carbs: "53g", protein: "0g", fiber: "0g" },
    expiration: "Best within 1 year. Keep refrigerated after opening.",
    inventory: 15,
    dietary: ["organic", "vegan", "gluten-free"],
    rating: 4.8,
    reviewsCount: 17,
    reviews: [],
    weeklyDeal: false,
    bestSeller: false
  },
  {
    id: "prod-20",
    name: "Dark Chocolate Bar 72%",
    category: "pantry",
    price: 3.49,
    unit: "bar",
    pricePerUnit: "$3.49 each",
    avgWeight: "3.5 oz (100g)",
    image: "https://images.unsplash.com/photo-1549007994-cb92ca8a4a77?auto=format&fit=crop&w=400&q=80",
    description: "Rich dark chocolate crafted from organic, single-origin cacao beans. Balanced and smooth with notes of dark berries.",
    nutrition: { calories: 170, fat: "12g", carbs: "13g", protein: "2g", fiber: "3g" },
    expiration: "Best within 9 months. Keep in cool dry environment.",
    inventory: 50,
    dietary: ["organic", "vegan", "gluten-free"],
    rating: 4.9,
    reviewsCount: 30,
    reviews: [
      { name: "Chloe V.", rating: 5, comment: "Best dark chocolate I have had in a long time.", date: "2026-06-03" }
    ],
    weeklyDeal: false,
    bestSeller: true
  }
];

function getDeliverySlots() {
  const slots = [];
  const days = ["Today", "Tomorrow", "Day After"];
  const hours = [
    "08:00 AM - 10:00 AM",
    "10:00 AM - 12:00 PM",
    "12:00 PM - 02:00 PM",
    "02:00 PM - 04:00 PM",
    "04:00 PM - 06:00 PM",
    "06:00 PM - 08:00 PM"
  ];
  
  days.forEach((day, dIdx) => {
    const date = new Date();
    date.setDate(date.getDate() + dIdx);
    const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" });
    
    slots.push({
      id: `day-${dIdx}`,
      label: `${day} (${dateStr})`,
      date: date.toISOString().split("T")[0],
      times: hours.map((hour, hIdx) => {
        const isFull = (dIdx === 0 && hIdx < 2) || (dIdx === 1 && hIdx === 4); 
        return {
          id: `slot-${dIdx}-${hIdx}`,
          time: hour,
          available: !isFull
        };
      })
    });
  });
  
  return slots;
}

const INITIAL_USERS = [
  {
    email: "customer@freshcart.com",
    password: "password123",
    name: "Alex Johnson",
    phone: "(555) 234-5678",
    address: "742 Evergreen Terrace, Springfield",
    role: "customer",
    favorites: ["prod-1", "prod-2", "prod-15"],
    orders: [
      {
        id: "ord-88392",
        date: "2026-05-15",
        total: 24.37,
        status: "Delivered",
        items: [
          { productId: "prod-1", quantity: 2, price: 3.49 },
          { productId: "prod-9", quantity: 1, price: 4.89 },
          { productId: "prod-12", quantity: 2, price: 5.99 }
        ],
        type: "Delivery",
        slot: "02:00 PM - 04:00 PM"
      }
    ],
    savedPayments: [
      { cardType: "Visa", last4: "4321", expiry: "12/28" }
    ]
  },
  {
    email: "admin@freshcart.com",
    password: "adminpassword",
    name: "Store Manager",
    role: "admin"
  }
];

function initDatabase() {
  if (!localStorage.getItem("fc_products")) {
    localStorage.setItem("fc_products", JSON.stringify(DEFAULT_PRODUCTS));
  }
  if (!localStorage.getItem("fc_users")) {
    localStorage.setItem("fc_users", JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem("fc_orders")) {
    const defaultOrders = [
      {
        id: "ord-88392",
        customerEmail: "customer@freshcart.com",
        customerName: "Alex Johnson",
        date: "2026-05-15",
        total: 24.37,
        status: "Delivered",
        items: [
          { productId: "prod-1", quantity: 2, price: 3.49 },
          { productId: "prod-9", quantity: 1, price: 4.89 },
          { productId: "prod-12", quantity: 2, price: 5.99 }
        ],
        type: "Delivery",
        slot: "02:00 PM - 04:00 PM"
      }
    ];
    localStorage.setItem("fc_orders", JSON.stringify(defaultOrders));
  }
  if (!localStorage.getItem("fc_session")) {
    localStorage.setItem("fc_session", null);
  }
}

const db = {
  getProducts: () => JSON.parse(localStorage.getItem("fc_products")),
  saveProducts: (products) => {
    localStorage.setItem("fc_products", JSON.stringify(products));
    window.dispatchEvent(new Event("products_updated"));
  },
  getUsers: () => JSON.parse(localStorage.getItem("fc_users")),
  saveUsers: (users) => localStorage.setItem("fc_users", JSON.stringify(users)),
  getOrders: () => JSON.parse(localStorage.getItem("fc_orders")),
  saveOrders: (orders) => localStorage.setItem("fc_orders", JSON.stringify(orders)),
  getCurrentSession: () => JSON.parse(localStorage.getItem("fc_session")),
  setCurrentSession: (user) => {
    localStorage.setItem("fc_session", JSON.stringify(user));
    window.dispatchEvent(new Event("auth_state_changed"));
  },
  getSlots: () => getDeliverySlots()
};

initDatabase();
