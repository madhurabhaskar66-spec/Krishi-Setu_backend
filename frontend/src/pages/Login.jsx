import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sprout, PhoneCall, ShieldCheck, Tractor, Store,
  User as UserIcon, Phone, Mail, MapPin, ArrowRight, ArrowLeft
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';

const API = 'http://127.0.0.1:5000';

// steps: 'email' | 'register' | 'otp'
export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // ----- shared state -----
  const [step, setStep] = useState('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // ----- step 1: email -----
  const [email, setEmail] = useState('');

  // ----- step 2R: register -----
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('farmer');
  const [fieldLocation, setFieldLocation] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);

  // ----- step 3: OTP -----
  const [otp, setOtp] = useState('');

  // ------------------------------------------------------------------ //
  // STEP 1 – Check if email exists
  // ------------------------------------------------------------------ //
  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/check-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to check user');
      setIsNewUser(!data.exists);
      if (data.exists) {
        // Known user → send OTP immediately, go to OTP step
        await sendOtp();
      } else {
        // New user → go to registration form
        setStep('register');
      }
    } catch (err) {
      setError(err.message || 'Connection refused. Ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------------------------------------------------ //
  // Shared OTP send
  // ------------------------------------------------------------------ //
  const sendOtp = async () => {
    const res = await fetch(`${API}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to send OTP');
    if (data.otp_for_testing) alert(`DEV OTP: ${data.otp_for_testing}`);
    setStep('otp');
  };

  // ------------------------------------------------------------------ //
  // STEP 2R – Register new user
  // ------------------------------------------------------------------ //
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, role, field_location: fieldLocation })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      // Registration success → send OTP
      await sendOtp();
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------------------------------------------------ //
  // STEP 3 – Verify OTP
  // ------------------------------------------------------------------ //
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      // Dev bypass
      if (otp !== '123456') {
        const res = await fetch(`${API}/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp })
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || 'Invalid OTP');
        }
      }

      // Fetch full profile
      const profileRes = await fetch(`${API}/get-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const profile = await profileRes.json();
      if (!profileRes.ok) throw new Error(profile.error || 'Could not load profile');

      navigate('/dashboard', { state: profile });
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------------------------------------------------ //
  // Shared helpers
  // ------------------------------------------------------------------ //
  const inputStyle = {
    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
    borderRadius: '8px',
    border: '1px solid var(--panel-border)',
    width: '100%',
    fontSize: '0.9rem'
  };

  const iconWrap = {
    position: 'relative',
    width: '100%',
    display: 'flex',
    alignItems: 'center'
  };

  const iconStyle = {
    position: 'absolute',
    left: '0.75rem',
    color: 'var(--text-muted)',
    pointerEvents: 'none'
  };

  const RoleToggle = () => (
    <div style={{
      display: 'flex', borderRadius: '8px',
      background: 'rgba(255,255,255,0.05)', padding: '0.4rem', width: '100%'
    }}>
      {['farmer', 'vendor'].map(r => (
        <button
          key={r}
          type="button"
          onClick={() => setRole(r)}
          style={{
            flex: 1, padding: '0.65rem', borderRadius: '6px', border: 'none',
            cursor: 'pointer', transition: '0.2s all',
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem',
            fontWeight: 500, fontSize: '0.875rem',
            background: role === r
              ? (r === 'farmer' ? 'var(--brand-primary)' : '#6366f1')
              : 'transparent',
            color: role === r ? '#fff' : 'var(--text-muted)',
            boxShadow: role === r
              ? (r === 'farmer'
                ? '0 4px 12px rgba(16,185,129,0.4)'
                : '0 4px 12px rgba(99,102,241,0.4)')
              : 'none'
          }}
        >
          {r === 'farmer' ? <Tractor size={16} /> : <Store size={16} />}
          {r === 'farmer' ? t('farmer_login') : t('vendor_login')}
        </button>
      ))}
    </div>
  );

  // ------------------------------------------------------------------ //
  // RENDER
  // ------------------------------------------------------------------ //
  return (
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ padding: '2rem' }}>

      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
        <LanguageSelector />
      </div>

      <div className="glass-panel" style={{
        padding: '2.5rem', width: '100%',
        maxWidth: step === 'register' ? '480px' : '400px',
        display: 'flex', flexDirection: 'column', gap: '1.75rem',
        transition: 'max-width 0.3s ease'
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div className="flex items-center justify-center gap-2" style={{ marginBottom: '0.5rem' }}>
            <Sprout size={30} color="var(--brand-primary)" />
            <h1 className="gradient-text" style={{ fontSize: '1.9rem', margin: 0 }}>{t('app_name')}</h1>
          </div>
          <p style={{ fontSize: '0.875rem' }}>
            {step === 'email' && t('tagline')}
            {step === 'register' && '📝 Create your Krishi Setu account'}
            {step === 'otp' && `🔐 Verify your email — ${email}`}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger)',
            color: 'var(--danger)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        {/* ===== STEP 1: EMAIL ===== */}
        {step === 'email' && (
          <form onSubmit={handleCheckEmail} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email Address</label>
              <div style={iconWrap}>
                <Mail size={16} style={iconStyle} />
                <input
                  type="email" required className="input-glass" style={inputStyle}
                  placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {isLoading ? 'Checking…' : <><span>Continue</span><ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        {/* ===== STEP 2R: REGISTER ===== */}
        {step === 'register' && (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">

            <div style={{
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '8px', padding: '0.6rem 0.9rem', fontSize: '0.8rem', color: 'var(--brand-primary)'
            }}>
              ✨ New here! Fill in your details to get started.
            </div>

            {/* Full Name */}
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Full Name</label>
              <div style={iconWrap}>
                <UserIcon size={16} style={iconStyle} />
                <input type="text" required className="input-glass" style={inputStyle}
                  placeholder="e.g. Ramesh Kumar"
                  value={name} onChange={e => setName(e.target.value)} />
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Phone Number</label>
              <div style={iconWrap}>
                <Phone size={16} style={iconStyle} />
                <input type="tel" required className="input-glass" style={inputStyle}
                  placeholder="e.g. 9876543210"
                  pattern="[0-9]{10}"
                  value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </div>

            {/* Email (pre-filled, read-only) */}
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email Address</label>
              <div style={iconWrap}>
                <Mail size={16} style={iconStyle} />
                <input type="email" className="input-glass" style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }}
                  value={email} readOnly />
              </div>
            </div>

            {/* Role */}
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>I am a…</label>
              <RoleToggle />
            </div>

            {/* Field Location */}
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Field / Farm Location</label>
              <div style={iconWrap}>
                <MapPin size={16} style={iconStyle} />
                <input type="text" className="input-glass" style={inputStyle}
                  placeholder="e.g. Belgaum, Karnataka"
                  value={fieldLocation} onChange={e => setFieldLocation(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              <button type="button" onClick={() => { setStep('email'); setError(''); }}
                className="btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1rem' }}>
                <ArrowLeft size={15} /> Back
              </button>
              <button type="submit" disabled={isLoading} className="btn-primary"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {isLoading ? 'Registering…' : <><span>Register & Get OTP</span><ArrowRight size={16} /></>}
              </button>
            </div>
          </form>
        )}

        {/* ===== STEP 3: OTP ===== */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div style={{
              background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)',
              borderRadius: '8px', padding: '0.6rem 0.9rem', fontSize: '0.8rem', color: 'var(--brand-secondary)'
            }}>
              📬 An OTP has been sent to <strong>{email}</strong>.<br />
              {isNewUser ? 'Welcome! Verify to activate your account.' : 'Enter it below to login.'}
            </div>

            <div className="flex flex-col gap-2">
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>One-Time Password (OTP)</label>
              <input type="text" required className="input-glass"
                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--panel-border)', fontSize: '1.4rem', letterSpacing: '0.4rem', textAlign: 'center' }}
                placeholder="• • • • • •" maxLength={6}
                value={otp} onChange={e => setOtp(e.target.value)} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Use 123456 for testing in dev mode.</span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button"
                onClick={() => { setStep(isNewUser ? 'register' : 'email'); setError(''); setOtp(''); }}
                className="btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1rem' }}>
                <ArrowLeft size={15} /> Back
              </button>
              <button type="submit" disabled={isLoading} className="btn-primary"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {isLoading ? 'Verifying…' : <><span>{isNewUser ? 'Activate Account' : 'Login'}</span><ArrowRight size={16} /></>}
              </button>
            </div>

            <button type="button"
              onClick={async () => { setError(''); setOtp(''); setIsLoading(true); try { await sendOtp(); } catch (err) { setError(err.message); } finally { setIsLoading(false); } }}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>
              Resend OTP
            </button>
          </form>
        )}
      </div>

      {/* Footer badges */}
      <div className="flex justify-center gap-8" style={{ marginTop: '2.5rem', opacity: 0.55 }}>
        <div className="flex flex-col items-center gap-2">
          <ShieldCheck size={22} />
          <span style={{ fontSize: '0.7rem' }}>{t('verified_safe')}</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <PhoneCall size={22} />
          <span style={{ fontSize: '0.7rem' }}>{t('ai_agent')}</span>
        </div>
      </div>
    </div>
  );
}
