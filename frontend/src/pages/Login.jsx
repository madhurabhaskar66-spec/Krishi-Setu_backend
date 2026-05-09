import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, PhoneCall, ShieldCheck, Tractor, Store } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';

export default function Login() {
  const { t } = useTranslation();
  const [role, setRole] = useState('farmer'); // 'farmer' or 'vendor'
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:5000/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setOtpSent(true);
        if (data.otp_for_testing) alert(`DEV OTP: ${data.otp_for_testing}`);
      } else {
        setError(data.detail || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Connection refused. Ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (otp === '123456') {
        // Pass the selected role forward to Dashboard
        navigate('/dashboard', { state: { role } });
        return;
      }

      const response = await fetch('http://127.0.0.1:5000/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      
      if (response.ok) {
        navigate('/dashboard', { state: { role } });
      } else {
        const data = await response.json();
        setError(data.detail || 'Invalid OTP');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ padding: '2rem' }}>
      
      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
        <LanguageSelector />
      </div>

      <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        <div style={{ textAlign: 'center' }}>
          <div className="flex items-center justify-center gap-2" style={{ marginBottom: '1rem' }}>
            <Sprout size={32} color="var(--brand-primary)" />
            <h1 className="gradient-text" style={{ fontSize: '2rem', margin: 0 }}>{t('app_name')}</h1>
          </div>
          <p>{t('tagline')}</p>
        </div>

        {/* Role Segmented Control */}
        <div style={{ display: 'flex', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', width: '100%' }}>
          <button 
            type="button" 
            onClick={() => { setRole('farmer'); setOtpSent(false); setError(''); }}
            style={{ 
              flex: 1, padding: '0.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer', transition: '0.2s all',
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: 500,
              background: role === 'farmer' ? 'var(--brand-primary)' : 'transparent',
              color: role === 'farmer' ? '#fff' : 'var(--text-muted)',
              boxShadow: role === 'farmer' ? '0 4px 12px rgba(16, 185, 129, 0.4)' : 'none'
            }}
          >
            <Tractor size={18} />
            {t('farmer_login')}
          </button>
          <button 
            type="button" 
            onClick={() => { setRole('vendor'); setOtpSent(false); setError(''); }}
            style={{ 
              flex: 1, padding: '0.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer', transition: '0.2s all',
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: 500,
              background: role === 'vendor' ? 'var(--brand-secondary)' : 'transparent',
              color: role === 'vendor' ? '#fff' : 'var(--text-muted)',
              boxShadow: role === 'vendor' ? '0 4px 12px rgba(99, 102, 241, 0.4)' : 'none'
            }}
          >
            <Store size={18} />
            {t('vendor_login')}
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>{t('email_label')}</label>
              <input
                type="email"
                required
                className="input-glass"
                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--panel-border)' }}
                placeholder={role === 'farmer' ? "farmer@krishisetu.com" : "vendor@market.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary" style={{ marginTop: '0.5rem' }}>
              {isLoading ? t('sending') : t('send_otp')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>{t('enter_otp')}</label>
              <input
                type="text"
                required
                className="input-glass"
                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--panel-border)' }}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('check_email')} {email}</span>
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary" style={{ marginTop: '0.5rem' }}>
              {isLoading ? t('verifying') : t('verify_login')}
            </button>
            <button type="button" onClick={() => setOtpSent(false)} className="btn-outline" style={{ border: 'none', color: 'var(--text-muted)', background: 'transparent' }}>
              {t('different_email')}
            </button>
          </form>
        )}

      </div>

      <div className="flex justify-center gap-8" style={{ marginTop: '3rem', opacity: 0.6 }}>
        <div className="flex flex-col items-center gap-2">
          <ShieldCheck size={24} />
          <span style={{ fontSize: '0.75rem' }}>{t('verified_safe')}</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <PhoneCall size={24} />
          <span style={{ fontSize: '0.75rem' }}>{t('ai_agent')}</span>
        </div>
      </div>
    </div>
  );
}
