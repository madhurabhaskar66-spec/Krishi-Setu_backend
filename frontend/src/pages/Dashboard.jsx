import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Store, MessageSquare, PhoneCall, LineChart, ShieldCheck, LogOut, Menu, X, ArrowUpRight, ArrowDownRight, Upload, Mic } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';

export default function Dashboard() {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => navigate('/');

  const navItems = [
    { name: t('nav_overview'), path: '/dashboard', end: true, icon: <LayoutDashboard size={20} /> },
    { name: t('nav_market'), path: '/dashboard/market', icon: <Store size={20} /> },
    { name: t('nav_prices'), path: '/dashboard/prices', icon: <LineChart size={20} /> },
    { name: t('nav_chat'), path: '/dashboard/chat', icon: <MessageSquare size={20} /> },
    { name: t('nav_voice'), path: '/dashboard/call', icon: <PhoneCall size={20} /> },
    { name: t('nav_verify'), path: '/dashboard/verify', icon: <ShieldCheck size={20} /> },
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
            <Route path="/" element={<Overview />} />
            <Route path="market" element={<MarketIntegration />} />
            <Route path="prices" element={<PricesIntegration />} />
            <Route path="chat" element={<ChatIntegration />} />
            <Route path="call" element={<CallIntegration />} />
            <Route path="verify" element={<VerifyIntegration />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

// ------ Working Views ------ //

function Overview() {
  const { t } = useTranslation();
  return (
    <div className="flex-col gap-6" style={{ display: 'flex', flexDirection: 'column' }}>
      <h1>{t('welcome')}</h1>
      <p>{t('overview_desc')}</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel flex-col gap-4" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div className="flex items-center justify-between" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>{t('active_tools')}</span>
            <ShieldCheck color="var(--brand-primary)" />
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>Krishi Apps</span>
        </div>
      </div>
    </div>
  );
}

function MarketIntegration() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    fetch('/api-main/products')
      .then(res => res.json())
      .then(data => (Array.isArray(data) ? setProducts(data) : setProducts([])))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h2>{t('nav_market')}</h2>
      <p>{t('market_desc')}</p>
      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        {products.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No products listed currently.</p> :
          products.map(p => (
            <div key={p.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
              <h3 style={{ margin: 0 }}>{p.name}</h3>
              <p style={{ color: 'var(--brand-primary)', fontWeight: 'bold' }}>₹{p.price_per_kg} / kg</p>
              <p style={{ fontSize: '0.85rem' }}>Available: {p.available_quantity}kg</p>
              <button className="btn-primary" style={{ padding: '0.5rem 1rem', marginTop: '0.5rem', width: '100%' }}>{t('buy')}</button>
            </div>
          ))}
      </div>
    </div>
  );
}

function PricesIntegration() {
  const { t } = useTranslation();
  const [prices, setPrices] = useState([]);
  const [summary, setSummary] = useState({ average_increase: 0, average_decrease: 0 });

  useEffect(() => {
    fetch('/api-price/prices').then(r => r.json()).then(setPrices).catch(e => console.error("Price DB likely empty", e));
    fetch('/api-price/summary').then(r => r.json()).then(setSummary).catch(() => {});
  }, []);

  return (
    <div className="flex-col gap-6" style={{ display: 'flex', flexDirection: 'column' }}>
      <h2>{t('prices_desc')}</h2>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', flex: 1, minWidth: '150px' }}>
          <h4 style={{ color: 'var(--text-muted)' }}>{t('avg_increase')}</h4>
          <span style={{ color: 'var(--brand-primary)', fontSize: '2rem', fontWeight: 'bold' }}>+{summary.average_increase}%</span>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', flex: 1, minWidth: '150px' }}>
          <h4 style={{ color: 'var(--text-muted)' }}>{t('avg_decrease')}</h4>
          <span style={{ color: 'var(--danger)', fontSize: '2rem', fontWeight: 'bold' }}>{summary.average_decrease}%</span>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '500px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--panel-border)' }}>
              <th style={{ padding: '1rem' }}>{t('commodity')}</th>
              <th style={{ padding: '1rem' }}>{t('current_price')}</th>
              <th style={{ padding: '1rem' }}>{t('trend')}</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((p, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--panel-border)' }}>
                <td style={{ padding: '1rem' }}>{p.name}</td>
                <td style={{ padding: '1rem' }}>₹{p.current_price}</td>
                <td style={{ padding: '1rem', color: p.percentage_change >= 0 ? 'var(--brand-primary)' : 'var(--danger)' }}>
                  {p.percentage_change >= 0 ? <ArrowUpRight size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }}/> : <ArrowDownRight size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }}/>}
                  {p.percentage_change}%
                </td>
              </tr>
            ))}
            {prices.length === 0 && <tr><td colSpan="3" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Listening for live market data or DB empty...</td></tr>}
          </tbody>
        </table>
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
      body: JSON.stringify({ sender_id: 1, receiver_id: 2, message_text: inputMsg })
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
              {msg.message_text}
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
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setStatus('Uploading and verifying...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api-verify/verification/apply/1', { method: 'POST', body: formData });
      const data = await res.json();
      if(res.ok) setStatus(`Success: ${data.message}`);
      else setStatus(`Error: ${data.detail}`);
    } catch(err) {
      setStatus('Verification service error. Is the backend running?');
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <ShieldCheck size={32} color="var(--brand-primary)" />
        <h2 style={{ margin: 0 }}>{t('nav_verify')}</h2>
      </div>
      <p style={{ color: 'var(--text-muted)' }}>{t('upload_desc')}</p>
      
      <form onSubmit={handleUpload} style={{ border: '2px dashed var(--panel-border)', padding: '3rem', textAlign: 'center', borderRadius: '8px', margin: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.2)' }}>
        <Upload size={48} color="var(--text-muted)" />
        <input type="file" onChange={e => setFile(e.target.files[0])} style={{ color: 'var(--text-main)' }} accept="image/*,video/*" />
        <button type="submit" disabled={!file} className="btn-primary" style={{ marginTop: '1rem' }}>{t('submit_cert')}</button>
      </form>
      
      {status && <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--brand-primary)' }}>{status}</div>}
    </div>
  );
}
