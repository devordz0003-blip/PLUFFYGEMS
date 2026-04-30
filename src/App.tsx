/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dog, Cat, Star, ChevronLeft, ArrowRight, Menu, X, 
  Search, Filter, ChevronDown, User, LogOut, Mail, Lock, 
  AlertCircle
} from 'lucide-react';
import { PRODUCTS, BLOG_POSTS } from './constants';
import { Category, Product, Page, BlogPost } from './types';
import { auth, db } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// Components

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          role: 'user',
          createdAt: serverTimestamp(),
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address to reset password.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface w-full max-w-md border border-white/10 p-8 shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="mb-8 text-center">
          <h2 className="text-2xl font-serif italic text-white mb-2">
            {isLogin ? 'Member Login' : 'Create Account'}
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-text-muted">
            Access Curated Pet Collections
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {resetSent ? (
          <div className="text-center py-8">
            <Mail className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
            <p className="text-sm text-text-muted mb-6">Password reset instructions sent to your email.</p>
            <button 
              onClick={() => setResetSent(false)}
              className="text-[10px] uppercase tracking-widest text-primary border-b border-primary/20 pb-1"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/40" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 px-10 py-3 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors uppercase tracking-widest"
                  placeholder="name@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/40" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 px-10 py-3 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors uppercase tracking-widest"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-black font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Join Membership')}
            </button>

            <div className="flex justify-between items-center text-[9px] uppercase tracking-widest">
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-text-muted hover:text-primary transition-colors"
              >
                {isLogin ? "Need an account? Join" : "Already a member? Login"}
              </button>
              {isLogin && (
                <button 
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-text-muted hover:text-primary transition-colors"
                >
                  Forgot Password?
                </button>
              )}
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

interface NavbarProps {
  currentPage: Page;
  setPage: (p: Page) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (o: boolean) => void;
  user: FirebaseUser | null;
  onAuthClick: () => void;
}

const Navbar = ({ currentPage, setPage, isMobileMenuOpen, setIsMobileMenuOpen, user, onAuthClick }: NavbarProps) => {
  const links = [
    { id: 'home', label: 'Home' },
    { id: 'dogs', label: 'Dog Products' },
    { id: 'cats', label: 'Cat Products' },
    { id: 'blog', label: 'Blog' },
    { id: 'about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-pet-bg/80 backdrop-blur-md border-b border-white/5 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div 
            className="flex items-center gap-4 cursor-pointer group" 
            onClick={() => setPage('home')}
            id="nav-logo"
          >
            <div className="border border-primary/30 p-2 group-hover:border-primary transition-colors">
              <Dog className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-serif font-light text-primary uppercase tracking-[0.3em]">Pawfect Picks</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-10">
            {links.map(link => (
              <button
                key={link.id}
                onClick={() => setPage(link.id as Page)}
                className={`text-[10px] uppercase tracking-[0.2em] transition-all hover:text-primary ${
                  currentPage === link.id ? 'text-primary' : 'text-text-muted'
                }`}
                id={`nav-${link.id}`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:block">
            {user ? (
              <div className="flex items-center gap-6">
                <span className="text-[10px] text-text-muted uppercase tracking-widest opacity-60">Verified</span>
                <button 
                  onClick={() => signOut(auth)}
                  className="text-[10px] border border-white/10 px-4 py-2 text-text-muted uppercase tracking-widest hover:border-primary hover:text-primary transition-all flex items-center gap-2"
                >
                  <LogOut className="w-3 h-3" /> Log Out
                </button>
              </div>
            ) : (
              <button 
                onClick={onAuthClick}
                className="text-[10px] border border-primary px-4 py-2 text-primary uppercase tracking-widest hover:bg-primary hover:text-black transition-all"
              >
                Member Access
              </button>
            )}
          </div>

          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-text-muted"
              id="mobile-menu-toggle"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface border-b border-white/5"
          >
            <div className="px-4 py-8 space-y-6">
              {links.map(link => (
                <button
                  key={link.id}
                  onClick={() => {
                    setPage(link.id as Page);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left text-xs uppercase tracking-widest font-medium ${
                    currentPage === link.id ? 'text-primary' : 'text-text-muted'
                  }`}
                  id={`mobile-nav-${link.id}`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

interface ProductCardProps {
  product: Product;
  onSelect: (p: Product) => void;
  key?: string | number;
}

const ProductCard = ({ product, onSelect }: ProductCardProps) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-surface rounded-none p-6 border border-white/5 flex flex-col h-full group"
      id={`product-${product.id}`}
    >
      <div className="relative aspect-[4/5] mb-6 overflow-hidden bg-black/40">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
        />
        <div className="absolute bottom-4 left-4 bg-primary/10 backdrop-blur px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-primary border border-primary/20">
          {product.category}
        </div>
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-primary text-primary' : 'fill-white/10 text-white/10'}`} 
            />
          ))}
          <span className="text-[10px] text-text-muted ml-2 tracking-widest">({product.rating})</span>
        </div>
        
        <h3 className="text-xl font-serif font-light text-white mb-2 leading-tight text-left italic">{product.name}</h3>
        <p className="text-xs text-text-muted mb-6 line-clamp-2 text-left leading-relaxed">{product.description}</p>
      </div>

      <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
        <span className="text-lg font-light text-primary">{product.price || '$145.00'}</span>
        <button 
          onClick={() => onSelect(product)}
          className="text-[10px] uppercase tracking-widest text-primary hover:text-white transition-colors flex items-center gap-2 group/btn"
          id={`buy-${product.id}`}
        >
          View Details <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

interface BlogCardProps {
  post: BlogPost;
  key?: string | number;
}

const BlogCard = ({ post }: BlogCardProps) => {
  return (
    <motion.div 
      className="bg-surface border border-white/5 flex flex-col group"
      id={`blog-${post.id}`}
    >
      <div className="aspect-video overflow-hidden bg-black">
        <img 
          src={post.image} 
          alt={post.title} 
          className="w-full h-full object-cover transition-transform duration-700 opacity-70 group-hover:opacity-90 group-hover:scale-105"
        />
      </div>
      <div className="p-8 flex flex-col flex-1 text-left">
        <span className="text-[9px] font-bold text-primary uppercase tracking-[0.3em] mb-4">{post.date}</span>
        <h3 className="text-2xl font-serif font-light text-white mb-4 leading-snug group-hover:text-primary transition-colors italic">{post.title}</h3>
        <p className="text-xs text-text-muted mb-8 line-clamp-3 leading-relaxed">{post.excerpt}</p>
        <button className="mt-auto flex items-center gap-3 text-[10px] font-bold text-primary uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
          Explore Article <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

const Footer = ({ setPage }: { setPage: (p: Page) => void }) => {
  return (
    <footer className="bg-surface border-t border-white/5 mt-32 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-3 mb-10">
            <div className="border border-primary/30 p-2">
              <Dog className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-serif font-light text-primary uppercase tracking-[0.4em]">Pawfect Picks</span>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-x-12 gap-y-6 mb-16">
            {['Home', 'Dog Products', 'Cat Products', 'Blog', 'About'].map((link) => (
              <button 
                key={link} 
                className="text-[10px] uppercase tracking-[0.2em] font-medium text-text-muted hover:text-primary transition-colors"
                onClick={() => setPage(link.toLowerCase().split(' ')[0] as Page)}
              >
                {link}
              </button>
            ))}
          </nav>

          <div className="max-w-3xl border border-white/5 bg-black/20 p-8 rounded-none mb-12 text-left">
            <p className="text-[10px] leading-relaxed text-text-muted uppercase tracking-widest font-normal opacity-60">
              Discerning Choice: Pawfect Picks serves the high-standards pet community through architectural hardware and elite nutritional curation. As an Amazon Associate, we maintain strict editorial independence while earning from qualified acquisitions.
            </p>
          </div>

          <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] opacity-40">
            © {new Date().getFullYear()} PIXELS & PAWS. STYLED FOR LONGEVITY.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Filter and Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('relevance');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const navigate = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    navigate('review');
  };

  const processProducts = (products: Product[]) => {
    let result = [...products];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }

    // Price
    if (minPrice !== '') result = result.filter(p => parseFloat(p.price.replace('$', '')) >= minPrice);
    if (maxPrice !== '') result = result.filter(p => parseFloat(p.price.replace('$', '')) <= maxPrice);

    // Rating
    if (minRating > 0) result = result.filter(p => p.rating >= minRating);

    // Sort
    result.sort((a, b) => {
      const priceA = parseFloat(a.price.replace('$', ''));
      const priceB = parseFloat(b.price.replace('$', ''));
      
      switch (sortBy) {
        case 'price-low': return priceA - priceB;
        case 'price-high': return priceB - priceA;
        case 'rating': return b.rating - a.rating;
        default: return 0; // relevance
      }
    });

    return result;
  };

  const filteredDogProducts = useMemo(() => 
    processProducts(PRODUCTS.filter(p => p.category.toString().includes('Dog'))), 
  [searchQuery, minPrice, maxPrice, minRating, sortBy]);

  const filteredCatProducts = useMemo(() => 
    processProducts(PRODUCTS.filter(p => p.category.toString().includes('Cat'))), 
  [searchQuery, minPrice, maxPrice, minRating, sortBy]);

  const FilterBar = () => (
    <div className="mb-12 flex flex-col lg:flex-row items-center gap-6 p-6 border border-white/5 bg-surface">
      <div className="flex-1 w-full relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input 
          type="text" 
          placeholder="SEARCH ARCHIVE..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-black/40 border border-white/5 pl-12 pr-4 py-3 text-[10px] uppercase tracking-widest text-white focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      <div className="w-full lg:w-auto flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-widest text-text-muted whitespace-nowrap">Price Range</span>
          <input 
            type="number" 
            placeholder="MIN"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
            className="w-16 bg-black/40 border border-white/5 py-2 px-2 text-[9px] text-white focus:outline-none"
          />
          <span className="text-text-muted">-</span>
          <input 
            type="number" 
            placeholder="MAX"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
            className="w-16 bg-black/40 border border-white/5 py-2 px-2 text-[9px] text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 border-l border-white/10 pl-4 h-8">
          <span className="text-[9px] uppercase tracking-widest text-text-muted whitespace-nowrap">Min Rating</span>
          <select 
            value={minRating}
            onChange={(e) => setMinRating(parseInt(e.target.value))}
            className="bg-black/40 border border-white/5 py-2 px-2 text-[9px] text-white focus:outline-none uppercase tracking-widest"
          >
            <option value={0}>Any</option>
            <option value={4}>4+ Stars</option>
            <option value={4.5}>4.5+ Stars</option>
          </select>
        </div>

        <div className="flex items-center gap-2 border-l border-white/10 pl-4 h-8 ml-auto">
          <span className="text-[9px] uppercase tracking-widest text-text-muted whitespace-nowrap">Sort By</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-black/40 border border-white/5 py-2 px-2 text-[9px] text-white focus:outline-none uppercase tracking-widest"
          >
            <option value="relevance">Relevance</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col antialiased">
      <Navbar 
        currentPage={currentPage} 
        setPage={navigate} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        user={user}
        onAuthClick={() => setIsAuthModalOpen(true)}
      />

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
            >
              {/* Hero */}
              <section className="py-20 md:py-32 mb-20 relative overflow-hidden text-center border-y border-white/5">
                <div className="max-w-3xl mx-auto relative z-10">
                  <div className="flex justify-center mb-8">
                    <span className="px-4 py-2 border border-primary/20 text-[10px] uppercase tracking-[0.4em] text-primary font-bold">
                      The Elevated Companion
                    </span>
                  </div>
                  <h1 className="text-5xl md:text-8xl font-serif font-light text-white mb-8 leading-tight tracking-tight">
                    Refined Essentials for <span className="italic">Discerning Pets.</span>
                  </h1>
                  <p className="text-sm md:text-base text-text-muted mb-12 max-w-xl mx-auto leading-relaxed tracking-wider">
                    A rigorous selection of architectural hardware, orthopedic foundations, and nutritional excellence for the modern household.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <button 
                      onClick={() => navigate('dogs')}
                      className="inline-flex items-center justify-center gap-3 border border-primary text-primary px-10 py-4 text-[10px] uppercase tracking-[0.3em] transition-all hover:bg-primary hover:text-black"
                      id="hero-shop-dogs"
                    >
                      Canine Archive <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => navigate('cats')}
                      className="inline-flex items-center justify-center gap-3 border border-white/20 text-white px-10 py-4 text-[10px] uppercase tracking-[0.3em] transition-all hover:bg-white hover:text-black"
                      id="hero-shop-cats"
                    >
                      Feline Archive <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                {/* Visual Flair */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] -z-10" />
              </section>

              {/* Categories */}
              <section className="mb-24">
                <div className="flex justify-center mb-12 text-center">
                  <h2 className="text-[10px] uppercase tracking-[0.5em] text-text-muted font-bold">Curated Categories</h2>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  {Object.values(Category).map((cat) => (
                    <button
                      key={cat}
                      className="px-8 py-3 border border-white/5 bg-surface text-[10px] uppercase tracking-widest font-bold hover:border-primary/50 hover:text-primary transition-all"
                      id={`category-${cat}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </section>

              {/* Top Picks */}
              <section className="mb-32">
                <div className="flex flex-col items-center mb-16 text-center">
                  <span className="text-primary text-[10px] uppercase tracking-[0.4em] font-bold mb-4 block">Seasonal Selection</span>
                  <h2 className="text-3xl md:text-5xl font-serif font-light text-white mb-6">The Current Standard</h2>
                  <div className="w-20 h-px bg-primary/30" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {PRODUCTS.map(product => (
                    <ProductCard key={product.id} product={product} onSelect={handleProductSelect} />
                  ))}
                </div>
              </section>

              {/* Newsletter / CTA */}
              <section className="bg-surface border border-white/5 p-12 md:p-24 text-center relative overflow-hidden">
                <div className="max-w-2xl mx-auto relative z-10">
                  <h2 className="text-3xl md:text-5xl font-serif font-light mb-6">The Dispatch</h2>
                  <p className="text-sm text-text-muted mb-12 uppercase tracking-widest leading-relaxed">Weekly insights into the architecture of pet wellness.</p>
                  <div className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto">
                    <input 
                      type="email" 
                      placeholder="EMAIL ADDRESS" 
                      className="flex-1 px-6 py-4 bg-black/40 border border-white/10 focus:outline-none focus:border-primary/50 text-[10px] tracking-widest uppercase"
                    />
                    <button className="bg-primary text-black font-bold px-8 py-4 text-[10px] uppercase tracking-widest hover:bg-primary-hover transition-all">
                      Subscribe
                    </button>
                  </div>
                </div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              </section>
            </motion.div>
          )}

          {currentPage === 'dogs' && (
            <motion.div
              key="dogs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
            >
              <div className="mb-20 text-center">
                <span className="text-primary font-bold uppercase tracking-[0.4em] text-[10px] mb-4 block">Canine Archive</span>
                <h1 className="text-4xl md:text-6xl font-serif font-light text-white mb-6 italic">The Distinguished Dog</h1>
                <p className="text-text-muted max-w-xl mx-auto text-sm leading-relaxed tracking-wider">A selection of premium essentials curated for the legacy of your faithful companion.</p>
                <div className="w-16 h-px bg-primary/30 mx-auto mt-10" />
              </div>

              <FilterBar />

              {filteredDogProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                  {filteredDogProducts.map(product => (
                    <ProductCard key={product.id} product={product} onSelect={handleProductSelect} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 border border-dashed border-white/10">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-text-muted">No items match your criteria</p>
                  <button onClick={() => {
                    setSearchQuery('');
                    setMinPrice('');
                    setMaxPrice('');
                    setMinRating(0);
                  }} className="mt-6 text-[10px] text-primary border-b border-primary/20 pb-1">Reset Filters</button>
                </div>
              )}
            </motion.div>
          )}

          {currentPage === 'cats' && (
            <motion.div
              key="cats"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
            >
              <div className="mb-20 text-center">
                <span className="text-primary font-bold uppercase tracking-[0.4em] text-[10px] mb-4 block">Feline Archive</span>
                <h1 className="text-4xl md:text-6xl font-serif font-light text-white mb-6 italic">The Architectural Cat</h1>
                <p className="text-text-muted max-w-xl mx-auto text-sm leading-relaxed tracking-wider">A collection of stimuli and foundations designed for feline grace and intuition.</p>
                <div className="w-16 h-px bg-primary/30 mx-auto mt-10" />
              </div>

              <FilterBar />

              {filteredCatProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                  {filteredCatProducts.map(product => (
                    <ProductCard key={product.id} product={product} onSelect={handleProductSelect} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 border border-dashed border-white/10">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-text-muted">No items match your criteria</p>
                  <button onClick={() => {
                    setSearchQuery('');
                    setMinPrice('');
                    setMaxPrice('');
                    setMinRating(0);
                  }} className="mt-6 text-[10px] text-primary border-b border-primary/20 pb-1">Reset Filters</button>
                </div>
              )}
            </motion.div>
          )}

          {currentPage === 'blog' && (
            <motion.div
              key="blog"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
            >
              <div className="mb-20 text-center max-w-3xl mx-auto">
                <span className="text-primary font-bold uppercase tracking-[0.4em] text-[10px] mb-4 block">Editorial</span>
                <h1 className="text-4xl md:text-6xl font-serif font-light text-white mb-6 italic">The Archive</h1>
                <p className="text-text-muted text-sm tracking-wide leading-relaxed">Dispatches from the intersection of design, wellness, and companionship.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
                {BLOG_POSTS.map(post => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              {/* Big Featured Blog */}
              <div className="bg-surface border border-white/5 overflow-hidden flex flex-col lg:flex-row shadow-2xl">
                <div className="lg:w-1/2 aspect-video lg:aspect-auto bg-black">
                  <img 
                    src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&q=80&w=800" 
                    alt="Featured" 
                    className="w-full h-full object-cover opacity-60"
                  />
                </div>
                <div className="p-10 lg:p-20 lg:w-1/2 flex flex-col justify-center text-left">
                  <span className="text-primary font-bold text-[10px] uppercase tracking-[0.4em] mb-6 block">Legacy Selection</span>
                  <h2 className="text-3xl md:text-5xl font-serif font-light text-white mb-8 leading-tight italic">Ultimate Guide to Bringing Home Your First Rescue</h2>
                  <p className="text-text-muted text-sm leading-relaxed mb-10 tracking-wide">From calibrating their environment to the initial professional consultation, we explore the essential protocols for a seamless transition...</p>
                  <button className="self-start inline-flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-bold text-primary border-b border-primary/30 pb-2 hover:gap-6 transition-all">
                    Explore Fully <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {currentPage === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center text-left">
                <div className="text-left">
                  <span className="text-primary font-bold text-[10px] uppercase tracking-[0.4em] block mb-6">Our Ethos</span>
                  <h1 className="text-5xl md:text-7xl font-serif font-light text-white mb-10 leading-tight italic">Elegance is an <span className="text-primary not-italic">Obligation.</span></h1>
                  <p className="text-lg text-text-muted mb-8 leading-relaxed font-light tracking-wide">
                    Established in 2024, Pawfect Picks was conceived with a rigorous standard: companionship deserves the same architectural precision and aesthetic consideration as the rest of your life.
                  </p>
                  <p className="text-base text-text-muted mb-12 leading-relaxed opacity-80 tracking-wide font-light">
                    Our curators are vet technicians, professional behaviorists, and obsessive adherents to quality. We do not aggregate; we validate through physical testing and structural analysis.
                  </p>
                  <div className="flex gap-12 border-t border-white/5 pt-12">
                    <div className="text-left">
                      <div className="text-3xl font-serif font-light text-primary mb-2 italic">500+</div>
                      <div className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Validated Designs</div>
                    </div>
                    <div className="text-left">
                      <div className="text-3xl font-serif font-light text-primary mb-2 italic">100%</div>
                      <div className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Integrity Rating</div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-[4/5] rounded-none overflow-hidden shadow-2xl relative z-10 border border-white/5">
                    <img 
                      src="https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=600" 
                      alt="Pets" 
                      className="w-full h-full object-cover grayscale opacity-80"
                    />
                  </div>
                  <div className="absolute top-[15%] right-[-10%] w-[60%] aspect-square bg-primary/10 rounded-full -z-10 blur-[80px]" />
                </div>
              </div>
            </motion.div>
          )}

          {currentPage === 'review' && selectedProduct && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
            >
              <button 
                onClick={() => navigate('home')}
                className="mb-12 flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-bold text-text-muted hover:text-primary transition-all group"
                id="back-to-products"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Selection
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-24 text-left">
                <div className="text-left">
                  <div className="aspect-[3/4] rounded-none overflow-hidden bg-black shadow-2xl relative border border-white/5">
                    <img 
                      src={selectedProduct.image} 
                      alt={selectedProduct.name} 
                      className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute top-10 left-10 flex items-center gap-2 bg-black/60 backdrop-blur px-5 py-3 border border-white/10">
                      <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                      <span className="text-sm font-light text-white tracking-widest">{selectedProduct.rating}</span>
                      <span className="text-[9px] text-text-muted font-bold ml-2 uppercase tracking-widest opacity-60">Verified Choice</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center text-left">
                  <span className="text-primary font-bold text-[10px] uppercase tracking-[0.4em] mb-6 block">Evaluation Dossier</span>
                  <h1 className="text-5xl md:text-7xl font-serif font-light text-white mb-10 leading-[1.1] italic text-left">
                    {selectedProduct.name}
                  </h1>
                  <p className="text-lg text-text-muted mb-12 leading-relaxed font-light tracking-wide text-left">
                    {selectedProduct.fullReview || selectedProduct.description}
                  </p>

                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white mb-6 border-l-2 border-primary pl-4">Specifications</h3>
                  <ul className="grid grid-cols-1 gap-3 mb-12 text-left">
                    {selectedProduct.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-4 py-3 border-b border-white/5 text-left">
                        <span className="text-[10px] text-primary font-serif italic">0{i+1}.</span>
                        <span className="text-xs font-medium text-text-muted tracking-widest uppercase">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16 text-left font-light">
                    <div className="text-left">
                      <h4 className="text-white text-[10px] uppercase tracking-widest mb-6 py-2 border-b border-primary/20">The Merits</h4>
                      <ul className="space-y-4 text-left">
                        {selectedProduct.pros.map((p, i) => (
                          <li key={i} className="text-xs text-text-muted flex items-start gap-3 tracking-wide">
                            <span className="text-primary text-[10px]">●</span> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-left">
                      <h4 className="text-white text-[10px] uppercase tracking-widest mb-6 py-2 border-b border-white/10 opacity-60">Observations</h4>
                      <ul className="space-y-4 text-left">
                        {selectedProduct.cons.map((c, i) => (
                          <li key={i} className="text-xs text-text-muted/60 flex items-start gap-3 tracking-wide italic">
                            <span className="text-white/20 text-[10px]">○</span> {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <a 
                    href={selectedProduct.amazonUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-4 bg-primary text-black font-bold py-6 px-10 text-[11px] uppercase tracking-[0.4em] transition-all hover:bg-white shadow-2xl active:translate-y-[1px]"
                    id={`amazon-checkout-${selectedProduct.id}`}
                  >
                    Check Acquisition price <ArrowRight className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer setPage={navigate} />
    </div>
  );
}
