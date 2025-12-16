// src/App.jsx - COMPLETE Engrossery APPLICATION WITH SELLER DASHBOARD & ROLE-BASED AUTH
import React, { useState, useEffect, createContext, useContext } from 'react';

import { 
  ShoppingCart, Search, User, Star, ArrowRight, Truck, Leaf, 
  DollarSign, Heart, X, Menu, Plus, Minus,
  Facebook, Instagram, Twitter, Youtube,  Mail, Shield  
} from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';


// ============================================
// API CONFIGURATION
// ============================================
//const API_URL = 'http://localhost:5000/api';
const API_URL = 'https://engrossery.onrender.com/api';


const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

// ============================================
// CONTEXT FOR GLOBAL STATE
// ============================================
const AppContext = createContext();
const useApp = () => useContext(AppContext);

// ============================================
// DEMO DATA (Fallback when backend is unavailable)
// ============================================
function getDemoProducts() {
  return [
    { id: 1, name: 'Brown Bread 400g', category: 'Bakery', price: 35, originalPrice: 40, rating: 4, icon: '🍞', reviewCount: 4, imageUrl: "/bread.png" },
    { id: 2, name: 'Organic Quinoa 500g', category: 'Grains', price: 420, originalPrice: 450, rating: 4, icon: '🌾', reviewCount: 4, imageUrl: "/quinoa.png"},
    { id: 3, name: 'Carrot 500g', category: 'Vegetables', price: 44, originalPrice: 50, rating: 4, icon: '🥕', reviewCount: 4,imageUrl: "/carrot.png" },
    { id: 4, name: 'Apple 1 kg', category: 'Fruits', price: 90, originalPrice: 100, rating: 4, icon: '🍎', reviewCount: 4, imageUrl: "/apple.png" },
    { id: 5, name: 'Cheese 200g', category: 'Dairy', price: 130, originalPrice: 140, rating: 4, icon: '🧀', reviewCount: 4, imageUrl: "/cheese.png" },
    { id: 6, name: 'Organic Rice 1kg', category: 'Grains', price: 180, originalPrice: 200, rating: 5, icon: '🌾', reviewCount: 12, imageUrl: "/organicrice.png" },
    { id: 7, name: 'Fresh Mango 500g', category: 'Fruits', price: 120, originalPrice: 150, rating: 5, icon: '🥭', reviewCount: 8, imageUrl: "/mango.png" },
    { id: 8, name: 'Green Grapes 500g', category: 'Fruits', price: 85, originalPrice: 95, rating: 4, icon: '🍇', reviewCount: 6, imageUrl: "/grapes.png"},
    { id: 9, name: 'Red Onion 500g', category: 'Vegetables', price: 30, originalPrice: 35, rating: 4, icon: '🧅', reviewCount: 5, imageUrl: "/onion.png" },
    { id: 10, name: 'Soft Drink 2L', category: 'Drinks', price: 60, originalPrice: 70, rating: 4, icon: '🥤', reviewCount: 10, imageUrl: "/softdrink.png" },
  ];
}

function getDemoCategories() {
  return [
    { id: 1, name: 'Organic veggies', icon: '🥬', color: 'bg-yellow-50' },
    { id: 2, name: 'Fresh Fruits', icon: '🍎', color: 'bg-pink-50' },
    { id: 3, name: 'Cold Drinks', icon: '🥤', color: 'bg-green-50' },
    { id: 4, name: 'Instant Food', icon: '🍜', color: 'bg-blue-50' },
    { id: 5, name: 'Dairy Products', icon: '🥛', color: 'bg-orange-50' },
    { id: 6, name: 'Bakery & Breads', icon: '🍞', color: 'bg-blue-50' },
    { id: 7, name: 'Grains & Cereals', icon: '🌾', color: 'bg-purple-50' },
  ];
}

// ============================================
// MAIN APP PROVIDER
// ============================================
function AppProvider({ children }) {
  // Navigation State
  const [currentView, setCurrentView] = useState('home');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [exploreDeals, setExploreDeals] = useState(false);
  
  // Auth State
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  
  // Products State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Cart State
  const [cart, setCart] = useState([]);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  
  // Order State
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash On Delivery');

  
  // ============================================
  // LOAD USER & CART FROM LOCALSTORAGE
  // ============================================
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedCart = localStorage.getItem('cart');
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
    
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem('cart');
      }
    }
    
    fetchProducts();
    // categories are static for now
    setCategories(getDemoCategories());
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // ============================================
  // API CALLS
  // ============================================
  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Backend returns ONLY DB products
      const response = await api.get("/products");
      const dbProducts = response.data.map((p) => ({
        ...p,
        id: p._id,                     // normalize id for UI
        icon: p.imageUrl ? null : "🛒",
      }));

      //const demoProducts = getDemoProducts();
      const demoProducts = getDemoProducts().map(item => ({
            ...item,
            inStock: true,       // default stock for demo products
            source: "demo"
          }));


      // Filter out DB products that already exist in demo list (based on name)
      const newProductsOnly = dbProducts.filter(
        (dbp) =>
          !demoProducts.some(
            (demo) =>
              demo.name.trim().toLowerCase() === dbp.name.trim().toLowerCase()
          )
      );

      // Merge: Demo products first → then only truly NEW admin products
      const mergedProducts = [...demoProducts, ...newProductsOnly];

      setProducts(mergedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
      setProducts(getDemoProducts());
    } finally {
      setLoading(false);
    }
  };

  // Login
  const handleLogin = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
      setShowLoginModal(false);
      
      // Auto-redirect based on role
      if (userData?.role === 'admin') {
        setCurrentView('seller-dashboard');
      } else {
        setCurrentView('home');
      }

      toast.success('Login successful!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  // Signup (register)
  const handleSignup = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
      setShowSignupModal(false);
      
      // Auto-redirect based on role
      if (userData?.role === 'admin') {
        setCurrentView('seller-dashboard');
      } else {
        setCurrentView('home');
      }

      toast.success('Account created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentView('home');
    toast.success('Logged out successfully');
  };

  // ============================================
  // CART FUNCTIONS
  // ============================================
  const addToCart = (product) => {

  // ❗ Show message & block adding
  if (product.inStock === false) {
    toast.error("Out of stock!");
    return;
  }

  setCart(prev => {
    const existing = prev.find(item => item.id === product.id);
    if (existing) {
      return prev.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }
    return [...prev, { ...product, quantity: 1 }];
  });
  
  toast.success('Added to cart!');
};


  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    toast.success('Removed from cart');
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTax = () => {
    return getCartTotal() * 0.02;
  };

  const getFinalTotal = () => {
    return getCartTotal() + getTax();
  };

  // ============================================
  // ORDER FUNCTIONS
  // ============================================
  const placeOrder = async () => {
    if (!user) {
      toast.error('Please login to place order');
      setShowLoginModal(true);
      return;
    }

    if (!deliveryAddress) {
      toast.error('Please enter delivery address');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      const orderData = {
        items: cart.map(item => ({
          productId: item._id || item.id,
          name: item.name, 
          quantity: item.quantity,
          price: item.price
        })),
        deliveryAddress,
        paymentMethod,
        totalAmount: getFinalTotal(),
      };

      await api.post('/orders', orderData);
      
      toast.success('Order placed successfully!');
      clearCart();
      setCurrentView('home');
      setShowCartSidebar(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
  };

  // ============================================
  // SEARCH & FILTER
  // ============================================
const getFilteredProducts = () => {
  let filtered = [...products];

  if (selectedCategory !== 'all') {
    filtered = filtered.filter(
      (p) =>
        p.category &&
        p.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase()
    );
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
    );
  }

  // ⭐ SORT DISCOUNT ITEMS FIRST WHEN "Explore deals" IS CLICKED
  if (exploreDeals) {
    filtered.sort((a, b) => {
      const discA = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) : 0;
      const discB = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) : 0;
      return discB - discA;
    });
  }

  return filtered;
};

  const value = {
    currentView, setCurrentView,
    showMobileMenu, setShowMobileMenu,
    user, handleLogin, handleSignup, handleLogout,
    showLoginModal, setShowLoginModal,
    showSignupModal, setShowSignupModal,
    products, categories, selectedCategory, setSelectedCategory,
    searchQuery, setSearchQuery,
    loading,
    cart, addToCart, removeFromCart, updateQuantity, clearCart,
    getCartTotal, getCartCount, getTax, getFinalTotal,
    showCartSidebar, setShowCartSidebar,
    deliveryAddress, setDeliveryAddress,
    paymentMethod, setPaymentMethod,
    placeOrder,
    getFilteredProducts,
    exploreDeals, setExploreDeals,
    user, setUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ============================================
// NAVBAR COMPONENT
// ============================================
function Navbar() {
  const { 
    setCurrentView, user, handleLogout, 
    setShowLoginModal, getCartCount, setShowCartSidebar, 
    searchQuery, setSearchQuery 
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const closeMenu = () => setShowUserMenu(false);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  const handleUserMenuToggle = (e) => {
    e.stopPropagation(); // prevents outside click trigger
    setShowUserMenu(prev => !prev);
  };

  const handleSellerClick = () => {
    if (!user) {
      toast.error("Please login as admin to access Seller Dashboard");
      setShowLoginModal(true);
      return;
    }
    if (user.role !== "admin") {
      toast.error("Only admin can access Seller Dashboard");
      return;
    }
    setCurrentView("seller-dashboard");
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">

          {/* Logo */}
          <button 
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2"
          >
            <span className="text-2xl font-bold text-emerald-500">EN</span>
            <span className="text-2xl font-bold text-slate-700">GROSSERY</span>
          </button>

          {/* Links */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <button onClick={() => setCurrentView('home')} className="hover:text-emerald-500">Home</button>
            <button onClick={() => setCurrentView('products')} className="hover:text-emerald-500">All Products</button>
            <button onClick={handleSellerClick} className="text-xs text-gray-500 hover:text-emerald-500">
              Seller Dashboard
            </button>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-64">
           <input type="text"
                        placeholder="Search products"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);

                          // ⭐ Automatically switch to Products page when typing
                          if (e.target.value.trim() !== "") {
                            setCurrentView("products");
                          }
                        }}
                        className="bg-transparent outline-none w-full text-sm"
                      />

            <Search size={18} className="text-gray-500" />
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <button 
              onClick={() => setShowCartSidebar(true)}
              className="relative"
            >
              <ShoppingCart size={24} className="text-slate-700" />
              {getCartCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartCount()}
                </span>
              )}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="relative" onClick={e => e.stopPropagation()}>
                <button
                  onClick={handleUserMenuToggle}
                  className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-full hover:bg-emerald-600"
                >
                  <User size={18} />
                  <span className="hidden md:inline">{user.name}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <button 
                        className="w-full px-4 py-2 text-left hover:bg-gray-100"
                        onClick={() => {
                          setCurrentView('profile');
                          setShowUserMenu(false);
                        }}
                      >
                        Profile
                      </button>

                      <button 
                        className="w-full px-4 py-2 text-left hover:bg-gray-100"
                        onClick={() => {
                          setCurrentView('my-orders');
                          setShowUserMenu(false);
                        }}
                      >
                        Orders
                      </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 text-red-500"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-emerald-500 text-white px-6 py-2 rounded-full hover:bg-emerald-600 transition text-sm"
              >
                Login
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-4 flex items-center bg-gray-100 rounded-full px-4 py-2">
          <input
            type="text"
            placeholder="Search products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none w-full text-sm"
          />
          <Search size={18} className="text-gray-500" />
        </div>
      </div>
    </nav>
  );
}


// ============================================
// HERO SECTION
// ============================================
function HeroSection() {
  //const { setCurrentView } = useApp();
  const { 
  setCurrentView, 
  setExploreDeals, 
  setSelectedCategory 
} = useApp();


  return (
    <section className="bg-gradient-to-r from-emerald-50 to-teal-50 py-20">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h1 className="text-5xl font-bold text-slate-800 leading-tight">
            Freshness You Can Trust, Savings You will Love!
          </h1>
          <p className="text-lg text-gray-600">
            Get farm-fresh groceries delivered in under 30 minutes. Quality products at unbeatable prices.
          </p>
          <div className="flex gap-4">
            <button 
            onClick={() => {
              setExploreDeals(false);
              setSelectedCategory('all');
              setCurrentView('products');
            }}
            className="bg-emerald-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition"
          >
            Shop now
          </button>

          <button 
            onClick={() => {
              setExploreDeals(true);
              setSelectedCategory('all');
              setCurrentView('products');
            }}
            className="border-2 border-emerald-500 text-emerald-500 px-8 py-3 rounded-lg font-semibold hover:bg-emerald-500 hover:text-white transition flex items-center gap-2"
          >
            Explore deals <ArrowRight size={20} />
          </button>

          </div>
        </div>
        <div className="relative">
          <div className="text-9xl">🥗</div>
          <div className="absolute bottom-8 left-8 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3">
            <div className="bg-emerald-100 p-3 rounded-lg text-3xl">🚚</div>
            <div>
              <p className="text-sm text-gray-600">Fast Delivery</p>
              <p className="font-bold text-slate-800">In 30 Min</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// CATEGORY GRID
// ============================================
function CategoryGrid() {
  //const { categories, setSelectedCategory, setCurrentView } = useApp();
  const { 
  categories, 
  setSelectedCategory, 
  setCurrentView,
  setExploreDeals 
} = useApp();


  const displayCategories = categories.length > 0 ? categories : getDemoCategories();

  const categoryMap = {
  "Organic veggies": "Vegetables",
  "Fresh Fruits": "Fruits",
  "Cold Drinks": "Drinks",
  "Instant Food": "Instant Food",
  "Dairy Products": "Dairy",
  "Bakery & Breads": "Bakery",
  "Grains & Cereals": "Grains",
};
const handleCategoryClick = (categoryName) => {
  const mapped = categoryMap[categoryName] || categoryName;
  setExploreDeals(false); // ⭐ RESET deals sorting when using category filter
  setSelectedCategory(mapped.toLowerCase());
  setCurrentView('products');
};



  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-800 mb-8">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {displayCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.name)}
              className={`${cat.color} rounded-xl p-6 text-center cursor-pointer hover:shadow-lg transition`}
            >
              <div className="text-5xl mb-2">{cat.icon}</div>
              <p className="font-semibold text-sm text-slate-700">{cat.name}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// PRODUCT CARD
// ============================================
function ProductCard({ product }) {
  const { cart, addToCart, updateQuantity, removeFromCart } = useApp();

  const cartItem = cart.find((item) => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    addToCart(product);
  };

  const handleIncrease = () => {
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity <= 1) {
      removeFromCart(product.id);
    } else {
      updateQuantity(product.id, quantity - 1);
    }
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group">
      <div className="relative bg-gray-50 h-48 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-7xl">{product.icon || "🛒"}</span>
        )}

        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {discount}% OFF
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <p className="text-xs text-gray-500 uppercase">{product.category}</p>
        <h3 className="font-semibold text-slate-700 line-clamp-2 h-12">{product.name}</h3>

        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={
                i < (product.rating || 4)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">({product.reviewCount || 4})</span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-2xl font-bold text-emerald-500">${product.price}</p>
            {product.originalPrice && (
              <p className="text-sm text-gray-400 line-through">${product.originalPrice}</p>
            )}
          </div>

          {/* Dynamic Buttons */}
          {quantity > 0 ? (
            <div className="flex items-center gap-2 bg-emerald-500 text-white rounded-lg px-3 py-1">
              <button onClick={handleDecrease} className="font-bold text-lg">−</button>
              <span className="text-sm font-semibold">{quantity}</span>
              <button onClick={handleIncrease} className="font-bold text-lg">+</button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg transition"
            >
              <ShoppingCart size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


// ============================================
// PRODUCTS SECTION
// ============================================
function ProductsSection() {
  const { getFilteredProducts, loading, selectedCategory, setSelectedCategory } = useApp();

  const filteredProducts = getFilteredProducts();

  return (
    <section className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800">
            {selectedCategory === 'all' ? 'All Products' : selectedCategory}
          </h2>
          <button
            onClick={() => setSelectedCategory('all')}
            className="text-emerald-500 hover:underline"
          >
            View All
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================
// WHY CHOOSE US
// ============================================

function ProfilePage() {
  const { user, setUser } = useApp();
  const [showModal, setShowModal] = useState(false);

  const handleSave = async (data) => {
    try {
      const res = await api.put("/user/update", data);

      // Update global user
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));

      toast.success("Profile updated!");
      setShowModal(false);
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Please login to view your profile</p>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md">

        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-4xl">
            <User className="text-emerald-600" size={40} />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-slate-800">{user.name}</h2>
            <p className="text-gray-500">Welcome back to Engrossery 👋</p>
          </div>
        </div>

        <hr className="my-6" />

        <div className="space-y-4 text-slate-700">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>

        <hr className="my-6" />

        <button
          className="bg-emerald-500 text-white px-6 py-2 rounded-full hover:bg-emerald-600"
          onClick={() => setShowModal(true)}
        >
          Edit Profile
        </button>
      </div>

      {/* Edit Modal */}
      <EditProfileModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        user={user}
        onSave={handleSave}
      />
    </section>
  );
}


function EditProfileModal({ isOpen, onClose, user, onSave }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold">Name</label>
            <input
              className="w-full border px-3 py-2 rounded-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Email</label>
            <input
              className="w-full border px-3 py-2 rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button 
            className="px-4 py-2 bg-gray-200 rounded-lg"
            onClick={onClose}
          >
            Cancel
          </button>

          <button 
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg"
            onClick={() => onSave({ name, email })}
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
}


function MyOrdersPage() {
  const { user } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    api.get("/orders/user")   // ⭐ correct backend endpoint
      .then(res => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Please login to view your orders</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-10 w-10 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-800 mb-8">My Orders</h2>

        {orders.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow text-center">
            <p className="text-gray-600">No orders placed yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
              >
                <div className="flex justify-between mb-3">
                  <h3 className="font-semibold text-lg text-slate-800">
                    Order #{order._id.slice(-6).toUpperCase()} ({order.items.length} items)
                  </h3>

                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      order.paymentStatus === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>

                <div className="space-y-1 text-gray-700 text-sm">
                  {order.items.map((item, i) => (
                    <p key={i} className="text-sm text-gray-700">
                      {item.name} × {item.quantity}
                    </p>
                  ))}

                </div>

                <div className="flex justify-between mt-4 border-t pt-3 font-semibold text-slate-800">
                  <span>Total Amount:</span>
                  <span>${order.totalAmount}</span>
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  Placed on: {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}


// ============================================
// NEWSLETTER SECTION
// ============================================
function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      toast.success('Subscribed successfully!');
      setEmail('');
    }
  };

  return (
    <section className="py-16 bg-gradient-to-r from-emerald-50 to-teal-50">
      <div className="max-w-2xl mx-auto text-center px-4">
        <h2 className="text-3xl font-bold mb-4">Never Miss a Deal!</h2>
        <p className="text-gray-600 mb-6">
          Subscribe to get the latest offers, new arrivals, and exclusive discounts
        </p>
        <form onSubmit={handleSubscribe} className="flex gap-0 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email id"
            className="flex-1 px-4 py-3 rounded-l-lg border outline-none"
            required
          />
          <button 
            type="submit"
            className="bg-emerald-500 text-white px-8 py-3 rounded-r-lg hover:bg-emerald-600"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}

// ============================================
// FOOTER
// ============================================
function Footer() {
  return (
    <footer className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold text-emerald-500">EN</span>
            <span className="text-2xl font-bold text-slate-700">GROSSERY</span>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            We deliver fresh groceries and snacks straight to your door. Trusted by thousands.
          </p>
        </div>
        
        <div>
          <h3 className="font-bold mb-4">Quick Links</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p className="cursor-pointer hover:text-emerald-500">Home</p>
            <p className="cursor-pointer hover:text-emerald-500">Best Sellers</p>
            <p className="cursor-pointer hover:text-emerald-500">Offers & Deals</p>
            <p className="cursor-pointer hover:text-emerald-500">Contact Us</p>
            <p className="cursor-pointer hover:text-emerald-500">FAQs</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-bold mb-4">Need help?</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p className="cursor-pointer hover:text-emerald-500">Delivery Information</p>
            <p className="cursor-pointer hover:text-emerald-500">Return & Refund Policy</p>
            <p className="cursor-pointer hover:text-emerald-500">Payment Methods</p>
            <p className="cursor-pointer hover:text-emerald-500">Track your Order</p>
            <p className="cursor-pointer hover:text-emerald-500">Contact Us</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-bold mb-4">Follow Us</h3>
          <div className="flex gap-4">
            <div className="bg-emerald-100 p-2 rounded-full cursor-pointer hover:bg-emerald-200">
              <Instagram size={20} className="text-emerald-600" />
            </div>
            <div className="bg-emerald-100 p-2 rounded-full cursor-pointer hover:bg-emerald-200">
              <Twitter size={20} className="text-emerald-600" />
            </div>
            <div className="bg-emerald-100 p-2 rounded-full cursor-pointer hover:bg-emerald-200">
              <Facebook size={20} className="text-emerald-600" />
            </div>
            <div className="bg-emerald-100 p-2 rounded-full cursor-pointer hover:bg-emerald-200">
              <Youtube size={20} className="text-emerald-600" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-600 mt-8 border-t pt-8">
        Copyright 2025 © GreatStack.dev All Right Reserved.
      </div>
    </footer>
  );
}

// ============================================
// CART SIDEBAR
// ============================================
function CartSidebar() {
  const { 
    cart, showCartSidebar, setShowCartSidebar, removeFromCart, 
    updateQuantity, getCartTotal, getTax, getFinalTotal,
    deliveryAddress, setDeliveryAddress,
    paymentMethod, setPaymentMethod, placeOrder
  } = useApp();

  if (!showCartSidebar) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">Shopping Cart</h2>
          <button onClick={() => setShowCartSidebar(false)}>
            <X size={24} />
          </button>
        </div>
        
        {cart.length === 0 ? (
          <div className="p-6 text-center text-gray-500 flex-1 flex items-center justify-center">
            <div>
              <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
              <p>Your cart is empty</p>
            </div>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 p-6 space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 border-b pb-4">
                  <div className="w-14 h-14 rounded-md overflow-hidden flex items-center justify-center bg-white">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl">{item.icon || "🛒"}</span>
                          )}
                        </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{item.name}</h3>
                    <p className="text-emerald-500 font-bold">${item.price}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 self-start"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
            
            {/* Order Summary */}
            <div className="p-6 border-t bg-gray-50">
              <h3 className="font-bold mb-4">Order Summary</h3>
              
              {/* Delivery Address */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">DELIVERY ADDRESS</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter delivery address"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              
              {/* Payment Method */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">PAYMENT METHOD</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option>Cash On Delivery</option>
                  <option>Credit Card</option>
                  <option>Debit Card</option>
                  <option>UPI</option>
                </select>
              </div>
              
              {/* Price Breakdown */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee:</span>
                  <span className="text-emerald-500">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (2%):</span>
                  <span>${getTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-2">
                  <span>Total Amount:</span>
                  <span>${getFinalTotal().toFixed(2)}</span>
                </div>
              </div>
              
              {/* Place Order Button */}
              <button
                onClick={placeOrder}
                className="w-full bg-emerald-500 text-white py-3 rounded-lg hover:bg-emerald-600 transition font-semibold"
              >
                Place Order
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================
// LOGIN MODAL
// ============================================
function LoginModal() {
  const { showLoginModal, setShowLoginModal, setShowSignupModal, handleLogin } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!showLoginModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            <span className="text-emerald-500">User</span> Login
          </h2>
          <button onClick={() => setShowLoginModal(false)}>
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full border rounded-lg px-4 py-3"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full border rounded-lg px-4 py-3"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-emerald-500 text-white py-3 rounded-lg hover:bg-emerald-600 font-semibold"
          >
            Login
          </button>
          
          <p className="text-center text-sm">
            Create an account?{' '}
            <button
              type="button"
              onClick={() => {
                setShowLoginModal(false);
                setShowSignupModal(true);
              }}
              className="text-emerald-500 font-semibold hover:underline"
            >
              click here
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

// ============================================
// SIGNUP MODAL
// ============================================
function SignupModal() {
  const { showSignupModal, setShowSignupModal, setShowLoginModal, handleSignup } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!showSignupModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSignup(name, email, password);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            <span className="text-emerald-500">User</span> Sign Up
          </h2>
          <button onClick={() => setShowSignupModal(false)}>
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full border rounded-lg px-4 py-3"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full border rounded-lg px-4 py-3"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full border rounded-lg px-4 py-3"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-emerald-500 text-white py-3 rounded-lg hover:bg-emerald-600 font-semibold"
          >
            Create Account
          </button>
          
          <p className="text-center text-sm">
            Already have account?{' '}
            <button
              type="button"
              onClick={() => {
                setShowSignupModal(false);
                setShowLoginModal(true);
              }}
              className="text-emerald-500 font-semibold hover:underline"
            >
              click here
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

// ============================================
// SELLER DASHBOARD COMPONENTS
// ============================================

// Seller Dashboard Main Component
function SellerDashboard() {
  const [activeTab, setActiveTab] = useState('add-product');
  const { user, handleLogout } = useApp();

  // Guard: logged-in check
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Login</h2>
          <p className="text-gray-600 mb-4">
            You need to be logged in as an admin to access the seller dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Guard: admin role check
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            This section is only for admin / seller accounts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-emerald-500">EN</span>
            <span className="text-2xl font-bold text-slate-700">GROSSERY</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Hi! {user.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r min-h-screen">
          <div className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab('add-product')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                activeTab === 'add-product' 
                  ? 'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700' 
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <Plus size={20} />
              <span>Add Product</span>
            </button>

            <button
              onClick={() => setActiveTab('product-list')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                activeTab === 'product-list' 
                  ? 'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700' 
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <Menu size={20} />
              <span>Product List</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                activeTab === 'orders' 
                  ? 'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700' 
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <ShoppingCart size={20} />
              <span>Orders</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === 'add-product' && <AddProductForm />}
          {activeTab === 'product-list' && <ProductListAdmin />}
          {activeTab === 'orders' && <OrdersList />}
        </div>
      </div>
    </div>
  );
}

// Add Product Form Component
function AddProductForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    originalPrice: '',
    inStock: true
  });
  const [images, setImages] = useState([null, null, null, null]);
  const [uploading, setUploading] = useState(false);

  const categories = [
    'Organic veggies',
    'Fresh Fruits',
    'Cold Drinks',
    'Instant Food',
    'Dairy Products',
    'Bakery',
    'Grains',
    'Vegetables',
    'Fruits',
    'Drinks'
  ];

  const handleImageUpload = (index, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...images];
        newImages[index] = reader.result;
        setImages(newImages);
      };
      reader.readAsDataURL(file);
    }
  };
  const normalizeName = (name) => {
  return name
    .toLowerCase()
    .replace(/[0-9]/g, "")
    .replace(/\b(kg|g|gm|ml|ltr|liter|litre|pack|pcs|piece|pieces)\b/g, "")
    .replace(/[^a-z]/g, "")
    .replace(/s\b/, "") 
    .trim();
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setUploading(true);
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        imageUrl: images[0], // Use first image as main image
        images: images.filter(img => img !== null),
        rating: 4,
        reviewCount: 0
      };

      // Admin add product endpoint

      productData.normalizedName = normalizeName(formData.name);
      try {
            await api.post("/products/admin", productData);
            toast.success("Product added successfully!");
          } catch (err) {
            const msg = err.response?.data?.message;

            if (msg === "Product already exists") {
              toast.error("Product already exists!");
            } else {
              toast.error("Failed to add product");
            }
          }

      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        originalPrice: '',
        inStock: true
      });
      setImages([null, null, null, null]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add product');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Add Product</h2>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {/* Product Images */}
        <div>
          <label className="block text-sm font-semibold mb-3">Product Image</label>
          <div className="grid grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <input
                  type="file"
                  id={`image-${index}`}
                  accept="image/*"
                  onChange={(e) => handleImageUpload(index, e.target.files[0])}
                  className="hidden"
                />
                <label
                  htmlFor={`image-${index}`}
                  className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-emerald-500 transition"
                >
                  {image ? (
                    <img src={image} alt={`Upload ${index + 1}`} className="w-full h-24 object-cover rounded" />
                  ) : (
                    <div className="text-gray-400">
                      <div className="text-4xl mb-2">☁️</div>
                      <div className="text-sm">Upload</div>
                    </div>
                  )}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Product Name */}
        <div>
          <label className="block text-sm font-semibold mb-2">Product Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Type here"
            className="w-full border rounded-lg px-4 py-3"
            required
          />
        </div>

        {/* Product Description */}
        <div>
          <label className="block text-sm font-semibold mb-2">Product Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Type here"
            rows="4"
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold mb-2">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full border rounded-lg px-4 py-3"
            required
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Price Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Product Price</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0"
              step="0.01"
              className="w-full border rounded-lg px-4 py-3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Offer Price</label>
            <input
              type="number"
              value={formData.originalPrice}
              onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
              placeholder="0"
              step="0.01"
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading}
          className="bg-emerald-500 text-white px-8 py-3 rounded-lg hover:bg-emerald-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {uploading ? 'Adding...' : 'ADD'}
        </button>
      </form>
    </div>
  );
}

// Product List Admin Component
function ProductListAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductsAdmin();
  }, []);

  const fetchProductsAdmin = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');

      // DB products from backend
      const dbProducts = response.data.map(p => ({
        ...p,
        id: p._id,
        icon: p.imageUrl ? null : '🛒',
        source: 'db',
      }));

      // Static demo products (for reference)
      const demoProducts = getDemoProducts().map(p => ({
        ...p,
        source: 'demo',
      }));

      // In admin panel: show DB products (even if name duplicates) + demo ones
      const mergedProducts = [...dbProducts, ...demoProducts];

      setProducts(mergedProducts);
    } catch (error) {
      console.error('Product Load Error:', error);
      setProducts(getDemoProducts().map(p => ({ ...p, source: 'demo' })));
    } finally {
      setLoading(false);
    }
  };

const toggleStock = async (productId, currentStatus, source) => {

  // ⭐ Demo product — update locally
  if (source === "demo") {
    setProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, inStock: !currentStatus } : p
      )
    );
    toast.success("Demo product stock updated");
    return;
  }

  // ⭐ DB product — call backend
  try {
    await api.patch(`/products/admin/${productId}`, {
      inStock: !currentStatus
    });
    toast.success("Stock status updated");
    fetchProductsAdmin();
  } catch (error) {
    toast.error("Failed to update stock");
  }
};


const deleteProduct = async (productId, source) => {
  if (!window.confirm("Delete this product?")) return;

  // ⭐ Demo product — delete locally only
  if (source === "demo") {
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast.success("Demo product removed");
    return;
  }

  // ⭐ DB product — delete via backend
  try {
    await api.delete(`/products/admin/${productId}`);
    toast.success("Product deleted");
    fetchProductsAdmin();
  } catch (error) {
    toast.error("Failed to delete product");
  }
};


  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">All Product</h2>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">Product</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Selling Price</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">In Stock</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => {
              const isDb = product.source === 'db' && product._id;
              const rowKey = product._id || product.id;
              return (
                <tr key={rowKey} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl">{product.icon || '🛒'}</span>
                        )}
                      </div>

                      <span className="font-medium">
                        {product.name} {product.source === 'demo' && <span className="text-xs text-gray-400">(demo)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{product.category}</td>
                  <td className="px-6 py-4 font-semibold">${product.price}</td>
                  <td className="px-6 py-4">
                      <button
            onClick={() => toggleStock(
              product._id || product.id,
              product.inStock,
              product.source   // ⭐ needed to detect demo vs db
            )}

                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                          product.inStock !== false ? "bg-blue-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            product.inStock !== false ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteProduct(product.id || product._id, product.source)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={20} />
                        </button>
                      </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Orders List Component
function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Correct path: /api/orders/admin
      const response = await api.get('/orders/admin');
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to load orders');
      // Fallback to demo data
      setOrders([
        {
          id: 1,
          items: [
            { name: 'Apple 1 kg', quantity: 1 },
            { name: 'Carrot 500g', quantity: 1 }
          ],
          customer: {
            name: 'Prashant Kumar',
            address: 'Flat-B/102, Anand vihar Complex, New Partlip Bihar, 800013, India'
          },
          totalAmount: 136,
          paymentMethod: 'COD',
          date: '12/5/2025',
          paymentStatus: 'Pending'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    if (!orderId) return;
    try {
      // Correct path: /api/orders/admin/:id
      await api.patch(`/orders/admin/${orderId}`, { paymentStatus: status });
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Orders List</h2>
      
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">No orders yet</p>
          </div>
        ) : (
          orders.map(order => {
            const orderId = order._id || order.id;
            return (
              <div key={orderId} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex gap-6">
                  <div className="w-20 h-20 bg-emerald-50 rounded-lg flex items-center justify-center text-4xl">
                    🛒
                  </div>
                  
                  <div className="flex-1">
                    <div className="space-y-1">
                      {order.items?.map((item, idx) => (
                        <p key={idx} className="font-medium">
                          {item.name || item.productName || 'Item'} x {item.quantity}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 max-w-xs">
                    <p className="font-semibold text-gray-900 mb-1">{order.customer?.name || 'Customer'}</p>
                    <p className="mb-2">{order.customer?.address || order.deliveryAddress}</p>
                  </div>

                  <div className="text-2xl font-bold text-gray-900">
                    ${order.totalAmount}
                  </div>

                  <div className="text-sm text-gray-600 text-right">
                    <p>Method: {order.paymentMethod}</p>
                    <p>Date: {order.date || new Date(order.createdAt).toLocaleDateString()}</p>
                    <p>
                      Payment:{' '}
                      <span className={order.paymentStatus === 'Pending' ? 'text-orange-500' : 'text-green-500'}>
                        {order.paymentStatus}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Example status change button (optional) */}
                {/* <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => updateOrderStatus(orderId, 'Completed')}
                    className="text-xs px-3 py-1 rounded bg-emerald-500 text-white"
                  >
                    Mark as Completed
                  </button>
                </div> */}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
function GroceryBanner() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">

        <div className="rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 bg-[#F1FFF6]">

          {/* LEFT — IMAGE + GREEN BACK CIRCLE */}
          <div className="relative flex items-center justify-center p-10">

            {/* Green Circle Background */}
            <div className="w-[480px] h-[480px] bg-emerald-300 rounded-full overflow-hidden flex items-center justify-center shadow-lg"/>

            {/* Grocery Image */}
             <img
                src="/grocery.jpg"
                alt="Grocery Delivery"
                className="w-full h-full object-cover" 
              />


          </div>

          {/* RIGHT — TEXT */}
          <div className="p-10 md:p-16 space-y-10">
            <h2 className="text-4xl font-extrabold text-emerald-700 leading-snug">
              Why We Are the Best?
            </h2>

            <div className="space-y-8">
              <Feature
                icon="🚚"
                title="Fastest Delivery"
                desc="Groceries delivered in under 30 minutes."
              />

              <Feature
                icon="🌱"
                title="Freshness Guaranteed"
                desc="Fresh produce straight from the source."
              />

              <Feature
                icon="💲"
                title="Affordable Prices"
                desc="Quality groceries at unbeatable prices."
              />

              <Feature
                icon="💚"
                title="Trusted by Thousands"
                desc="Loved by 10,000+ happy customers."
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-4">
      <div className="bg-emerald-200 p-3 rounded-xl text-emerald-700 text-2xl">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-lg text-gray-800">{title}</h3>
        <p className="text-gray-600 text-sm">{desc}</p>
      </div>
    </div>
  );
}

//export default GroceryBanner;



// ============================================
// MAIN APP
// ============================================
function AppContent() {
  const { currentView } = useApp();

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" />
      
      {/* Navbar: hidden on seller dashboard */}
      {currentView !== 'seller-dashboard' && <Navbar />}
      
      {/* Main Content */}
      {currentView === 'home' && (
        <>
          <HeroSection />
          <CategoryGrid />
           <BestSellersSection />
           <GroceryBanner />
          <Newsletter />
        </>
      )}
      
      {currentView === 'products' && <ProductsSection />}
      
      {currentView === 'seller-dashboard' && <SellerDashboard />}

      {currentView === 'profile' && <ProfilePage />}
      {currentView === 'my-orders' && <MyOrdersPage />}

      
      {/* Footer: hidden on seller dashboard */}
      {currentView !== 'seller-dashboard' && <Footer />}
      
      {/* Modals & Cart */}
      <LoginModal />
      <SignupModal />
      <CartSidebar />
    </div>
  );
}
// ============================================
// BEST SELLERS SECTION
// ============================================
function BestSellersSection() {
  const { products } = useApp();

  const bestSellers = [...products]
    .sort((a, b) => b.rating - a.rating) // Highest rating first
    .slice(0, 5); // Only top 5

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-800 mb-8">BEST SELLERS</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {bestSellers.map(product => (
            <ProductCard key={product.id || product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
