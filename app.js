// app.js - Single Page Application Core for FreshCart Market

// --- Global Application State ---
const state = {
  cart: [],             // Array of { id, quantity }
  favorites: [],        // Array of product ids
  activeOrder: null,    // Order currently being tracked
  activeFilters: {
    search: "",
    categories: [],
    dietary: [],
    minPrice: null,
    maxPrice: null
  },
  activeSort: "featured",
  checkout: {
    type: "delivery", // 'delivery' or 'pickup'
    date: "",
    slotId: "",
    slotLabel: "",
    step: 1
  }
};

// Initialize app after DOM loaded
document.addEventListener("DOMContentLoaded", () => {
  // Sync state with storage
  loadCartState();
  loadFavoritesState();
  syncAuthUI();
  
  // Router Initialization
  window.addEventListener("hashchange", handleRouting);
  // Initial Route
  handleRouting();
  
  // Setup global event listeners
  setupGlobalListeners();
  
  // Scrolled header effect
  window.addEventListener("scroll", () => {
    const header = document.querySelector("header");
    if (window.scrollY > 20) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
  
  // Listen for database changes (from admin or updates)
  window.addEventListener("products_updated", () => {
    // If we're on shop or admin page, re-render
    const hash = window.location.hash || "#/";
    if (hash.startsWith("#/shop") || hash.startsWith("#/admin")) {
      handleRouting();
    }
  });
  
  window.addEventListener("auth_state_changed", () => {
    syncAuthUI();
    handleRouting();
  });
});

// --- ROUTER SYSTEM ---
function handleRouting() {
  const hash = window.location.hash || "#/";
  const viewContainer = document.getElementById("app-view");
  
  // Scroll to top
  window.scrollTo(0, 0);
  
  // Close any overlay drawers/suggestions
  closeCartDrawer();
  closeSearchSuggestions();
  
  if (hash === "#/" || hash === "") {
    renderHomepage(viewContainer);
  } else if (hash.startsWith("#/shop")) {
    renderShopPage(viewContainer);
  } else if (hash === "#/checkout") {
    renderCheckoutPage(viewContainer);
  } else if (hash === "#/profile") {
    renderProfilePage(viewContainer);
  } else if (hash === "#/admin") {
    renderAdminPage(viewContainer);
  } else {
    // 404 Fallback
    viewContainer.innerHTML = `
      <div class="container" style="text-align: center; padding: 80px 24px;">
        <h2 style="font-size: 2.5rem; margin-bottom: 16px;">Page Not Found</h2>
        <p style="color: var(--text-muted); margin-bottom: 24px;">Oops! The page you are looking for does not exist.</p>
        <a href="#/" class="hero-btn" style="display: inline-flex;">Go Back Home</a>
      </div>
    `;
    lucide.createIcons();
  }
}

// --- VIEW RENDERING ENGINE ---

// 1. Homepage
function renderHomepage(container) {
  const products = db.getProducts();
  const deals = products.filter(p => p.weeklyDeal).slice(0, 4);
  const bestSellers = products.filter(p => p.bestSeller).slice(0, 4);
  
  container.innerHTML = `
    <!-- Hero Banner -->
    <section class="container">
      <div class="hero-banner">
        <img class="hero-img" src="assets/hero_banner.png" alt="Fresh Produce">
        <div class="hero-content">
          <span class="hero-tag">100% Organic & Local</span>
          <h1>Freshness Delivered<br>Direct To Your Door</h1>
          <p>Order fresh farm vegetables, bakery treats, premium meats, and dairy products. Selected with love, delivered with care.</p>
          <a href="#/shop" class="hero-btn">
            Shop Fresh Now
            <i data-lucide="arrow-right"></i>
          </a>
        </div>
      </div>
    </section>

    <!-- Shop By Category Grid -->
    <section class="container categories-section">
      <h2 class="section-title">Shop by Category</h2>
      <div class="categories-grid">
        <div class="category-card" onclick="setCategoryFilter('produce')">
          <img src="assets/cat_produce.png" alt="Produce">
          <div class="category-name">Fresh Produce</div>
          <div class="category-count">${products.filter(p => p.category === 'produce').length} items</div>
        </div>
        <div class="category-card" onclick="setCategoryFilter('bakery')">
          <img src="assets/cat_bakery.png" alt="Bakery">
          <div class="category-name">Bakery & Bread</div>
          <div class="category-count">${products.filter(p => p.category === 'bakery').length} items</div>
        </div>
        <div class="category-card" onclick="setCategoryFilter('dairy')">
          <img src="assets/cat_dairy.png" alt="Dairy">
          <div class="category-name">Dairy & Eggs</div>
          <div class="category-count">${products.filter(p => p.category === 'dairy').length} items</div>
        </div>
        <div class="category-card" onclick="setCategoryFilter('meat')">
          <img src="assets/cat_meat.png" alt="Meat & Seafood">
          <div class="category-name">Meat & Seafood</div>
          <div class="category-count">${products.filter(p => p.category === 'meat').length} items</div>
        </div>
      </div>
    </section>

    <!-- Weekly Deals -->
    <section class="container products-section">
      <h2 class="section-title">
        Weekly Deals 
        <span onclick="window.location.hash='#/shop?deal=true'">View All</span>
      </h2>
      <div class="products-grid">
        ${deals.map(p => renderProductCardHTML(p)).join("")}
      </div>
    </section>

    <!-- Best Sellers -->
    <section class="container products-section" style="margin-bottom: 80px;">
      <h2 class="section-title">
        Best Sellers
        <span onclick="window.location.hash='#/shop?bestseller=true'">View All</span>
      </h2>
      <div class="products-grid">
        ${bestSellers.map(p => renderProductCardHTML(p)).join("")}
      </div>
    </section>
  `;
  
  lucide.createIcons();
}

// Helper to set category from homepage
window.setCategoryFilter = function(cat) {
  state.activeFilters = {
    search: "",
    categories: [cat],
    dietary: [],
    minPrice: null,
    maxPrice: null
  };
  window.location.hash = `#/shop?category=${cat}`;
};

// 2. Product Listing Page (PLP)
function renderShopPage(container) {
  const params = new URLSearchParams(window.location.hash.split("?")[1] || "");
  if (params.has("category") && state.activeFilters.categories.length === 0) {
    state.activeFilters.categories = [params.get("category")];
  }
  
  const products = db.getProducts();
  
  container.innerHTML = `
    <div class="container plp-container">
      <!-- Sidebar Filters -->
      <aside class="filters-sidebar">
        <h3 style="font-weight: 800; font-size: 1.25rem; margin-bottom: 20px;">Filters</h3>
        
        <!-- Category Filter -->
        <div class="filter-group">
          <div class="filter-title">Category</div>
          <label class="filter-option">
            <input type="checkbox" value="produce" ${state.activeFilters.categories.includes("produce") ? "checked" : ""} onchange="toggleFilter('categories', 'produce')">
            Fresh Produce
          </label>
          <label class="filter-option">
            <input type="checkbox" value="bakery" ${state.activeFilters.categories.includes("bakery") ? "checked" : ""} onchange="toggleFilter('categories', 'bakery')">
            Bakery & Bread
          </label>
          <label class="filter-option">
            <input type="checkbox" value="dairy" ${state.activeFilters.categories.includes("dairy") ? "checked" : ""} onchange="toggleFilter('categories', 'dairy')">
            Dairy & Eggs
          </label>
          <label class="filter-option">
            <input type="checkbox" value="meat" ${state.activeFilters.categories.includes("meat") ? "checked" : ""} onchange="toggleFilter('categories', 'meat')">
            Meat & Seafood
          </label>
          <label class="filter-option">
            <input type="checkbox" value="pantry" ${state.activeFilters.categories.includes("pantry") ? "checked" : ""} onchange="toggleFilter('categories', 'pantry')">
            Pantry & Snacks
          </label>
        </div>

        <!-- Dietary Preference -->
        <div class="filter-group">
          <div class="filter-title">Dietary Preference</div>
          <label class="filter-option">
            <input type="checkbox" value="organic" ${state.activeFilters.dietary.includes("organic") ? "checked" : ""} onchange="toggleFilter('dietary', 'organic')">
            Organic
          </label>
          <label class="filter-option">
            <input type="checkbox" value="vegan" ${state.activeFilters.dietary.includes("vegan") ? "checked" : ""} onchange="toggleFilter('dietary', 'vegan')">
            Vegan
          </label>
          <label class="filter-option">
            <input type="checkbox" value="gluten-free" ${state.activeFilters.dietary.includes("gluten-free") ? "checked" : ""} onchange="toggleFilter('dietary', 'gluten-free')">
            Gluten-Free
          </label>
        </div>

        <!-- Price Range -->
        <div class="filter-group">
          <div class="filter-title">Price Range</div>
          <div class="price-range-inputs">
            <input type="number" class="price-input" id="filter-min-price" placeholder="Min" value="${state.activeFilters.minPrice || ""}" oninput="updatePriceFilter()">
            <span style="color: var(--text-light)">-</span>
            <input type="number" class="price-input" id="filter-max-price" placeholder="Max" value="${state.activeFilters.maxPrice || ""}" oninput="updatePriceFilter()">
          </div>
        </div>

        <button class="filter-btn-clear" onclick="clearAllFilters()">Clear Filters</button>
      </aside>

      <!-- Shop Main Content -->
      <main class="plp-content">
        <div class="plp-toolbar">
          <div class="plp-results-count" id="plp-results-count">Showing 0 products</div>
          <div class="plp-sort">
            <span>Sort by:</span>
            <select class="sort-select" onchange="changeSort(this.value)">
              <option value="featured" ${state.activeSort === 'featured' ? 'selected' : ''}>Featured</option>
              <option value="price-low" ${state.activeSort === 'price-low' ? 'selected' : ''}>Price: Low to High</option>
              <option value="price-high" ${state.activeSort === 'price-high' ? 'selected' : ''}>Price: High to Low</option>
              <option value="rating" ${state.activeSort === 'rating' ? 'selected' : ''}>Rating</option>
            </select>
          </div>
        </div>

        <!-- Catalog Grid -->
        <div class="products-grid" id="plp-grid-container">
          <!-- Dynamically populated -->
        </div>
      </main>
    </div>
  `;
  
  applyFiltersAndRender();
  lucide.createIcons();
}

function applyFiltersAndRender() {
  let products = db.getProducts();
  const params = new URLSearchParams(window.location.hash.split("?")[1] || "");
  
  if (params.get("deal") === "true") {
    products = products.filter(p => p.weeklyDeal);
  }
  if (params.get("bestseller") === "true") {
    products = products.filter(p => p.bestSeller);
  }
  if (state.activeFilters.search) {
    const query = state.activeFilters.search.toLowerCase().trim();
    products = products.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
  }
  if (state.activeFilters.categories.length > 0) {
    products = products.filter(p => state.activeFilters.categories.includes(p.category));
  }
  if (state.activeFilters.dietary.length > 0) {
    products = products.filter(p => state.activeFilters.dietary.every(d => p.dietary.includes(d)));
  }
  if (state.activeFilters.minPrice !== null) {
    products = products.filter(p => p.price >= state.activeFilters.minPrice);
  }
  if (state.activeFilters.maxPrice !== null) {
    products = products.filter(p => p.price <= state.activeFilters.maxPrice);
  }
  if (state.activeSort === "price-low") {
    products.sort((a, b) => a.price - b.price);
  } else if (state.activeSort === "price-high") {
    products.sort((a, b) => b.price - a.price);
  } else if (state.activeSort === "rating") {
    products.sort((a, b) => b.rating - a.rating);
  }
  
  const grid = document.getElementById("plp-grid-container");
  const countText = document.getElementById("plp-results-count");
  
  if (grid) {
    countText.innerText = `Showing ${products.length} products`;
    if (products.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-muted)">
          <i data-lucide="info" style="width: 48px; height: 48px; margin-bottom: 12px;"></i>
          <p>No products match your current filters.</p>
        </div>
      `;
    } else {
      grid.innerHTML = products.map(p => renderProductCardHTML(p)).join("");
    }
    lucide.createIcons();
  }
}

window.toggleFilter = function(filterType, value) {
  const idx = state.activeFilters[filterType].indexOf(value);
  if (idx > -1) {
    state.activeFilters[filterType].splice(idx, 1);
  } else {
    state.activeFilters[filterType].push(value);
  }
  applyFiltersAndRender();
};

window.updatePriceFilter = function() {
  const minVal = parseFloat(document.getElementById("filter-min-price").value);
  const maxVal = parseFloat(document.getElementById("filter-max-price").value);
  state.activeFilters.minPrice = isNaN(minVal) ? null : minVal;
  state.activeFilters.maxPrice = isNaN(maxVal) ? null : maxVal;
  applyFiltersAndRender();
};

window.clearAllFilters = function() {
  state.activeFilters = {
    search: "",
    categories: [],
    dietary: [],
    minPrice: null,
    maxPrice: null
  };
  
  document.querySelectorAll(".filters-sidebar input[type='checkbox']").forEach(cb => cb.checked = false);
  const minInput = document.getElementById("filter-min-price");
  const maxInput = document.getElementById("filter-max-price");
  if (minInput) minInput.value = "";
  if (maxInput) maxInput.value = "";
  
  if (window.location.hash.includes("?")) {
    window.location.hash = "#/shop";
  } else {
    applyFiltersAndRender();
  }
};

window.changeSort = function(val) {
  state.activeSort = val;
  applyFiltersAndRender();
};

// 3. Checkout Page
function renderCheckoutPage(container) {
  if (state.cart.length === 0) {
    container.innerHTML = `
      <div class="container" style="text-align: center; padding: 80px 24px;">
        <i data-lucide="shopping-bag" style="width: 64px; height: 64px; color: var(--text-light); margin-bottom: 24px;"></i>
        <h2 style="font-size: 2rem; margin-bottom: 12px;">Your Cart is Empty</h2>
        <p style="color: var(--text-muted); margin-bottom: 24px;">Add items to your cart from our shop page to proceed to checkout.</p>
        <a href="#/shop" class="hero-btn" style="display: inline-flex;">Go Shopping</a>
      </div>
    `;
    lucide.createIcons();
    return;
  }
  
  const user = db.getCurrentSession();
  const slots = db.getSlots();
  
  let firstAvailableDay = slots[0];
  let firstAvailableSlot = firstAvailableDay.times.find(t => t.available);
  if (!state.checkout.date) {
    state.checkout.date = firstAvailableDay.date;
    state.checkout.slotId = firstAvailableSlot ? firstAvailableSlot.id : "";
    state.checkout.slotLabel = firstAvailableSlot ? `${firstAvailableDay.label} - ${firstAvailableSlot.time}` : "";
  }
  
  container.innerHTML = `
    <div class="container checkout-container">
      <div class="checkout-card">
        <div class="stepper">
          <div class="step ${state.checkout.step === 1 ? 'active' : ''} ${state.checkout.step > 1 ? 'completed' : ''}" id="step-ind-1">
            <div class="step-num">1</div>
            <div class="step-label">Delivery Options</div>
          </div>
          <div class="step ${state.checkout.step === 2 ? 'active' : ''} ${state.checkout.step > 2 ? 'completed' : ''}" id="step-ind-2">
            <div class="step-num">2</div>
            <div class="step-label">Information & Pay</div>
          </div>
          <div class="step ${state.checkout.step === 3 ? 'active' : ''}" id="step-ind-3">
            <div class="step-num">3</div>
            <div class="step-label">Confirmation</div>
          </div>
        </div>

        <div class="checkout-step-panel ${state.checkout.step === 1 ? 'active' : ''}" id="checkout-panel-1">
          <div class="checkout-step-title">Select Delivery or Curbside Pickup</div>
          
          <div class="delivery-type-options">
            <div class="type-card ${state.checkout.type === 'delivery' ? 'active' : ''}" onclick="setCheckoutType('delivery')">
              <i data-lucide="truck" style="width: 32px; height: 32px; color: var(--primary)"></i>
              <div class="type-title">Home Delivery</div>
              <div class="type-desc">Contactless delivery to your address. Free over $35.</div>
            </div>
            <div class="type-card ${state.checkout.type === 'pickup' ? 'active' : ''}" onclick="setCheckoutType('pickup')">
              <i data-lucide="store" style="width: 32px; height: 32px; color: var(--primary)"></i>
              <div class="type-title">Curbside Pickup</div>
              <div class="type-desc">Pick up at FreshCart Market parking slot. Free.</div>
            </div>
          </div>
          
          <div class="scheduler-section">
            <div class="filter-title">Choose Date & Time Slot</div>
            <div class="scheduler-dates">
              ${slots.map(d => `
                <div class="scheduler-date-card ${state.checkout.date === d.date ? 'active' : ''}" onclick="selectCheckoutDate('${d.date}')">
                  ${d.label}
                </div>
              `).join("")}
            </div>
            <div class="scheduler-slots">
              ${renderTimeSlotsHTML()}
            </div>
          </div>

          <div style="margin-top: 32px; display: flex; justify-content: flex-end;">
            <button class="checkout-btn" style="width: auto; margin: 0; padding: 12px 36px;" onclick="goToCheckoutStep(2)">
              Continue to Payment
              <i data-lucide="arrow-right"></i>
            </button>
          </div>
        </div>

        <div class="checkout-step-panel ${state.checkout.step === 2 ? 'active' : ''}" id="checkout-panel-2">
          <div class="checkout-step-title">Personal & Payment Details</div>
          
          <div class="form-grid" style="margin-bottom: 32px;">
            <div class="form-group">
              <label for="co-name">Full Name *</label>
              <input type="text" id="co-name" class="form-control" placeholder="Alex Johnson" value="${user ? user.name : ''}" required>
            </div>
            <div class="form-group">
              <label for="co-phone">Phone Number *</label>
              <input type="tel" id="co-phone" class="form-control" placeholder="(555) 000-0000" value="${user ? user.phone || '' : ''}" required>
            </div>
            <div class="form-group span-2">
              <label for="co-address">${state.checkout.type === 'delivery' ? 'Delivery Address *' : 'Billing Address *'}</label>
              <input type="text" id="co-address" class="form-control" placeholder="123 Fresh Lane, Green Town" value="${user ? user.address || '' : ''}" required>
            </div>
          </div>

          <div class="filter-title">Secure Payment Method</div>
          <div class="payment-methods">
            <div class="payment-method-row active" onclick="setPaymentMethod('card')">
              <input type="radio" name="payment-option" id="pay-card" checked>
              <i data-lucide="credit-card" style="color: var(--primary)"></i>
              <div style="flex: 1; font-weight: 600;">Credit / Debit Card</div>
              <div style="display: flex; gap: 8px;">
                <img src="https://cdn-icons-png.flaticon.com/128/196/196137.png" height="20" alt="Visa">
                <img src="https://cdn-icons-png.flaticon.com/128/196/196115.png" height="20" alt="Mastercard">
              </div>
            </div>
            
            <div class="payment-details-form active" id="card-fields-form">
              <div class="form-grid">
                <div class="form-group span-2">
                  <label for="card-num">Card Number</label>
                  <input type="text" id="card-num" class="form-control" placeholder="4111 2222 3333 4444" value="${user && user.savedPayments && user.savedPayments.length > 0 ? '•••• •••• •••• ' + user.savedPayments[0].last4 : ''}">
                </div>
                <div class="form-group">
                  <label for="card-expiry">Expiration Date</label>
                  <input type="text" id="card-expiry" class="form-control" placeholder="MM/YY" value="${user && user.savedPayments && user.savedPayments.length > 0 ? user.savedPayments[0].expiry : ''}">
                </div>
                <div class="form-group">
                  <label for="card-cvv">CVV</label>
                  <input type="password" id="card-cvv" class="form-control" placeholder="•••">
                </div>
              </div>
            </div>

            <div class="payment-method-row" onclick="setPaymentMethod('paypal')">
              <input type="radio" name="payment-option" id="pay-paypal">
              <span style="font-weight: 800; color: #003087; font-style: italic;">PayPal</span>
              <div style="flex: 1;"></div>
            </div>
            
            <div class="payment-method-row" onclick="setPaymentMethod('applepay')">
              <input type="radio" name="payment-option" id="pay-apple">
              <i data-lucide="apple" style="color: black; fill: black;"></i>
              <div style="flex: 1; font-weight: 600;">Apple Pay</div>
              <div style="flex: 1;"></div>
            </div>
          </div>

          <div style="margin-top: 32px; display: flex; justify-content: space-between;">
            <button class="filter-btn-clear" style="width: auto; margin: 0;" onclick="goToCheckoutStep(1)">Back</button>
            <button class="checkout-btn" style="width: auto; margin: 0; padding: 12px 36px; background-color: var(--primary-dark);" onclick="placeOrder()">
              Place Order ($${computeTotals().total})
            </button>
          </div>
        </div>

        <div class="checkout-step-panel" id="checkout-panel-3"></div>
      </div>

      <aside class="checkout-summary-card">
        <h3 style="font-weight: 800; font-size: 1.2rem; margin-bottom: 20px;">Order Summary</h3>
        <div class="summary-items-list">
          ${state.cart.map(item => {
            const p = db.getProducts().find(prod => prod.id === item.productId);
            if (!p) return "";
            return `
              <div class="summary-item-row">
                <div class="summary-item-name">${p.name}</div>
                <div class="summary-item-qty">x${item.quantity}</div>
                <div style="font-weight: 600;">$${(p.price * item.quantity).toFixed(2)}</div>
              </div>
            `;
          }).join("")}
        </div>

        <div class="coupon-group">
          <input type="text" class="coupon-input" id="checkout-coupon" placeholder="Promo code (e.g. FRESH10)">
          <button class="coupon-btn" onclick="applyPromoCode()">Apply</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div class="cart-summary-row">
            <span>Subtotal</span>
            <span id="co-subtotal">$${computeTotals().subtotal}</span>
          </div>
          <div class="cart-summary-row">
            <span>Delivery</span>
            <span id="co-delivery">${computeTotals().delivery === 0 ? "FREE" : "$" + computeTotals().delivery.toFixed(2)}</span>
          </div>
          <div class="cart-summary-row" id="co-promo-row" style="display: none; color: var(--primary-hover); font-weight: 600;">
            <span>Discount (10%)</span>
            <span id="co-promo-val">-$0.00</span>
          </div>
          <div class="cart-summary-row total">
            <span>Total</span>
            <span id="co-total">$${computeTotals().total}</span>
          </div>
        </div>
      </aside>
    </div>
  `;
  
  lucide.createIcons();
}

function renderTimeSlotsHTML() {
  const slots = db.getSlots();
  const currentDay = slots.find(d => d.date === state.checkout.date) || slots[0];
  
  return currentDay.times.map(t => {
    const isSelected = state.checkout.slotId === t.id;
    return `
      <div class="scheduler-slot-card ${isSelected ? 'active' : ''} ${t.available ? '' : 'disabled'}" 
           onclick="${t.available ? `selectCheckoutSlot('${t.id}', '${currentDay.label} - ${t.time}')` : ''}">
        ${t.time}
        <div style="font-size: 0.7rem; margin-top: 4px; font-weight: 600;">
          ${t.available ? 'Available' : 'Unavailable'}
        </div>
      </div>
    `;
  }).join("");
}

window.setCheckoutType = function(type) {
  state.checkout.type = type;
  const viewContainer = document.getElementById("app-view");
  renderCheckoutPage(viewContainer);
};

window.selectCheckoutDate = function(date) {
  state.checkout.date = date;
  state.checkout.slotId = "";
  state.checkout.slotLabel = "";
  const viewContainer = document.getElementById("app-view");
  renderCheckoutPage(viewContainer);
};

window.selectCheckoutSlot = function(id, label) {
  state.checkout.slotId = id;
  state.checkout.slotLabel = label;
  const viewContainer = document.getElementById("app-view");
  renderCheckoutPage(viewContainer);
};

window.goToCheckoutStep = function(stepNum) {
  if (stepNum === 2 && (!state.checkout.slotId || !state.checkout.date)) {
    showToast("Please choose a delivery date and time slot first.", "error");
    return;
  }
  state.checkout.step = stepNum;
  const viewContainer = document.getElementById("app-view");
  renderCheckoutPage(viewContainer);
};

window.setPaymentMethod = function(method) {
  const form = document.getElementById("card-fields-form");
  document.querySelectorAll(".payment-method-row").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".payment-method-row input[type='radio']").forEach(el => el.checked = false);
  
  if (method === 'card') {
    document.querySelector(".payment-method-row:nth-child(1)").classList.add("active");
    document.getElementById("pay-card").checked = true;
    form.classList.add("active");
  } else if (method === 'paypal') {
    document.querySelector(".payment-method-row:nth-child(3)").classList.add("active");
    document.getElementById("pay-paypal").checked = true;
    form.classList.remove("active");
  } else if (method === 'applepay') {
    document.querySelector(".payment-method-row:nth-child(4)").classList.add("active");
    document.getElementById("pay-apple").checked = true;
    form.classList.remove("active");
  }
};

let promoApplied = false;

window.applyPromoCode = function() {
  const promoInput = document.getElementById("checkout-coupon");
  if (!promoInput) return;
  
  const code = promoInput.value.toUpperCase().trim();
  if (code === "FRESH10") {
    promoApplied = true;
    showToast("Promo code applied successfully! 10% Discount.", "success");
    const totals = computeTotals();
    const promoRow = document.getElementById("co-promo-row");
    const promoVal = document.getElementById("co-promo-val");
    const coTotal = document.getElementById("co-total");
    
    if (promoRow && promoVal && coTotal) {
      promoRow.style.display = "flex";
      promoVal.innerText = `-$${(totals.subtotal * 0.1).toFixed(2)}`;
      coTotal.innerText = `$${totals.total}`;
    }
  } else {
    showToast("Invalid promo code. Try 'FRESH10'.", "error");
  }
};

function computeTotals() {
  let subtotal = 0;
  state.cart.forEach(item => {
    const p = db.getProducts().find(prod => prod.id === item.productId);
    if (p) subtotal += p.price * item.quantity;
  });
  let delivery = 0;
  if (state.checkout.type === "delivery" && subtotal < 35) {
    delivery = 4.99;
  }
  let discount = promoApplied ? subtotal * 0.1 : 0;
  let total = subtotal + delivery - discount;
  return {
    subtotal: subtotal.toFixed(2),
    delivery: delivery,
    discount: discount.toFixed(2),
    total: total.toFixed(2)
  };
}

window.placeOrder = function() {
  const nameVal = document.getElementById("co-name").value.trim();
  const phoneVal = document.getElementById("co-phone").value.trim();
  const addressVal = document.getElementById("co-address").value.trim();
  
  if (!nameVal || !phoneVal || !addressVal) {
    showToast("Please fill in all required contact/delivery fields.", "error");
    return;
  }
  
  const products = db.getProducts();
  let inventoryError = false;
  
  state.cart.forEach(item => {
    const p = products.find(prod => prod.id === item.productId);
    if (p && p.inventory < item.quantity) {
      inventoryError = true;
      showToast(`Sorry, ${p.name} only has ${p.inventory} units in stock.`, "error");
    }
  });
  
  if (inventoryError) return;
  
  state.cart.forEach(item => {
    const p = products.find(prod => prod.id === item.productId);
    if (p) p.inventory -= item.quantity;
  });
  db.saveProducts(products);
  
  const orderId = "ord-" + Math.floor(10000 + Math.random() * 90000);
  const totals = computeTotals();
  const sessionUser = db.getCurrentSession();
  
  const orderObj = {
    id: orderId,
    customerEmail: sessionUser ? sessionUser.email : "guest@freshcart.com",
    customerName: nameVal,
    date: new Date().toISOString().split("T")[0],
    total: parseFloat(totals.total),
    status: "Processing",
    items: state.cart.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: products.find(p => p.id === item.productId).price
    })),
    type: state.checkout.type === "delivery" ? "Delivery" : "Pickup",
    slot: state.checkout.slotLabel
  };
  
  const allOrders = db.getOrders();
  allOrders.unshift(orderObj);
  db.saveOrders(allOrders);
  
  if (sessionUser) {
    const users = db.getUsers();
    const activeUser = users.find(u => u.email === sessionUser.email);
    if (activeUser) {
      if (!activeUser.orders) activeUser.orders = [];
      activeUser.orders.unshift({
        id: orderId,
        date: orderObj.date,
        total: orderObj.total,
        status: "Processing",
        items: orderObj.items,
        type: orderObj.type,
        slot: orderObj.slot
      });
      db.saveUsers(users);
      db.setCurrentSession(activeUser);
    }
  }
  
  state.activeOrder = orderObj;
  state.checkout.step = 3;
  state.cart = [];
  saveCartState();
  updateCartBadge();
  
  const stepPanel3 = document.getElementById("checkout-panel-3");
  const stepIndicator1 = document.getElementById("step-ind-1");
  const stepIndicator2 = document.getElementById("step-ind-2");
  const stepIndicator3 = document.getElementById("step-ind-3");
  
  if (stepIndicator1 && stepIndicator2 && stepIndicator3) {
    stepIndicator1.classList.remove("active");
    stepIndicator1.classList.add("completed");
    stepIndicator2.classList.remove("active");
    stepIndicator2.classList.add("completed");
    stepIndicator3.classList.add("active");
  }
  
  document.getElementById("checkout-panel-1").classList.remove("active");
  document.getElementById("checkout-panel-2").classList.remove("active");
  stepPanel3.classList.add("active");
  
  stepPanel3.innerHTML = `
    <div class="confirmation-panel">
      <div class="success-icon-wrapper">
        <i data-lucide="check" style="width: 44px; height: 44px;"></i>
      </div>
      <h2 style="font-size: 2.2rem; font-weight: 800; margin-bottom: 8px;">Order Placed Successfully!</h2>
      <p style="color: var(--text-muted); margin-bottom: 24px;">Thank you for shopping at FreshCart Market. We have received your order.</p>
      
      <div class="conf-order-details">
        <div class="conf-row">
          <span class="conf-label">Order Number</span>
          <span class="conf-val">${orderObj.id}</span>
        </div>
        <div class="conf-row">
          <span class="conf-label">Delivery Date / Time</span>
          <span class="conf-val" style="font-size: 0.85rem;">${orderObj.slot}</span>
        </div>
        <div class="conf-row">
          <span class="conf-label">Estimated Delivery Address</span>
          <span class="conf-val" style="font-size: 0.85rem; text-align: right;">${orderObj.customerName},<br>${addressVal}</span>
        </div>
        <div class="conf-row" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--neutral-divider);">
          <span class="conf-label">Paid Total</span>
          <span class="conf-val">$${orderObj.total}</span>
        </div>
      </div>

      <div class="delivery-tracker">
        <div class="tracker-title">Live Delivery Tracking</div>
        <div class="tracker-timeline" id="live-order-tracker">
          ${renderTrackerHTML(orderObj.status)}
        </div>
      </div>

      <div style="margin-top: 40px; display: flex; gap: 16px; justify-content: center;">
        <a href="#/shop" class="filter-btn-clear" style="width: auto; margin: 0; padding: 12px 28px;">Continue Shopping</a>
        <a href="#/profile" class="hero-btn" style="padding: 12px 28px;">Go to Profile</a>
      </div>
    </div>
  `;
  
  setupMockStatusProgression(orderObj.id);
  lucide.createIcons();
};

function renderTrackerHTML(status) {
  const steps = ["Placed", "Preparing", "Out for Delivery", "Delivered"];
  const currentStepIdx = steps.findIndex(s => s.toLowerCase() === status.toLowerCase() || (status === 'Processing' && s === 'Placed'));
  
  return steps.map((s, idx) => {
    const isCompleted = idx < currentStepIdx;
    const isActive = idx === currentStepIdx;
    
    return `
      <div class="tracker-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}">
        <div class="tracker-dot"></div>
        <div class="tracker-label">${s}</div>
      </div>
    `;
  }).join("");
}

function setupMockStatusProgression(orderId) {
  setTimeout(() => {
    updateOrderStatusSimulated(orderId, "Preparing");
  }, 10000);
  setTimeout(() => {
    updateOrderStatusSimulated(orderId, "Out for Delivery");
  }, 25000);
}

function updateOrderStatusSimulated(orderId, newStatus) {
  const trackerEl = document.getElementById("live-order-tracker");
  const allOrders = db.getOrders();
  const ord = allOrders.find(o => o.id === orderId);
  
  if (ord) {
    ord.status = newStatus;
    db.saveOrders(allOrders);
    
    const sessionUser = db.getCurrentSession();
    if (sessionUser) {
      const users = db.getUsers();
      const activeUser = users.find(u => u.email === sessionUser.email);
      if (activeUser) {
        const uOrd = activeUser.orders.find(o => o.id === orderId);
        if (uOrd) uOrd.status = newStatus;
        db.saveUsers(users);
        db.setCurrentSession(activeUser);
      }
    }
    
    if (trackerEl && state.checkout.step === 3 && state.activeOrder && state.activeOrder.id === orderId) {
      state.activeOrder.status = newStatus;
      trackerEl.innerHTML = renderTrackerHTML(newStatus);
      showToast(`Order ${orderId} status updated: ${newStatus}`, "success");
      lucide.createIcons();
    }
  }
}

// 4. Customer Profile Page
function renderProfilePage(container) {
  const user = db.getCurrentSession();
  if (!user || user.role === 'admin') {
    container.innerHTML = `
      <div class="container" style="text-align: center; padding: 80px 24px;">
        <i data-lucide="user" style="width: 64px; height: 64px; color: var(--text-light); margin-bottom: 24px;"></i>
        <h2 style="font-size: 2rem; margin-bottom: 12px;">Profile Account</h2>
        <p style="color: var(--text-muted); margin-bottom: 24px;">Please sign in to view your profile, order history, and saved items.</p>
        <button class="hero-btn" style="display: inline-flex;" onclick="openAuthModal('login')">Sign In Now</button>
      </div>
    `;
    lucide.createIcons();
    return;
  }
  
  const activeTab = state.profileActiveTab || "history";
  const userOrders = user.orders || [];
  const products = db.getProducts();
  const favItems = products.filter(p => state.favorites.includes(p.id));
  
  container.innerHTML = `
    <div class="container profile-container">
      <aside class="profile-sidebar">
        <div style="text-align: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid var(--neutral-border);">
          <div class="avatar" style="width: 60px; height: 60px; margin: 0 auto 12px; font-size: 1.5rem;">
            ${user.name.charAt(0)}
          </div>
          <h4 style="font-weight: 700;">${user.name}</h4>
          <span style="font-size: 0.8rem; color: var(--text-muted)">${user.email}</span>
        </div>
        <nav>
          <div class="profile-nav-item ${activeTab === 'history' ? 'active' : ''}" onclick="setProfileTab('history')">
            <i data-lucide="package" style="width: 18px; height: 18px;"></i>
            Order History
          </div>
          <div class="profile-nav-item ${activeTab === 'favorites' ? 'active' : ''}" onclick="setProfileTab('favorites')">
            <i data-lucide="heart" style="width: 18px; height: 18px;"></i>
            Reorder List / Favs
          </div>
          <div class="profile-nav-item ${activeTab === 'settings' ? 'active' : ''}" onclick="setProfileTab('settings')">
            <i data-lucide="settings" style="width: 18px; height: 18px;"></i>
            Account Details
          </div>
          <div class="profile-nav-item logout" style="margin-top: 40px;" onclick="handleLogout()">
            <i data-lucide="log-out" style="width: 18px; height: 18px;"></i>
            Log Out
          </div>
        </nav>
      </aside>

      <main style="flex: 1;">
        <div class="profile-content-panel ${activeTab === 'history' ? 'active' : ''}">
          <div class="checkout-step-title">Your Order History</div>
          ${userOrders.length === 0 ? `
            <div style="text-align: center; padding: 48px; color: var(--text-muted)">
              <p>You have not placed any orders yet.</p>
              <a href="#/shop" class="hero-btn" style="margin-top: 16px; display: inline-flex;">Browse Shop</a>
            </div>
          ` : `
            <div class="orders-list">
              ${userOrders.map(o => `
                <div class="order-history-card">
                  <div class="order-history-header">
                    <div>
                      <span class="order-history-id">${o.id}</span>
                      <span style="color: var(--text-light); margin: 0 8px;">|</span>
                      <span>${o.date}</span>
                    </div>
                    <span class="order-history-status status-${o.status.toLowerCase().replace(/\s/g, '')}">${o.status}</span>
                  </div>
                  <div class="order-history-body">
                    <div class="order-history-items">
                      ${o.items.map(item => {
                        const p = products.find(prod => prod.id === item.productId);
                        return `${p ? p.name : 'Unknown Product'} (x${item.quantity})`;
                      }).join(", ")}
                      <div style="font-size: 0.8rem; margin-top: 8px; font-weight: 600; color: var(--text-main);">
                        Slot: ${o.slot} (${o.type})
                      </div>
                    </div>
                    <div style="text-align: right; display: flex; flex-direction: column; gap: 8px;">
                      <div style="font-weight: 700; font-size: 1.1rem;">$${o.total.toFixed(2)}</div>
                      <button class="reorder-btn" onclick="reorderItems('${o.id}')">Reorder All</button>
                    </div>
                  </div>
                  ${o.status !== 'Delivered' ? `
                    <div class="delivery-tracker" style="margin-top: 16px; border-top: 1px dotted var(--neutral-divider);">
                      <div class="tracker-timeline" style="margin-top: 12px;">
                        ${renderTrackerHTML(o.status)}
                      </div>
                    </div>
                  ` : ''}
                </div>
              `).join("")}
            </div>
          `}
        </div>

        <div class="profile-content-panel ${activeTab === 'favorites' ? 'active' : ''}">
          <div class="checkout-step-title">Saved Reorder Items</div>
          ${favItems.length === 0 ? `
            <div style="text-align: center; padding: 48px; color: var(--text-muted)">
              <p>Your reorder list is empty. Click the heart icon on any product to save it here.</p>
            </div>
          ` : `
            <div class="products-grid">
              ${favItems.map(p => renderProductCardHTML(p)).join("")}
            </div>
          `}
        </div>

        <div class="profile-content-panel ${activeTab === 'settings' ? 'active' : ''}">
          <div class="checkout-step-title">Profile Settings</div>
          <form id="profile-settings-form" onsubmit="saveProfileSettings(event)">
            <div class="form-grid">
              <div class="form-group">
                <label>Name</label>
                <input type="text" id="settings-name" class="form-control" value="${user.name}">
              </div>
              <div class="form-group">
                <label>Email Address</label>
                <input type="email" class="form-control" value="${user.email}" disabled>
              </div>
              <div class="form-group">
                <label>Phone Number</label>
                <input type="text" id="settings-phone" class="form-control" value="${user.phone || ''}">
              </div>
              <div class="form-group">
                <label>Delivery Address</label>
                <input type="text" id="settings-address" class="form-control" value="${user.address || ''}">
              </div>
            </div>
            <button type="submit" class="checkout-btn" style="width: auto; padding: 12px 36px; margin: 0;">Save Changes</button>
          </form>
        </div>
      </main>
    </div>
  `;
  
  lucide.createIcons();
}

window.setProfileTab = function(tabName) {
  state.profileActiveTab = tabName;
  const viewContainer = document.getElementById("app-view");
  renderProfilePage(viewContainer);
};

window.saveProfileSettings = function(event) {
  event.preventDefault();
  const nameVal = document.getElementById("settings-name").value.trim();
  const phoneVal = document.getElementById("settings-phone").value.trim();
  const addressVal = document.getElementById("settings-address").value.trim();
  
  if (!nameVal) {
    showToast("Name cannot be blank", "error");
    return;
  }
  
  const sessionUser = db.getCurrentSession();
  const users = db.getUsers();
  const u = users.find(userObj => userObj.email === sessionUser.email);
  
  if (u) {
    u.name = nameVal;
    u.phone = phoneVal;
    u.address = addressVal;
    db.saveUsers(users);
    db.setCurrentSession(u);
    showToast("Profile settings updated!", "success");
  }
};

window.reorderItems = function(orderId) {
  const allOrders = db.getOrders();
  const o = allOrders.find(order => order.id === orderId);
  if (o) {
    o.items.forEach(item => {
      addToCartDirect(item.productId, item.quantity);
    });
    showToast("All items from this order added to your cart!", "success");
    openCartDrawer();
  }
};

// 5. Admin Dashboard
function renderAdminPage(container) {
  const sessionUser = db.getCurrentSession();
  if (!sessionUser || sessionUser.role !== 'admin') {
    container.innerHTML = `
      <div class="container" style="text-align: center; padding: 80px 24px;">
        <i data-lucide="shield-alert" style="width: 64px; height: 64px; color: var(--accent-red); margin-bottom: 24px;"></i>
        <h2 style="font-size: 2rem; margin-bottom: 12px;">Admin Area Access</h2>
        <p style="color: var(--text-muted); margin-bottom: 24px;">Please login with an administrator account to view the Store Manager dashboard.</p>
        <button class="hero-btn" style="display: inline-flex;" onclick="openAuthModal('login')">Sign In Admin</button>
      </div>
    `;
    lucide.createIcons();
    return;
  }
  
  const products = db.getProducts();
  const orders = db.getOrders();
  
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const outOfStockCount = products.filter(p => p.inventory === 0).length;
  const activeOrdersCount = orders.filter(o => o.status !== "Delivered").length;
  
  const categorySales = { produce: 0, bakery: 0, dairy: 0, meat: 0, pantry: 0 };
  orders.forEach(o => {
    o.items.forEach(i => {
      const p = products.find(prod => prod.id === i.productId);
      if (p && categorySales[p.category] !== undefined) {
        categorySales[p.category] += i.price * i.quantity;
      }
    });
  });
  
  const adminTab = state.adminActiveTab || "orders";
  
  container.innerHTML = `
    <div class="container admin-container">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2 style="font-weight: 800; font-size: 2rem;">Admin Dashboard</h2>
          <p style="color: var(--text-muted)">Welcome back, ${sessionUser.name}</p>
        </div>
        <button class="filter-btn-clear" style="width: auto; margin: 0; border-color: var(--accent-red); color: var(--accent-red);" onclick="handleLogout()">
          Log Out
        </button>
      </div>

      <section class="admin-stats-grid">
        <div class="stat-card">
          <div class="stat-icon-wrapper stat-icon-sales"><i data-lucide="dollar-sign"></i></div>
          <div class="stat-info"><span class="stat-val">$${totalSales.toFixed(2)}</span><span class="stat-lbl">Daily Sales</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrapper stat-icon-orders"><i data-lucide="shopping-cart"></i></div>
          <div class="stat-info"><span class="stat-val">${orders.length}</span><span class="stat-lbl">Total Orders</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrapper stat-icon-active"><i data-lucide="clock"></i></div>
          <div class="stat-info"><span class="stat-val">${activeOrdersCount}</span><span class="stat-lbl">Active Deliveries</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrapper stat-icon-stock"><i data-lucide="alert-triangle"></i></div>
          <div class="stat-info"><span class="stat-val">${outOfStockCount}</span><span class="stat-lbl">Out of Stock Items</span></div>
        </div>
      </section>

      <section class="admin-panels-row">
        <div class="admin-panel-card">
          <div class="panel-header">Sales by Category</div>
          <div class="analytics-chart">
            ${Object.keys(categorySales).map(cat => {
              const sales = categorySales[cat];
              const maxSales = Math.max(...Object.values(categorySales), 1);
              const heightPercent = Math.min((sales / maxSales) * 100, 100);
              return `
                <div class="chart-bar-col">
                  <div class="chart-bar ${heightPercent > 50 ? 'highlight' : ''}" style="height: ${heightPercent}%;" data-val="$${sales.toFixed(0)}"></div>
                  <span class="chart-label" style="text-transform: capitalize;">${cat}</span>
                </div>
              `;
            }).join("")}
          </div>
        </div>
        <div class="admin-panel-card">
          <div class="panel-header">Store Overview</div>
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.95rem;">
              <span>Total Product Catalog</span>
              <span style="font-weight: 700;">${products.length} Products</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.95rem;">
              <span>Low Stock Items (< 10)</span>
              <span style="font-weight: 700; color: var(--accent-orange);">${products.filter(p => p.inventory > 0 && p.inventory < 10).length} Items</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.95rem;">
              <span>Total Customers</span>
              <span style="font-weight: 700;">${db.getUsers().filter(u => u.role !== 'admin').length} Users</span>
            </div>
          </div>
        </div>
      </section>

      <section class="admin-panel-card" style="margin-bottom: 80px;">
        <div class="auth-tabs" style="margin-bottom: 24px;">
          <div class="auth-tab ${adminTab === 'orders' ? 'active' : ''}" onclick="setAdminTab('orders')">Order Management</div>
          <div class="auth-tab ${adminTab === 'products' ? 'active' : ''}" onclick="setAdminTab('products')">Inventory catalog</div>
        </div>

        ${adminTab === 'orders' ? `
          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Slot / Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${orders.map(o => `
                  <tr>
                    <td style="font-weight: 700;">${o.id}</td>
                    <td>${o.customerName}</td>
                    <td>${o.date}</td>
                    <td>$${o.total.toFixed(2)}</td>
                    <td><span style="font-size: 0.8rem; font-weight: 500;">${o.slot} (${o.type})</span></td>
                    <td>
                      <select class="admin-select-status status-${o.status.toLowerCase().replace(/\s/g, '')}" onchange="changeOrderStatus('${o.id}', this.value)">
                        <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
                        <option value="Preparing" ${o.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
                        <option value="Out for Delivery" ${o.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                        <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                      </select>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        ` : `
          <div class="admin-products-header">
            <h3 style="font-weight: 700;">Catalog List</h3>
            <button class="admin-btn-add" onclick="openAddProductModal()">
              <i data-lucide="plus"></i>
              Add New Product
            </button>
          </div>
          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Dietary</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${products.map(p => `
                  <tr>
                    <td>
                      <div class="admin-prod-cell">
                        <img class="admin-prod-img" src="${p.image}" alt="">
                        <div style="font-weight: 600;">${p.name}</div>
                      </div>
                    </td>
                    <td style="text-transform: capitalize;">${p.category}</td>
                    <td>
                      <input type="number" step="0.01" class="form-control" style="width: 80px; padding: 4px 8px;" value="${p.price}" onchange="updateProductPrice('${p.id}', this.value)">
                    </td>
                    <td>
                      <input type="number" class="form-control" style="width: 70px; padding: 4px 8px;" value="${p.inventory}" onchange="updateProductStock('${p.id}', this.value)">
                    </td>
                    <td>
                      <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">
                        ${p.dietary.length > 0 ? p.dietary.join(", ") : "None"}
                      </span>
                    </td>
                    <td>
                      <div class="admin-action-btn-row">
                        <button class="admin-action-btn delete" onclick="deleteProduct('${p.id}')">
                          <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        `}
      </section>
    </div>
  `;
  
  lucide.createIcons();
}

window.setAdminTab = function(tabName) {
  state.adminActiveTab = tabName;
  const viewContainer = document.getElementById("app-view");
  renderAdminPage(viewContainer);
};

window.changeOrderStatus = function(orderId, status) {
  const allOrders = db.getOrders();
  const o = allOrders.find(ord => ord.id === orderId);
  if (o) {
    o.status = status;
    db.saveOrders(allOrders);
    
    const users = db.getUsers();
    const customer = users.find(u => u.email === o.customerEmail);
    if (customer && customer.orders) {
      const customerOrder = customer.orders.find(ord => ord.id === orderId);
      if (customerOrder) customerOrder.status = status;
      db.saveUsers(users);
      
      const sessionUser = db.getCurrentSession();
      if (sessionUser && sessionUser.email === customer.email) {
        db.setCurrentSession(customer);
      }
    }
    
    showToast(`Order ${orderId} updated to ${status}`, "success");
    const viewContainer = document.getElementById("app-view");
    renderAdminPage(viewContainer);
  }
};

window.updateProductPrice = function(productId, priceVal) {
  const price = parseFloat(priceVal);
  if (isNaN(price) || price <= 0) {
    showToast("Invalid price value", "error");
    return;
  }
  const products = db.getProducts();
  const p = products.find(prod => prod.id === productId);
  if (p) {
    p.price = price;
    db.saveProducts(products);
    showToast(`Price updated for ${p.name}`, "success");
  }
};

window.updateProductStock = function(productId, stockVal) {
  const stock = parseInt(stockVal);
  if (isNaN(stock) || stock < 0) {
    showToast("Invalid stock value", "error");
    return;
  }
  const products = db.getProducts();
  const p = products.find(prod => prod.id === productId);
  if (p) {
    p.inventory = stock;
    db.saveProducts(products);
    showToast(`Stock updated for ${p.name}`, "success");
  }
};

window.deleteProduct = function(productId) {
  if (confirm("Are you sure you want to delete this product from catalog?")) {
    const products = db.getProducts();
    const updated = products.filter(p => p.id !== productId);
    db.saveProducts(updated);
    showToast("Product deleted successfully", "success");
    const viewContainer = document.getElementById("app-view");
    renderAdminPage(viewContainer);
  }
};

window.openAddProductModal = function() {
  const overlay = document.getElementById("modal-overlay");
  const modalContent = document.getElementById("modal-inner-content");
  
  modalContent.innerHTML = `
    <div class="admin-modal-grid">
      <h3 style="font-weight: 800; font-size: 1.5rem; border-bottom: 1px solid var(--neutral-divider); padding-bottom: 12px;">Add New Product</h3>
      <form id="admin-add-product-form" onsubmit="submitAddProduct(event)">
        <div class="form-grid">
          <div class="form-group span-2">
            <label>Product Name *</label>
            <input type="text" id="add-prod-name" class="form-control" required placeholder="e.g. Organic Strawberries">
          </div>
          <div class="form-group">
            <label>Category *</label>
            <select id="add-prod-category" class="form-control" required>
              <option value="produce">Fresh Produce</option>
              <option value="bakery">Bakery & Bread</option>
              <option value="dairy">Dairy & Eggs</option>
              <option value="meat">Meat & Seafood</option>
              <option value="pantry">Pantry & Snacks</option>
            </select>
          </div>
          <div class="form-group">
            <label>Price ($) *</label>
            <input type="number" step="0.01" id="add-prod-price" class="form-control" required placeholder="3.99">
          </div>
          <div class="form-group">
            <label>Unit Text *</label>
            <input type="text" id="add-prod-unit" class="form-control" required placeholder="e.g. lb, bunch, pack">
          </div>
          <div class="form-group">
            <label>Stock Level *</label>
            <input type="number" id="add-prod-stock" class="form-control" required placeholder="25">
          </div>
          <div class="form-group span-2">
            <label>Image URL (Optional)</label>
            <input type="url" id="add-prod-image" class="form-control" placeholder="https://images.unsplash.com/... or blank">
          </div>
          <div class="form-group span-2">
            <label>Dietary Preferences (Check all that apply)</label>
            <div style="display: flex; gap: 16px; margin-top: 6px;">
              <label style="display: flex; align-items: center; gap: 6px; font-size: 0.9rem;">
                <input type="checkbox" id="add-diet-organic" value="organic"> Organic
              </label>
              <label style="display: flex; align-items: center; gap: 6px; font-size: 0.9rem;">
                <input type="checkbox" id="add-diet-vegan" value="vegan"> Vegan
              </label>
              <label style="display: flex; align-items: center; gap: 6px; font-size: 0.9rem;">
                <input type="checkbox" id="add-diet-gf" value="gluten-free"> Gluten-Free
              </label>
            </div>
          </div>
          <div class="form-group span-2">
            <label>Description</label>
            <textarea id="add-prod-desc" class="form-control" style="height: 80px;" placeholder="Details about this product..."></textarea>
          </div>
        </div>
        <button type="submit" class="checkout-btn" style="width: auto; padding: 12px 36px; margin-top: 24px;">Add to Catalog</button>
      </form>
    </div>
  `;
  overlay.classList.add("active");
  lucide.createIcons();
};

window.submitAddProduct = function(event) {
  event.preventDefault();
  const name = document.getElementById("add-prod-name").value.trim();
  const category = document.getElementById("add-prod-category").value;
  const price = parseFloat(document.getElementById("add-prod-price").value);
  const unit = document.getElementById("add-prod-unit").value.trim();
  const stock = parseInt(document.getElementById("add-prod-stock").value);
  let image = document.getElementById("add-prod-image").value.trim();
  const desc = document.getElementById("add-prod-desc").value.trim();
  
  if (!image) {
    if (category === "produce") image = "assets/cat_produce.png";
    else if (category === "bakery") image = "assets/cat_bakery.png";
    else if (category === "dairy") image = "assets/cat_dairy.png";
    else if (category === "meat") image = "assets/cat_meat.png";
    else image = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80";
  }
  
  const dietary = [];
  if (document.getElementById("add-diet-organic").checked) dietary.push("organic");
  if (document.getElementById("add-diet-vegan").checked) dietary.push("vegan");
  if (document.getElementById("add-diet-gf").checked) dietary.push("gluten-free");
  
  const products = db.getProducts();
  const newId = "prod-" + (products.length + 1);
  const newProductObj = {
    id: newId,
    name: name,
    category: category,
    price: price,
    unit: unit,
    pricePerUnit: `$${price} / ${unit}`,
    avgWeight: `1 ${unit}`,
    image: image,
    description: desc || "Fresh quality items sourced locally.",
    nutrition: { calories: 0, fat: "0g", carbs: "0g", protein: "0g", fiber: "0g" },
    expiration: "Consume within 5-7 days of delivery.",
    inventory: stock,
    dietary: dietary,
    rating: 5.0,
    reviewsCount: 0,
    reviews: [],
    weeklyDeal: false,
    bestSeller: false
  };
  
  products.push(newProductObj);
  db.saveProducts(products);
  closeModal();
  showToast(`${name} added to catalog successfully!`, "success");
  const viewContainer = document.getElementById("app-view");
  renderAdminPage(viewContainer);
};

// --- PRODUCT CARD RENDERER ---
function renderProductCardHTML(p) {
  const isFav = state.favorites.includes(p.id);
  const isOutOfStock = p.inventory === 0;
  const isLowStock = p.inventory > 0 && p.inventory <= 5;
  
  return `
    <div class="product-card">
      <div class="card-badges">
        ${p.weeklyDeal ? `<span class="badge-tag badge-deal">Weekly Deal</span>` : ""}
        ${isOutOfStock ? `<span class="badge-tag badge-stock-out">Out of Stock</span>` : ""}
        ${isLowStock ? `<span class="badge-tag badge-stock-low">Only ${p.inventory} Left</span>` : ""}
      </div>
      <button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite('${p.id}', this)" aria-label="Favorite">
        <i data-lucide="heart" style="width: 18px; height: 18px; ${isFav ? 'fill: var(--accent-red); color: var(--accent-red);' : ''}"></i>
      </button>
      <div class="product-img-wrapper" onclick="openProductDetail('${p.id}')">
        <img class="product-img" src="${p.image}" alt="${p.name}" loading="lazy">
      </div>
      <div class="product-info">
        <span class="product-category">${p.category}</span>
        <h3 class="product-name" onclick="openProductDetail('${p.id}')">${p.name}</h3>
        <div class="product-rating">
          <i data-lucide="star" class="star-icon" style="width: 14px; height: 14px;"></i>
          <span class="rating-value">${p.rating.toFixed(1)}</span>
          <span class="rating-count">(${p.reviewsCount})</span>
        </div>
        <div class="product-weight">${p.avgWeight}</div>
        <div class="product-footer">
          <div class="product-price-box">
            ${p.originalPrice ? `<span class="price-strike">$${p.originalPrice.toFixed(2)}</span>` : ""}
            <span class="price-current">$${p.price.toFixed(2)}</span>
            <span class="price-unit">${p.pricePerUnit}</span>
          </div>
          <button class="add-cart-btn" onclick="addToCartDirect('${p.id}', 1)" ${isOutOfStock ? 'disabled' : ''} aria-label="Add to Cart">
            <i data-lucide="shopping-cart" style="width: 18px; height: 18px;"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

// --- PRODUCT DETAIL PAGE MODAL ---
window.openProductDetail = function(productId) {
  const p = db.getProducts().find(prod => prod.id === productId);
  if (!p) return;
  const overlay = document.getElementById("modal-overlay");
  const modalContent = document.getElementById("modal-inner-content");
  const isOutOfStock = p.inventory === 0;
  
  modalContent.innerHTML = `
    <div class="pdp-grid">
      <div class="pdp-gallery"><img class="pdp-main-img" src="${p.image}" alt="${p.name}"></div>
      <div class="pdp-info">
        <div class="pdp-dietary-badges">${p.dietary.map(d => `<span class="pdp-diet-badge">${d}</span>`).join("")}</div>
        <h1 class="pdp-title">${p.name}</h1>
        <div class="product-rating" style="margin-bottom: 20px;">
          <i data-lucide="star" class="star-icon" style="width: 18px; height: 18px;"></i>
          <span class="rating-value" style="font-size: 1rem;">${p.rating.toFixed(1)}</span>
          <span class="rating-count" style="font-size: 1rem;">(${p.reviewsCount} reviews)</span>
        </div>
        <div class="pdp-pricing-box"><span class="pdp-price">$${p.price.toFixed(2)}</span><span class="pdp-price-unit">/ ${p.pricePerUnit}</span></div>
        <p class="pdp-description">${p.description}</p>
        <div class="pdp-actions-row">
          <div class="quantity-selector">
            <button class="qty-btn" onclick="adjustPDPQty(-1)">-</button>
            <input type="text" class="qty-input" id="pdp-qty-input" value="1" readonly>
            <button class="qty-btn" onclick="adjustPDPQty(1)">+</button>
          </div>
          <button class="pdp-add-btn" id="pdp-add-btn" onclick="addPDPAmountToCart('${p.id}')" ${isOutOfStock ? 'disabled' : ''}>
            <i data-lucide="shopping-cart"></i>
            ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
        <div class="pdp-details-accordion">
          <div class="accordion-tab" id="accordion-nutr-tab">
            <div class="accordion-header" onclick="toggleAccordion('nutr')"><span>Nutritional Facts</span><i data-lucide="chevron-down" style="width: 16px; height: 16px;"></i></div>
            <div class="accordion-content">
              <div class="nutrition-grid">
                <div class="nutrition-item"><span class="nutrition-val">${p.nutrition.calories}</span><span class="nutrition-lbl">Calories</span></div>
                <div class="nutrition-item"><span class="nutrition-val">${p.nutrition.fat}</span><span class="nutrition-lbl">Fat</span></div>
                <div class="nutrition-item"><span class="nutrition-val">${p.nutrition.carbs}</span><span class="nutrition-lbl">Carbs</span></div>
                <div class="nutrition-item"><span class="nutrition-val">${p.nutrition.protein}</span><span class="nutrition-lbl">Protein</span></div>
                <div class="nutrition-item"><span class="nutrition-val">${p.nutrition.fiber}</span><span class="nutrition-lbl">Fiber</span></div>
              </div>
            </div>
          </div>
          <div class="accordion-tab" id="accordion-guide-tab">
            <div class="accordion-header" onclick="toggleAccordion('guide')"><span>Expiration & Storage</span><i data-lucide="chevron-down" style="width: 16px; height: 16px;"></i></div>
            <div class="accordion-content" style="padding: 10px 0;">${p.expiration}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="pdp-reviews-section">
      <h3 style="font-weight: 800; margin-bottom: 24px;">Customer Reviews</h3>
      <div class="review-list">
        ${p.reviews.length === 0 ? '<div style="text-align: center; padding: 24px; color: var(--text-muted);">No reviews yet.</div>' : p.reviews.map(r => `
          <div class="review-card">
            <div class="review-header"><span class="review-author">${r.name}</span><span class="review-date">${r.date}</span></div>
            <p class="review-text">${r.comment}</p>
          </div>
        `).join("")}
      </div>
    </div>
  `;
  overlay.classList.add("active");
  lucide.createIcons();
};

window.toggleAccordion = function(tab) {
  const activeTabEl = document.getElementById(tab === 'nutr' ? 'accordion-nutr-tab' : 'accordion-guide-tab');
  if (activeTabEl) activeTabEl.classList.toggle("active");
};

let pdpQuantity = 1;
window.adjustPDPQty = function(val) {
  pdpQuantity = Math.max(1, pdpQuantity + val);
  const qtyInput = document.getElementById("pdp-qty-input");
  if (qtyInput) qtyInput.value = pdpQuantity;
};

window.addPDPAmountToCart = function(productId) {
  addToCartDirect(productId, pdpQuantity);
  pdpQuantity = 1;
  closeModal();
};

window.closeModal = function() {
  document.getElementById("modal-overlay").classList.remove("active");
};

// --- CART & DRAWER ACTIONS ---
window.openCartDrawer = function() {
  const overlay = document.getElementById("cart-drawer-overlay");
  if (overlay) {
    overlay.style.display = "block";
    setTimeout(() => overlay.classList.add("active"), 10);
    renderMiniCart();
  }
};

window.closeCartDrawer = function() {
  const overlay = document.getElementById("cart-drawer-overlay");
  if (overlay) {
    overlay.classList.remove("active");
    setTimeout(() => overlay.style.display = "none", 300);
  }
};

function renderMiniCart() {
  const container = document.getElementById("cart-items-list");
  const subtotalEl = document.getElementById("cart-subtotal");
  const totalEl = document.getElementById("cart-total");
  const products = db.getProducts();
  
  if (!container) return;
  if (state.cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-state">
        <i class="cart-empty-icon" data-lucide="shopping-cart" style="width: 48px; height: 48px;"></i>
        <p style="font-weight: 600;">Your cart is empty</p>
      </div>
    `;
    subtotalEl.innerText = "$0.00";
    totalEl.innerText = "$0.00";
    lucide.createIcons();
    return;
  }
  
  let subtotal = 0;
  container.innerHTML = state.cart.map(item => {
    const p = products.find(prod => prod.id === item.productId);
    if (!p) return "";
    subtotal += p.price * item.quantity;
    return `
      <div class="cart-item">
        <img class="cart-item-img" src="${p.image}" alt="">
        <div class="cart-item-details">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">$${p.price.toFixed(2)}</div>
          <div class="cart-item-controls">
            <div class="cart-qty">
              <button class="cart-qty-btn" onclick="updateCartQtyDirect('${p.id}', -1)">-</button>
              <div class="cart-qty-val">${item.quantity}</div>
              <button class="cart-qty-btn" onclick="updateCartQtyDirect('${p.id}', 1)">+</button>
            </div>
            <button class="cart-item-remove" onclick="removeCartItemDirect('${p.id}')"><i data-lucide="trash-2" style="width: 16px; height: 16px;"></i></button>
          </div>
        </div>
      </div>
    `;
  }).join("");
  
  subtotalEl.innerText = `$${subtotal.toFixed(2)}`;
  const delivery = subtotal >= 35 ? 0 : 4.99;
  totalEl.innerText = `$${(subtotal + delivery).toFixed(2)}`;
  lucide.createIcons();
}

window.addToCartDirect = function(productId, qty) {
  const products = db.getProducts();
  const p = products.find(prod => prod.id === productId);
  if (!p) return;
  const existing = state.cart.find(item => item.productId === productId);
  const currentQty = existing ? existing.quantity : 0;
  const targetQty = currentQty + qty;
  
  if (p.inventory < targetQty) {
    showToast(`Sorry, only ${p.inventory} units available.`, "error");
    return;
  }
  if (existing) {
    existing.quantity = targetQty;
  } else {
    state.cart.push({ productId, quantity: qty });
  }
  saveCartState();
  updateCartBadge();
  showToast(`${p.name} added to cart!`, "success");
  if (window.location.hash.startsWith("#/shop")) applyFiltersAndRender();
  openCartDrawer();
};

window.updateCartQtyDirect = function(productId, delta) {
  const existing = state.cart.find(item => item.productId === productId);
  if (!existing) return;
  const p = db.getProducts().find(prod => prod.id === productId);
  const targetQty = existing.quantity + delta;
  
  if (targetQty <= 0) {
    state.cart = state.cart.filter(item => item.productId !== productId);
  } else {
    if (p.inventory < targetQty) {
      showToast(`Sorry, only ${p.inventory} units in stock.`, "error");
      return;
    }
    existing.quantity = targetQty;
  }
  saveCartState();
  updateCartBadge();
  renderMiniCart();
  if (window.location.hash.startsWith("#/checkout")) renderCheckoutPage(document.getElementById("app-view"));
};

window.removeCartItemDirect = function(productId) {
  state.cart = state.cart.filter(item => item.productId !== productId);
  saveCartState();
  updateCartBadge();
  renderMiniCart();
  if (window.location.hash.startsWith("#/checkout")) renderCheckoutPage(document.getElementById("app-view"));
};

function loadCartState() {
  const stored = localStorage.getItem("fc_cart");
  state.cart = stored ? JSON.parse(stored) : [];
  updateCartBadge();
}

function saveCartState() {
  localStorage.setItem("fc_cart", JSON.stringify(state.cart));
}

function updateCartBadge() {
  const badge = document.getElementById("cart-badge-count");
  if (badge) {
    const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.innerText = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }
}

// --- FAVORITES ACTIONS ---
window.toggleFavorite = function(productId, btnEl) {
  const idx = state.favorites.indexOf(productId);
  if (idx === -1) {
    state.favorites.push(productId);
    showToast("Added to reorder list!", "success");
    if (btnEl) btnEl.classList.add("active");
  } else {
    state.favorites.splice(idx, 1);
    showToast("Removed from reorder list", "success");
    if (btnEl) btnEl.classList.remove("active");
  }
  saveFavoritesState();
  
  const sessionUser = db.getCurrentSession();
  if (sessionUser) {
    const users = db.getUsers();
    const u = users.find(userObj => userObj.email === sessionUser.email);
    if (u) {
      u.favorites = [...state.favorites];
      db.saveUsers(users);
      db.setCurrentSession(u);
    }
  }
  if (window.location.hash.startsWith("#/profile")) renderProfilePage(document.getElementById("app-view"));
  if (window.location.hash.startsWith("#/shop")) applyFiltersAndRender();
};

function loadFavoritesState() {
  const sessionUser = db.getCurrentSession();
  if (sessionUser && sessionUser.favorites) {
    state.favorites = [...sessionUser.favorites];
  } else {
    const stored = localStorage.getItem("fc_favs");
    state.favorites = stored ? JSON.parse(stored) : [];
  }
}

function saveFavoritesState() {
  localStorage.setItem("fc_favs", JSON.stringify(state.favorites));
}

// --- SEARCH & AUTO SUGGESTIONS ---
function setupGlobalListeners() {
  const searchInput = document.getElementById("search-input");
  const suggestionsBox = document.getElementById("search-suggestions");
  if (searchInput && suggestionsBox) {
    searchInput.addEventListener("keyup", () => handleSearchInput(searchInput.value, suggestionsBox));
    document.addEventListener("click", (e) => {
      if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) closeSearchSuggestions();
    });
  }
}

function handleSearchInput(query, boxElement) {
  if (!query.trim()) {
    boxElement.style.display = "none";
    return;
  }
  const products = db.getProducts();
  const matches = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase().trim())).slice(0, 5);
  
  if (matches.length === 0) {
    boxElement.innerHTML = '<div style="padding: 12px; font-size: 0.9rem; text-align: center; color: var(--text-muted);">No items found</div>';
    boxElement.style.display = "block";
    return;
  }
  boxElement.innerHTML = matches.map(p => `
    <div class="suggestion-item" onclick="selectSearchSuggestion('${p.id}')">
      <img class="suggestion-img" src="${p.image}" alt="">
      <div class="suggestion-info">
        <span class="suggestion-name">${p.name}</span>
        <span class="suggestion-price">$${p.price.toFixed(2)}</span>
      </div>
    </div>
  `).join("");
  boxElement.style.display = "block";
}

window.selectSearchSuggestion = function(productId) {
  const searchInput = document.getElementById("search-input");
  if (searchInput) searchInput.value = "";
  closeSearchSuggestions();
  openProductDetail(productId);
};

function closeSearchSuggestions() {
  const suggestionsBox = document.getElementById("search-suggestions");
  if (suggestionsBox) {
    suggestionsBox.style.display = "none";
    suggestionsBox.innerHTML = "";
  }
}

window.handleSearchSubmit = function(event) {
  event.preventDefault();
  const searchInput = document.getElementById("search-input");
  if (searchInput && searchInput.value.trim()) {
    state.activeFilters.search = searchInput.value.trim();
    closeSearchSuggestions();
    window.location.hash = `#/shop?search=${encodeURIComponent(state.activeFilters.search)}`;
    if (window.location.hash.startsWith("#/shop")) applyFiltersAndRender();
  }
};

// --- AUTHENTICATION ---
window.openAuthModal = function(mode) {
  const overlay = document.getElementById("modal-overlay");
  const modalContent = document.getElementById("modal-inner-content");
  modalContent.innerHTML = `
    <div class="auth-container">
      <div class="auth-logo"><i data-lucide="shopping-cart" class="logo-leaf"></i>FreshCart Market</div>
      <div class="auth-tabs">
        <div class="auth-tab ${mode === 'login' ? 'active' : ''}" onclick="toggleAuthTab('login')">Sign In</div>
        <div class="auth-tab ${mode === 'signup' ? 'active' : ''}" onclick="toggleAuthTab('signup')">Sign Up</div>
      </div>
      <form id="auth-login-form" class="auth-form ${mode === 'login' ? 'active' : ''}" onsubmit="handleAuthSubmit(event, 'login')">
        <div class="form-group" style="margin-bottom: 16px;"><label>Email Address</label><input type="email" id="login-email" class="form-control" placeholder="customer@freshcart.com" required></div>
        <div class="form-group" style="margin-bottom: 20px;"><label>Password</label><input type="password" id="login-password" class="form-control" placeholder="password123" required></div>
        <button type="submit" class="auth-btn">Sign In</button>
      </form>
    </div>
  `;
  overlay.classList.add("active");
  lucide.createIcons();
};

window.toggleAuthTab = function(mode) {
  openAuthModal(mode);
};

window.handleAuthSubmit = function(event, type) {
  event.preventDefault();
  if (type === 'login') {
    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const pass = document.getElementById("login-password").value;
    const users = db.getUsers();
    const match = users.find(u => u.email === email && u.password === pass);
    
    if (match) {
      db.setCurrentSession(match);
      closeModal();
      showToast(`Welcome back, ${match.name}!`, "success");
      loadFavoritesState();
      window.location.hash = match.role === 'admin' ? "#/admin" : "#/profile";
    } else {
      showToast("Invalid email or password", "error");
    }
  }
};

window.handleLogout = function() {
  db.setCurrentSession(null);
  state.favorites = [];
  saveFavoritesState();
  showToast("Logged out successfully", "success");
  window.location.hash = "#/";
};

function syncAuthUI() {
  const user = db.getCurrentSession();
  const headerBtn = document.getElementById("header-auth-trigger");
  if (!headerBtn) return;
  
  if (user) {
    headerBtn.innerHTML = `
      <div class="profile-trigger" onclick="window.location.hash = '#/profile'">
        <div class="avatar">${user.name.charAt(0)}</div>
        <span class="profile-name">${user.name.split(" ")[0]}</span>
      </div>
    `;
  } else {
    headerBtn.innerHTML = `<button class="profile-trigger" onclick="openAuthModal('login')" style="background-color: var(--primary); color: white; padding: 10px 20px;"><span style="font-weight: 700;">Sign In</span></button>`;
  }
}

window.showToast = function(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}" style="width: 20px; height: 20px;"></i><span>${message}</span>`;
  container.appendChild(toast);
  lucide.createIcons();
  setTimeout(() => {
    toast.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};
