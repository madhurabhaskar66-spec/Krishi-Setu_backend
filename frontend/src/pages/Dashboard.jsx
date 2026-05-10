import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Store, MessageSquare, PhoneCall, LineChart, ShieldCheck, LogOut, Menu, X, ArrowUpRight, ArrowDownRight, Upload, Mic, Heart, MessageCircle, Share2, UserCircle, Edit3, Check, Phone, Mail, MapPin, Tractor } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';

export default function Dashboard() {
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const userRole = location.state?.role || 'farmer';
  const userEmail = location.state?.email || 'guest@krishisetu.com';
  const userName = location.state?.name || '';
  const userPhone = location.state?.phone || '';
  const userFieldLocation = location.state?.field_location || '';
  const userProfile = { name: userName, phone: userPhone, email: userEmail, role: userRole, field_location: userFieldLocation };

  const handleLogout = () => navigate('/');

  const navItems = [
    { name: t('nav_overview'), path: '/dashboard', end: true, icon: <LayoutDashboard size={20} /> },
    { name: t('nav_market'), path: '/dashboard/market', icon: <Store size={20} /> },
    { name: t('nav_prices'), path: '/dashboard/prices', icon: <LineChart size={20} /> },
    { name: t('nav_chat'), path: '/dashboard/chat', icon: <MessageSquare size={20} /> },
    { name: t('nav_voice'), path: '/dashboard/call', icon: <PhoneCall size={20} /> },
    { name: t('nav_verify'), path: '/dashboard/verify', icon: <ShieldCheck size={20} /> },
    { name: t('nav_post'), path: '/dashboard/post', icon: <Upload size={20} /> },
    { name: 'My Profile', path: '/dashboard/profile', icon: <UserCircle size={20} /> },
  ];

  return (
    <div className="flex" style={{ height: '100vh', overflow: 'hidden' }}>
      
      {/* Sidebar */}
      <div 
        className={`glass-panel flex-col justify-between ${mobileMenuOpen ? 'flex' : 'hidden md:flex'}`} 
        style={{ 
          width: '280px', height: '100%', borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderLeft: 'none',
          padding: '2rem 0', position: mobileMenuOpen ? 'absolute' : 'relative', zIndex: 50, background: 'rgba(10, 14, 23, 0.95)'
        }}
      >
        <div className="flex-col gap-8">
          <div className="flex items-center gap-2 px-6" style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--brand-primary)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} color="white" />
            </div>
            <h2 className="gradient-text" style={{ margin: 0, fontSize: '1.25rem' }}>{t('app_name')}</h2>
          </div>

          <nav className="flex-col gap-2" style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column' }}>
            {navItems.map((item, idx) => (
              <NavLink 
                key={idx} 
                to={item.path} 
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `flex items-center gap-4 ${isActive ? 'active-nav' : 'idle-nav'}`}
                style={({ isActive }) => ({
                  padding: '0.75rem 1rem', borderRadius: '8px', color: isActive ? 'white' : 'var(--text-muted)',
                  background: isActive ? 'var(--brand-primary-dim)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--brand-primary)' : '3px solid transparent',
                  transition: 'all 0.2s', display: 'flex'
                })}
              >
                {item.icon}
                <span style={{ fontWeight: 500 }}>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div style={{ padding: '0 1.5rem' }}>
          <button onClick={handleLogout} className="flex items-center gap-2 idle-nav" style={{ width: '100%', background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', padding: '0.75rem 1rem', textAlign: 'left', display: 'flex' }}>
            <LogOut size={20} />
            <span style={{ fontWeight: 500 }}>{t('logout')}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-col" style={{ flex: 1, overflowY: 'auto' }}>
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between" style={{ padding: '1rem', borderBottom: '1px solid var(--panel-border)', display: 'flex' }}>
          <span className="gradient-text" style={{ fontWeight: 'bold' }}>{t('app_name')}</span>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Global Desktop Header area with Lang Selector */}
        <div className="hidden md:flex justify-end" style={{ padding: '1rem 2rem 0 2rem' }}>
           <LanguageSelector />
        </div>

        <div style={{ padding: '1rem 2rem 2rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <Routes>
            <Route path="/" element={<Overview profile={userProfile} />} />
            <Route path="market" element={<MarketIntegration profile={userProfile} />} />
            <Route path="prices" element={<PricesIntegration />} />
            <Route path="chat" element={<ChatIntegration />} />
            <Route path="call" element={<CallIntegration />} />
            <Route path="verify" element={<VerifyIntegration />} />
            <Route path="post" element={<PostIntegration currentUserEmail={userEmail} />} />
            <Route path="profile" element={<ProfileSection profile={userProfile} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

// ------ Working Views ------ //

function Overview({ profile }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [posts, setPosts] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingPrices, setLoadingPrices] = useState(true);

  useEffect(() => {
    fetch('/api-app/posts')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setPosts(d.slice(0, 3)); })
      .catch(() => {})
      .finally(() => setLoadingPosts(false));
    fetch('/api-price/prices')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setPrices(d.slice(0, 4)); })
      .catch(() => {})
      .finally(() => setLoadingPrices(false));
  }, []);

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? '🌅 Good Morning' : hour < 17 ? '☀️ Good Afternoon' : '🌙 Good Evening';
  const displayName = profile?.name || 'Farmer';
  const isFarmer = (profile?.role || 'farmer') === 'farmer';

  const quickLinks = [
    { label: 'Marketplace', icon: '🏪', path: '/dashboard/market', color: 'rgba(16,185,129,0.15)', accent: 'var(--brand-primary)', desc: 'Buy & sell produce' },
    { label: 'Price Tracker', icon: '📈', path: '/dashboard/prices', color: 'rgba(14,165,233,0.15)', accent: 'var(--brand-secondary)', desc: 'Live mandi rates' },
    { label: 'Agri ChatBot', icon: '💬', path: '/dashboard/chat', color: 'rgba(99,102,241,0.15)', accent: '#818cf8', desc: 'Get expert advice' },
    { label: 'Voice Agent', icon: '📞', path: '/dashboard/call', color: 'rgba(245,158,11,0.15)', accent: '#f59e0b', desc: 'AI call assistant' },
    { label: 'Harvest Feed', icon: '🌾', path: '/dashboard/post', color: 'rgba(16,185,129,0.12)', accent: 'var(--brand-primary)', desc: 'Share your harvest' },
    { label: 'My Profile', icon: '👤', path: '/dashboard/profile', color: 'rgba(239,68,68,0.12)', accent: '#f87171', desc: 'View & edit info' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── Welcome Hero ── */}
      <div className="glass-panel" style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(14,165,233,0.06) 100%)',
        borderLeft: '4px solid var(--brand-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'
      }}>
        <div>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 0.25rem', fontSize: '0.85rem' }}>{greeting}</p>
          <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.75rem' }}>
            Welcome back, <span className="gradient-text">{displayName}</span>! 🙏
          </h1>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{
              padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
              background: isFarmer ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)',
              color: isFarmer ? 'var(--brand-primary)' : '#818cf8',
              border: `1px solid ${isFarmer ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.3)'}`
            }}>
              {isFarmer ? '🚜 Farmer' : '🏪 Vendor'}
            </span>
            {profile?.field_location && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 {profile.field_location}</span>
            )}
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              🕐 {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </div>
        <div style={{ fontSize: '4rem', opacity: 0.7 }}>{isFarmer ? '🌱' : '🤝'}</div>
      </div>

      {/* ── Stats Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Active Tools', value: '6', icon: '⚙️', color: 'var(--brand-primary)', sub: 'Always on' },
          { label: 'Harvest Posts', value: loadingPosts ? '…' : posts.length > 0 ? `${posts.length}+` : '0', icon: '📸', color: 'var(--brand-secondary)', sub: 'In feed' },
          { label: 'Live Price Data', value: loadingPrices ? '…' : `${prices.length}`, icon: '📊', color: '#f59e0b', sub: 'Commodities' },
          { label: 'AI Agents', value: '2', icon: '🤖', color: '#818cf8', sub: 'Chat + Voice' },
          { label: 'Platform', value: 'Krishi Setu', icon: '🌾', color: 'var(--brand-primary)', sub: 'Connected' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel" style={{
            padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem',
            borderTop: `3px solid ${stat.color}`, transition: 'transform 0.2s',
            cursor: 'default'
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <span style={{ fontSize: '1.6rem' }}>{stat.icon}</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 700, color: stat.color }}>{stat.value}</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>{stat.label}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{stat.sub}</span>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h3 style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Access</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem' }}>
          {quickLinks.map((link, i) => (
            <button
              key={i}
              onClick={() => navigate(link.path, { state: location.state })}
              style={{
                background: link.color, border: `1px solid ${link.accent}33`,
                borderRadius: '12px', padding: '1.25rem 1rem',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', gap: '0.4rem'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${link.accent}22`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <span style={{ fontSize: '1.75rem' }}>{link.icon}</span>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: link.accent }}>{link.label}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{link.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Bottom Row: Prices + Recent Posts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

        {/* Live Price Snapshot */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem' }}>📊 Live Price Snapshot</h3>
            <button onClick={() => navigate('/dashboard/prices', { state: location.state })}
              style={{ background: 'transparent', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
              View All →
            </button>
          </div>
          {loadingPrices ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Fetching live rates…</p>
          ) : prices.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No price data available yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {prices.map((p, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)'
                }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</span>
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{p.category}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700 }}>₹{p.current_price}</span>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.4rem', borderRadius: '4px',
                      background: p.percentage_change >= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                      color: p.percentage_change >= 0 ? 'var(--brand-primary)' : 'var(--danger)'
                    }}>
                      {p.percentage_change >= 0 ? '▲' : '▼'} {Math.abs(p.percentage_change)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Harvest Posts */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem' }}>🌾 Recent Harvests</h3>
            <button onClick={() => navigate('/dashboard/post', { state: location.state })}
              style={{ background: 'transparent', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
              View All →
            </button>
          </div>
          {loadingPosts ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading feed…</p>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No harvests shared yet.</p>
              <button onClick={() => navigate('/dashboard/post', { state: location.state })} className="btn-primary" style={{ marginTop: '0.75rem', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                Share First Harvest!
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {posts.map((post, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                  padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)'
                }}>
                  {post.image_url ? (
                    <img src={post.image_url} alt="" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.2rem' }}>🌿</div>
                  )}
                  <div style={{ overflow: 'hidden' }}>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                      {post.description || 'Harvest posted'}
                    </p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {post.timestamp ? new Date(post.timestamp).toLocaleDateString('en-IN') : ''} · ❤️ {post.likes_count || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Agricultural Tips Banner ── */}
      <div className="glass-panel" style={{
        padding: '1.25rem 1.5rem',
        background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(16,185,129,0.06))',
        borderLeft: '3px solid #f59e0b',
        display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: '1.5rem' }}>💡</span>
        <div>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f59e0b' }}>Agri Tip of the Day</span>
          <p style={{ margin: '0.1rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {[
              'Use drip irrigation to save up to 50% water while boosting crop yield.',
              'Crop rotation helps control pests naturally and improves soil health.',
              'Early morning is the best time to apply pesticides — less evaporation, better absorption.',
              'Test your soil pH before planting — most crops thrive between 6.0 and 7.0.',
              'Intercropping legumes with cereals can naturally fix nitrogen in the soil.',
            ][new Date().getDay() % 5]}
          </p>
        </div>
      </div>

    </div>
  );
}

function MarketIntegration({ profile }) {
  const isFarmer = (profile?.role || 'farmer') === 'farmer';
  const [tab, setTab] = useState(isFarmer ? 'my' : 'browse');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('ok'); // 'ok' | 'err'
  const [search, setSearch] = useState('');
  const [cartQtys, setCartQtys] = useState({}); // productId -> qty

  // Add product form
  const [form, setForm] = useState({ name: '', price_per_kg: '', available_quantity: '' });
  const [adding, setAdding] = useState(false);

  const showMsg = (text, type = 'ok') => { setMsg(text); setMsgType(type); setTimeout(() => setMsg(''), 4000); };

  const fetchProducts = () => {
    setLoading(true);
    fetch('/api-main/products')
      .then(r => r.json())
      .then(d => Array.isArray(d) ? setProducts(d) : setProducts([]))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  // My listings (farmer only)
  const myProducts = products.filter(p => p.farmer_id === profile?.id);
  // All products for vendors
  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!profile?.id) return showMsg('Profile not loaded properly. Please log in again.', 'err');
    setAdding(true);
    try {
      const res = await fetch('/api-main/add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmer_id: profile.id, name: form.name, price_per_kg: parseFloat(form.price_per_kg), available_quantity: parseFloat(form.available_quantity) })
      });
      const data = await res.json();
      if (res.ok) {
        showMsg('✅ Product listed successfully!');
        setForm({ name: '', price_per_kg: '', available_quantity: '' });
        fetchProducts();
      } else {
        showMsg(`❌ ${data.detail || 'Failed to list product'}`, 'err');
      }
    } catch { showMsg('❌ Server error', 'err'); }
    finally { setAdding(false); }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Remove this product from the marketplace?')) return;
    try {
      const res = await fetch(`/api-main/delete-product/${productId}?farmer_id=${profile.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) { showMsg('✅ Product removed.'); fetchProducts(); }
      else showMsg(`❌ ${data.detail || 'Could not remove'}`, 'err');
    } catch { showMsg('❌ Server error', 'err'); }
  };

  const handleOrder = async (product) => {
    const qty = parseFloat(cartQtys[product.id] || 1);
    if (qty <= 0 || qty > product.available_quantity) return showMsg('❌ Invalid quantity', 'err');
    try {
      const res = await fetch('/api-main/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor_id: profile?.id || 0, farmer_id: product.farmer_id, items: [{ product_id: product.id, quantity: qty }] })
      });
      const data = await res.json();
      if (res.ok) {
        showMsg(`✅ Order placed! ₹${(qty * product.price_per_kg).toFixed(2)} for ${qty}kg of ${product.name}`);
        setCartQtys(q => ({ ...q, [product.id]: 1 }));
        fetchProducts();
      } else showMsg(`❌ ${data.detail || 'Order failed'}`, 'err');
    } catch { showMsg('❌ Server error', 'err'); }
  };

  const categoryEmoji = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('rice') || n.includes('wheat') || n.includes('corn')) return '🌾';
    if (n.includes('tomato') || n.includes('potato') || n.includes('onion') || n.includes('vegetable')) return '🥦';
    if (n.includes('mango') || n.includes('banana') || n.includes('apple') || n.includes('fruit')) return '🍎';
    if (n.includes('milk') || n.includes('dairy')) return '🥛';
    if (n.includes('cotton') || n.includes('sugar')) return '🌿';
    return '🛒';
  };

  const inputStyle = { padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid var(--panel-border)', fontSize: '0.9rem', width: '100%' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>🏪 Agri Marketplace</h2>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {isFarmer ? 'List your produce and manage your inventory.' : 'Browse fresh farm produce and place orders directly.'}
          </p>
        </div>
        <span style={{
          padding: '0.3rem 1rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
          background: isFarmer ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)',
          color: isFarmer ? 'var(--brand-primary)' : '#818cf8'
        }}>
          {isFarmer ? '🚜 Farmer View' : '🏪 Vendor View'}
        </span>
      </div>

      {/* Toast */}
      {msg && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem',
          background: msgType === 'ok' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          color: msgType === 'ok' ? 'var(--brand-primary)' : 'var(--danger)',
          border: `1px solid ${msgType === 'ok' ? 'rgba(16,185,129,0.3)' : 'var(--danger)'}`
        }}>{msg}</div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem' }}>
        {isFarmer && (
          <button onClick={() => setTab('my')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '6px 6px 0 0', fontWeight: 600, fontSize: '0.9rem',
              color: tab === 'my' ? 'var(--brand-primary)' : 'var(--text-muted)',
              borderBottom: tab === 'my' ? '2px solid var(--brand-primary)' : '2px solid transparent' }}>
            📦 My Listings
          </button>
        )}
        <button onClick={() => setTab('browse')}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '6px 6px 0 0', fontWeight: 600, fontSize: '0.9rem',
            color: tab === 'browse' ? 'var(--brand-primary)' : 'var(--text-muted)',
            borderBottom: tab === 'browse' ? '2px solid var(--brand-primary)' : '2px solid transparent' }}>
          🔍 Browse All ({products.length})
        </button>
        {isFarmer && (
          <button onClick={() => setTab('add')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '6px 6px 0 0', fontWeight: 600, fontSize: '0.9rem',
              color: tab === 'add' ? 'var(--brand-primary)' : 'var(--text-muted)',
              borderBottom: tab === 'add' ? '2px solid var(--brand-primary)' : '2px solid transparent' }}>
            ➕ List New Product
          </button>
        )}
      </div>

      {/* ── Tab: My Listings (Farmer) ── */}
      {tab === 'my' && isFarmer && (
        <div>
          {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
          : myProducts.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>You haven't listed any products yet.</p>
              <button onClick={() => setTab('add')} className="btn-primary">List Your First Product →</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {myProducts.map(p => (
                <div key={p.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '3px solid var(--brand-primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.5rem' }}>{categoryEmoji(p.name)}</span>
                    <button onClick={() => handleDelete(p.id)}
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger)', borderRadius: '6px', cursor: 'pointer', padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>
                      Remove
                    </button>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>{p.name}</h3>
                  <p style={{ margin: 0, color: 'var(--brand-primary)', fontWeight: 700, fontSize: '1.1rem' }}>₹{p.price_per_kg}/kg</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Stock: {p.available_quantity} kg</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Browse All ── */}
      {tab === 'browse' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Search */}
          <input className="input-glass"
            style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--panel-border)', fontSize: '0.9rem' }}
            placeholder="🔍  Search produce (e.g. Tomato, Wheat, Mango)…"
            value={search} onChange={e => setSearch(e.target.value)} />

          {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading marketplace…</p>
          : filtered.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>{search ? 'No matching products found.' : 'No products listed yet. Check back soon!'}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1.25rem' }}>
              {filtered.map(p => (
                <div key={p.id} className="glass-panel" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {/* Card top colour bar */}
                  <div style={{ height: '6px', background: 'linear-gradient(90deg, var(--brand-primary), var(--brand-secondary))' }} />
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '2rem' }}>{categoryEmoji(p.name)}</span>
                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.7rem',
                        background: p.available_quantity > 50 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                        color: p.available_quantity > 50 ? 'var(--brand-primary)' : '#f59e0b'
                      }}>
                        {p.available_quantity > 50 ? '● In Stock' : '⚠ Low Stock'}
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{p.name}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--brand-primary)' }}>₹{p.price_per_kg}<span style={{ fontSize: '0.8rem', fontWeight: 400 }}>/kg</span></span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.available_quantity} kg left</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      🚜 <span>{p.farmer_name}</span>
                      {p.farmer_location && <span>· 📍 {p.farmer_location}</span>}
                    </div>
                  </div>
                  {/* Order row */}
                  <div style={{ padding: '0.75rem 1.5rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {!isFarmer ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden', flex: 1 }}>
                          <button onClick={() => setCartQtys(q => ({ ...q, [p.id]: Math.max(1, (parseFloat(q[p.id]) || 1) - 1) }))}
                            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0.4rem 0.6rem', fontSize: '1rem' }}>−</button>
                          <span style={{ flex: 1, textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>{cartQtys[p.id] || 1} kg</span>
                          <button onClick={() => setCartQtys(q => ({ ...q, [p.id]: Math.min(p.available_quantity, (parseFloat(q[p.id]) || 1) + 1) }))}
                            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0.4rem 0.6rem', fontSize: '1rem' }}>+</button>
                        </div>
                        <button onClick={() => handleOrder(p)} className="btn-primary"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                          Order · ₹{((cartQtys[p.id] || 1) * p.price_per_kg).toFixed(0)}
                        </button>
                      </>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Your listing — visible to vendors</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Add Product (Farmer) ── */}
      {tab === 'add' && isFarmer && (
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '480px' }}>
          <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem' }}>📦 List a New Product</h3>
          <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Product / Crop Name</label>
              <input type="text" required className="input-glass" style={inputStyle}
                placeholder="e.g. Red Onion, Basmati Rice, Alphonso Mango"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Price per kg (₹)</label>
                <input type="number" required min="0.01" step="0.01" className="input-glass" style={inputStyle}
                  placeholder="e.g. 45"
                  value={form.price_per_kg} onChange={e => setForm(f => ({ ...f, price_per_kg: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Available qty (kg)</label>
                <input type="number" required min="0.1" step="0.1" className="input-glass" style={inputStyle}
                  placeholder="e.g. 200"
                  value={form.available_quantity} onChange={e => setForm(f => ({ ...f, available_quantity: e.target.value }))} />
              </div>
            </div>
            {form.name && form.price_per_kg && (
              <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.82rem' }}>
                <strong>Preview:</strong> {form.name} — ₹{form.price_per_kg}/kg · {form.available_quantity || 0} kg · {categoryEmoji(form.name)}
              </div>
            )}
            <button type="submit" disabled={adding} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {adding ? 'Listing…' : '✓ Publish to Marketplace'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}

function PricesIntegration() {
  const { t } = useTranslation();
  const [prices, setPrices] = useState([]);
  const [summary, setSummary] = useState({ average_increase: 0, average_decrease: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    setLoading(true);
    fetch('/api-price/prices')
      .then(r => r.json())
      .then(data => { if(Array.isArray(data)) setPrices(data); })
      .catch(e => console.error("Price DB likely empty", e))
      .finally(() => setLoading(false));

    fetch('/api-price/summary')
      .then(r => r.json())
      .then(setSummary)
      .catch(() => {});
  }, []);

  const filteredPrices = prices.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'vegetable', name: 'Vegetables' },
    { id: 'fruit', name: 'Fruits' },
    { id: 'field_crop', name: 'Field Crops' },
    { id: 'flower', name: 'Flowers' }
  ];

  return (
    <div className="flex-col gap-8" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ marginBottom: '0.5rem' }}>{t('nav_prices')}</h2>
        <p style={{ color: 'var(--text-muted)' }}>{t('prices_desc')}</p>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', flex: 1, minWidth: '250px', background: 'linear-gradient(135deg, rgba(16,185,129,0.1), transparent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.5rem', background: 'var(--brand-primary)', borderRadius: '8px' }}>
              <ArrowUpRight color="white" size={24} />
            </div>
            <h4 style={{ margin: 0, color: 'var(--text-muted)' }}>{t('avg_increase')}</h4>
          </div>
          <span style={{ color: 'var(--brand-primary)', fontSize: '2.5rem', fontWeight: 'bold' }}>+{summary.average_increase}%</span>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'rgba(16,185,129,0.7)' }}>Market is trending upwards</p>
        </div>
        
        <div className="glass-panel" style={{ padding: '1.5rem', flex: 1, minWidth: '250px', background: 'linear-gradient(135deg, rgba(239,68,68,0.1), transparent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.5rem', background: 'var(--danger)', borderRadius: '8px' }}>
              <ArrowDownRight color="white" size={24} />
            </div>
            <h4 style={{ margin: 0, color: 'var(--text-muted)' }}>{t('avg_decrease')}</h4>
          </div>
          <span style={{ color: 'var(--danger)', fontSize: '2.5rem', fontWeight: 'bold' }}>{summary.average_decrease}%</span>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'rgba(239,68,68,0.7)' }}>Some prices are dropping</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => setSelectedCategory(cat.id)}
                className={selectedCategory === cat.id ? 'btn-primary' : 'btn-outline'}
                style={{ padding: '0.5rem 1.25rem', borderRadius: '20px', fontSize: '0.85rem' }}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <input 
            className="input-glass" 
            style={{ padding: '0.75rem 1rem', borderRadius: '8px', minWidth: '250px' }} 
            placeholder="Search commodity (e.g. Potato, Apple)..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>Fetching live mandi prices...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--panel-border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '1rem 0.5rem' }}>COMMODITY</th>
                  <th style={{ padding: '1rem 0.5rem' }}>CATEGORY</th>
                  <th style={{ padding: '1rem 0.5rem' }}>CURRENT RATE (₹/KG)</th>
                  <th style={{ padding: '1rem 0.5rem' }}>TREND</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrices.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} className="hover-row">
                    <td style={{ padding: '1.25rem 0.5rem', fontWeight: 'bold' }}>{p.name}</td>
                    <td style={{ padding: '1.25rem 0.5rem' }}>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        {p.category}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 0.5rem', fontSize: '1.1rem' }}>₹{p.current_price}</td>
                    <td style={{ padding: '1.25rem 0.5rem', color: p.percentage_change >= 0 ? 'var(--brand-primary)' : 'var(--danger)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold' }}>
                        {p.percentage_change >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                        {Math.abs(p.percentage_change)}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPrices.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>No data matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatIntegration() {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [inputMsg, setInputMsg] = useState('');

  const fetchHistory = () => {
    fetch('/api-chat/chat/history/1/2')
      .then(r => r.json()).then(data => { if(Array.isArray(data)) setHistory(data); }).catch(console.error);
  };

  useEffect(() => {
    fetchHistory();
    const inv = setInterval(fetchHistory, 3000);
    return () => clearInterval(inv);
  }, []);

  const sendMsg = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    await fetch('/api-chat/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender_id: 1, sender_role: 'Farmer', receiver_id: 2, receiver_role: 'Vendor', message: inputMsg })
    });
    setInputMsg('');
    fetchHistory();
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', height: '600px', display: 'flex', flexDirection: 'column' }}>
      <h2>{t('nav_chat')}</h2>
      <p style={{ color: 'var(--text-muted)' }}>{t('chat_desc')}</p>
      
      <div style={{ flex: 1, margin: '1rem 0', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {history.length === 0 ? <span style={{ margin: 'auto', color: 'var(--text-muted)' }}>No messages yet.</span> :
          history.map((msg, i) => (
            <div key={i} style={{ 
              background: msg.sender_id === 1 ? 'var(--brand-primary-dim)' : 'rgba(255,255,255,0.05)', 
              padding: '0.75rem', borderRadius: '8px', alignSelf: msg.sender_id === 1 ? 'flex-end' : 'flex-start',
              border: msg.sender_id === 1 ? '1px solid var(--brand-primary)' : '1px solid var(--panel-border)',
              maxWidth: '80%'
            }}>
              {msg.message}
            </div>
          ))}
      </div>
      
      <form onSubmit={sendMsg} style={{ display: 'flex', gap: '1rem' }}>
        <input className="input-glass" style={{ flex: 1, padding: '1rem', borderRadius: '8px' }} placeholder={t('type_message')} value={inputMsg} onChange={e => setInputMsg(e.target.value)} />
        <button type="submit" className="btn-primary">{t('send')}</button>
      </form>
    </div>
  );
}

function CallIntegration() {
  const { t, i18n } = useTranslation();
  const [inputText, setInputText] = useState('');
  const [reply, setReply] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [speed, setSpeed] = useState('normal'); 
  const [audioUrl, setAudioUrl] = useState('');
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }
    const recognition = new SpeechRecognition();
    const langMap = { en: "en-IN", hi: "hi-IN", te: "te-IN", ta: "ta-IN", kn: "kn-IN", ml: "ml-IN" };
    recognition.lang = langMap[i18n.language.substring(0, 2)] || "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => setInputText(event.results[0][0].transcript);
    recognition.onerror = (event) => { console.error(event.error); setIsListening(false); };
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const simulateAICall = async (e) => {
    e.preventDefault();
    if (!inputText) return;
    setIsCalling(true);
    setReply('');
    setAudioUrl('');
    try {
      const r = await fetch('/api-call/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputText })
      });
      const data = await r.json();
      
      const match = data.reply.match(/^\[([a-z]{2}-[A-Z]{2})\]/);
      let detectedLang = match ? match[1] : null;
      
      const cleanReply = data.reply.replace(/^\[[a-z]{2}-[A-Z]{2}\]\s*/, '');
      setReply(cleanReply);
      
      if (!detectedLang) {
        const langMap = { en: "en-IN", hi: "hi-IN", te: "te-IN", ta: "ta-IN", kn: "kn-IN", ml: "ml-IN" };
        detectedLang = langMap[i18n.language.substring(0, 2)] || "en-IN";
      }
      
      const newAudioUrl = `/api-call/tts?text=${encodeURIComponent(cleanReply)}&lang=${detectedLang}&speed=${speed}`;
      setAudioUrl(newAudioUrl);
      
      const audio = new Audio(newAudioUrl);
      audio.play();

    } catch (e) {
      console.error(e);
      setReply("Failed to reach Call Agent AI Service.");
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <PhoneCall size={32} color="var(--brand-secondary)" />
        <h2 style={{ margin: 0 }}>{t('nav_voice')}</h2>
      </div>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{t('call_desc')}</p>
      
      <form onSubmit={simulateAICall} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <textarea className="input-glass" style={{ padding: '1rem', borderRadius: '8px', minHeight: '100px', width: '100%', paddingRight: '3rem' }} placeholder={t('describe_issue')} value={inputText} onChange={e => setInputText(e.target.value)} />
          <button type="button" onClick={startListening} title="Voice Input" style={{ position: 'absolute', right: '1rem', bottom: '1rem', background: isListening ? 'var(--danger)' : 'var(--brand-secondary)', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mic size={18} color="white" />
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button type="submit" className="btn-primary" disabled={isCalling} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <PhoneCall size={18} /> {isCalling ? t('agent_thinking') : t('initiate_call')}
          </button>
          
          <select 
            value={speed} 
            onChange={(e) => setSpeed(e.target.value)}
            className="input-glass"
            style={{ padding: '0.85rem', borderRadius: '8px', cursor: 'pointer', outline: 'none' }}
          >
            <option value="slow">Slow Voice</option>
            <option value="normal">Normal Voice</option>
            <option value="fast">Fast Voice</option>
          </select>
        </div>
      </form>

      {reply && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '3px solid var(--brand-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
             <p style={{ fontWeight: 'bold', margin: 0 }}>Agent Transcribed Reply:</p>
             {audioUrl && (
               <button 
                 onClick={() => new Audio(audioUrl).play()}
                 className="btn-outline"
                 style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
               >
                 Replay Audio
               </button>
             )}
          </div>
          <p>{reply}</p>
        </div>
      )}
    </div>
  );
}

function VerifyIntegration() {
  const { t } = useTranslation();

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <ShieldCheck size={32} color="var(--brand-primary)" />
        <h2 style={{ margin: 0 }}>{t('nav_verify')}</h2>
      </div>
      <p style={{ color: 'var(--text-muted)' }}>{t('upload_desc')}</p>
      
      <div style={{ padding: '3rem', textAlign: 'center', borderRadius: '8px', margin: '2rem 0', background: 'rgba(0,0,0,0.2)' }}>
        <p>Quality check requests are currently being processed manually.</p>
        <button className="btn-primary" style={{ marginTop: '1rem' }}>Contact Verification Office</button>
      </div>
    </div>
  );
}

function PostIntegration({ currentUserEmail }) {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api-app/posts');
      const data = await res.json();
      if (Array.isArray(data)) setPosts(data);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file && !description) return;
    setStatus('Posting harvest...');

    const formData = new FormData();
    if (file) {
      if (file.type.startsWith('video/')) {
        formData.append('video', file);
      } else {
        formData.append('image', file);
      }
    }
    if (description) {
      formData.append('description', description);
    }
    formData.append('author_email', currentUserEmail);

    try {
      const res = await fetch('/api-app/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if(res.ok) {
        setStatus(`Successfully posted!`);
        setFile(null);
        setDescription('');
        fetchPosts(); // Refresh feed
      } else {
        setStatus(`Error: ${data.detail || 'Posting failed'}`);
      }
    } catch(err) {
      setStatus('Service error. Is the backend running?');
    }
  };

  return (
    <div className="flex-col gap-8" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <Upload size={32} color="var(--brand-primary)" />
          <h2 style={{ margin: 0 }}>{t('nav_post')}</h2>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>{t('post_desc')}</p>
        
        <form onSubmit={handleUpload} style={{ border: '1px solid var(--panel-border)', padding: '2rem', borderRadius: '8px', margin: '2rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(0,0,0,0.2)' }}>
          <textarea 
            className="input-glass" 
            style={{ padding: '1rem', borderRadius: '8px', minHeight: '80px', width: '100%', fontSize: '1rem' }} 
            placeholder="What did you harvest today? Share details, tips, or stories..." 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
              <Upload size={20} color="var(--brand-primary)" />
              <input type="file" onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} accept="image/*,video/*" />
              <span style={{ color: file ? 'white' : 'var(--text-muted)', fontSize: '0.9rem' }}>{file ? file.name : 'Photo / Video'}</span>
            </label>
            <button type="submit" disabled={!file && !description} className="btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px' }}>Post to Feed</button>
          </div>
        </form>
        
        {status && <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--brand-primary)', marginBottom: '1rem' }}>{status}</div>}
      </div>

      <div className="flex-col gap-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Recent Harvests</h3>
        
        {loading && <p style={{ color: 'var(--text-muted)' }}>Loading feed...</p>}
        {!loading && posts.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No harvests shared yet. Be the first!</p>}
        
        {posts.map((post) => (
          <HarvestPostCard key={post.id} post={post} currentUserEmail={currentUserEmail} onDelete={() => fetchPosts()} />
        ))}
      </div>
    </div>
  );
}

function HarvestPostCard({ post, currentUserEmail, onDelete }) {
  const [likes, setLikes] = useState(post.likes_count || 0);
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = post.author_email === currentUserEmail;

  const handleLike = async () => {
    try {
      const res = await fetch(`/api-app/posts/${post.id}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes_count);
        setLiked(true);
      }
    } catch (err) { console.error(err); }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api-app/posts/${post.id}/comments`);
      const data = await res.json();
      if (Array.isArray(data)) setComments(data);
    } catch (err) { console.error(err); }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`/api-app/posts/${post.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment })
      });
      if (res.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (err) { console.error(err); }
  };

  const handleShare = () => {
    const shareUrl = window.location.href; 
    navigator.clipboard.writeText(shareUrl).then(() => {
      setIsSharing(true);
      setTimeout(() => setIsSharing(false), 2000);
    });
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api-app/posts/${post.id}?email=${currentUserEmail}`, { method: 'DELETE' });
      if (res.ok) {
        onDelete();
      } else {
        alert("Failed to delete post.");
        setIsDeleting(false);
      }
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (showComments) fetchComments();
  }, [showComments]);

  return (
    <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--panel-border)' }}>
      {/* Post Header */}
      <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--brand-primary), var(--brand-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
          F
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Farmer</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {new Date(post.timestamp).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Post Content */}
      {post.description && (
        <div style={{ padding: '1rem', fontSize: '1rem', lineHeight: '1.5' }}>
          {post.description}
        </div>
      )}

      {/* Media */}
      {post.image_url && (
        <img src={post.image_url} alt="Harvest" style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', display: 'block' }} />
      )}
      {post.video_url && (
        <video controls style={{ width: '100%', maxHeight: '500px', background: 'black', display: 'block' }}>
          <source src={post.video_url} />
        </video>
      )}

      {/* Interaction Bar */}
      <div style={{ padding: '0.75rem 1rem', display: 'flex', gap: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button 
          onClick={handleLike} 
          style={{ background: 'transparent', border: 'none', color: liked ? 'var(--brand-primary)' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: 0 }}
        >
          <Heart size={20} fill={liked ? 'var(--brand-primary)' : 'transparent'} />
          <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{likes}</span>
        </button>
        
        <button 
          onClick={() => setShowComments(!showComments)} 
          style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: 0 }}
        >
          <MessageCircle size={20} />
          <span style={{ fontSize: '0.9rem' }}>Comment</span>
        </button>

        <button 
          onClick={handleShare}
          style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: 0 }}
        >
          <Share2 size={20} />
          <span style={{ fontSize: '0.9rem' }}>{isSharing ? 'Copied!' : 'Share'}</span>
        </button>

        {isOwner && (
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isDeleting ? 0.5 : 1 }}
          >
            <X size={18} />
            <span style={{ fontSize: '0.9rem' }}>{isDeleting ? 'Deleting...' : 'Delete'}</span>
          </button>
        )}
      </div>

      {/* Comments Section */}
      {showComments && (
        <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.1)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
            {comments.map(c => (
              <div key={c.id} style={{ fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>{c.user_name}</span>
                <span style={{ color: 'rgba(255,255,255,0.8)' }}>{c.text}</span>
              </div>
            ))}
            {comments.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No comments yet.</p>}
          </div>
          
          <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              className="input-glass" 
              style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.85rem', borderRadius: '4px' }} 
              placeholder="Add a comment..." 
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Post</button>
          </form>
        </div>
      )}
    </div>
  );
}

// ==================== PROFILE SECTION ==================== //

function ProfileSection({ profile }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [form, setForm] = useState({
    name: profile.name || '',
    phone: profile.phone || '',
    role: profile.role || 'farmer',
    field_location: profile.field_location || ''
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch('http://127.0.0.1:5000/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, email: profile.email })
      });
      const data = await res.json();
      if (res.ok) {
        setSaveMsg('✅ Profile updated successfully!');
        setEditing(false);
      } else {
        setSaveMsg(`❌ ${data.error || 'Update failed'}`);
      }
    } catch {
      setSaveMsg('❌ Could not reach server.');
    } finally {
      setSaving(false);
    }
  };

  const infoItems = [
    { icon: <UserCircle size={18} color="var(--brand-primary)" />, label: 'Full Name', value: form.name || 'Not set', field: 'name', type: 'text' },
    { icon: <Phone size={18} color="var(--brand-primary)" />, label: 'Phone Number', value: form.phone || 'Not set', field: 'phone', type: 'tel' },
    { icon: <Mail size={18} color="var(--brand-secondary)" />, label: 'Email Address', value: profile.email, field: null },
    { icon: <Tractor size={18} color="var(--brand-primary)" />, label: 'Role', value: form.role ? form.role.charAt(0).toUpperCase() + form.role.slice(1) : 'Farmer', field: 'role', type: 'select' },
    { icon: <MapPin size={18} color="var(--brand-secondary)" />, label: 'Field / Farm Location', value: form.field_location || 'Not set', field: 'field_location', type: 'text' },
  ];

  const avatarInitial = (form.name || profile.email || 'U')[0].toUpperCase();
  const isFarmer = form.role === 'farmer';

  return (
    <div className="flex-col gap-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Hero banner */}
      <div className="glass-panel" style={{
        padding: 0, overflow: 'hidden',
        background: `linear-gradient(135deg, rgba(16,185,129,0.12), rgba(14,165,233,0.08))`
      }}>
        <div style={{
          height: '100px',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(14,165,233,0.2))',
          position: 'relative'
        }} />
        <div style={{ padding: '0 2rem 2rem 2rem', marginTop: '-40px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 'bold', color: 'white',
              border: '3px solid var(--bg-dark)', flexShrink: 0
            }}>
              {avatarInitial}
            </div>
            <div style={{ paddingBottom: '0.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{form.name || 'Anonymous'}</h2>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{
                  padding: '0.2rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                  background: isFarmer ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)',
                  color: isFarmer ? 'var(--brand-primary)' : '#818cf8',
                  border: `1px solid ${isFarmer ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.3)'}`
                }}>
                  {isFarmer ? '🚜 Farmer' : '🏪 Vendor'}
                </span>
                {form.field_location && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={13} /> {form.field_location}
                  </span>
                )}
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              {!editing ? (
                <button
                  onClick={() => { setEditing(true); setSaveMsg(''); }}
                  className="btn-outline"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem' }}
                >
                  <Edit3 size={16} /> Edit Profile
                </button>
              ) : (
                <button
                  onClick={() => setEditing(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {saveMsg && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem',
          background: saveMsg.startsWith('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          color: saveMsg.startsWith('✅') ? 'var(--brand-primary)' : 'var(--danger)',
          border: `1px solid ${saveMsg.startsWith('✅') ? 'rgba(16,185,129,0.3)' : 'var(--danger)'}`
        }}>
          {saveMsg}
        </div>
      )}

      {/* Info / Edit Card */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Profile Information</h3>

        {!editing ? (
          // VIEW MODE
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {infoItems.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem', borderRadius: '10px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)'
              }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>{item.label}</div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // EDIT MODE
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {infoItems.map((item, idx) =>
              item.field === null ? (
                // Email is read-only
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1rem', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)', opacity: 0.6
                }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>{item.label} (cannot change)</div>
                    <div style={{ fontWeight: 500 }}>{item.value}</div>
                  </div>
                </div>
              ) : item.type === 'select' ? (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {item.icon} {item.label}
                  </label>
                  <div style={{ display: 'flex', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', padding: '0.3rem' }}>
                    {['farmer', 'vendor'].map(r => (
                      <button key={r} type="button" onClick={() => setForm(f => ({ ...f, role: r }))}
                        style={{
                          flex: 1, padding: '0.6rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                          fontWeight: 500, fontSize: '0.875rem',
                          background: form.role === r ? (r === 'farmer' ? 'var(--brand-primary)' : '#6366f1') : 'transparent',
                          color: form.role === r ? '#fff' : 'var(--text-muted)',
                          transition: '0.2s all'
                        }}
                      >
                        {r === 'farmer' ? '🚜 Farmer' : '🏪 Vendor'}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {item.icon} {item.label}
                  </label>
                  <input
                    type={item.type} className="input-glass"
                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--panel-border)', fontSize: '0.9rem' }}
                    value={form[item.field]}
                    onChange={e => setForm(f => ({ ...f, [item.field]: e.target.value }))}
                    required={item.field === 'name'}
                  />
                </div>
              )
            )}

            <button type="submit" disabled={saving} className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Check size={16} /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>

      {/* Stats card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Member Since', value: 'Active', icon: '🌱', color: 'var(--brand-primary)' },
          { label: 'Account Type', value: isFarmer ? 'Farmer' : 'Vendor', icon: isFarmer ? '🚜' : '🏪', color: isFarmer ? 'var(--brand-primary)' : '#818cf8' },
          { label: 'Platform', value: 'Krishi Setu', icon: '🌾', color: 'var(--brand-secondary)' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel" style={{
            padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
            borderTop: `2px solid ${stat.color}`
          }}>
            <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</span>
            <span style={{ fontWeight: 600, color: stat.color }}>{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
