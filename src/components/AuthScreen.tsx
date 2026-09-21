import React, { useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  signInWithGoogle,
  signInWithGooglePlay,
  signInWithEmail,
  registerWithEmail,
  isAppInIframe,
  openAppInNewTab,
} from '../lib/firebase';
import { soundFx } from '../utils/audio';
import {
  Trophy,
  LogIn,
  UserPlus,
  User,
  Gamepad2,
  Lock,
  Mail,
  AlertTriangle,
  ExternalLink,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import coverImage from '../assets/images/stadium_cover.webp';

interface AuthScreenProps {
  onAuthenticated: (user: FirebaseUser) => void;
  onContinueAsGuest: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onContinueAsGuest,
  isMuted,
  onToggleSound,
}) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isNetworkOrIframeError, setIsNetworkOrIframeError] = useState(false);

  const inIframe = isAppInIframe();

  const handleGoogleSignIn = async () => {
    soundFx.playUiClick();
    setLoading(true);
    setErrorMsg(null);
    setIsNetworkOrIframeError(false);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      const code = err?.code || '';
      const msg = err?.message || '';
      if (code === 'auth/network-request-failed' || msg.includes('network-request-failed') || code === 'auth/popup-blocked') {
        setIsNetworkOrIframeError(true);
        setErrorMsg(
          'Sign-in was blocked by browser iframe security. Please use Email/Password below, open in a new tab, or play as Guest.'
        );
      } else if (code !== 'auth/popup-closed-by-user') {
        setErrorMsg(msg || 'Google Sign-In failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGooglePlaySignIn = async () => {
    soundFx.playUiClick();
    setLoading(true);
    setErrorMsg(null);
    setIsNetworkOrIframeError(false);
    try {
      await signInWithGooglePlay();
    } catch (err: any) {
      const code = err?.code || '';
      const msg = err?.message || '';
      if (code === 'auth/network-request-failed' || msg.includes('network-request-failed') || code === 'auth/popup-blocked') {
        setIsNetworkOrIframeError(true);
        setErrorMsg(
          'Sign-in was blocked by browser iframe security. Please use Email/Password below or open in a new tab.'
        );
      } else if (code !== 'auth/popup-closed-by-user') {
        setErrorMsg(msg || 'Google Play Sign-In failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playUiClick();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please provide both email and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setIsNetworkOrIframeError(false);

    try {
      if (mode === 'LOGIN') {
        await signInWithEmail(email.trim(), password);
      } else {
        await registerWithEmail(email.trim(), password, playerName.trim() || undefined);
      }
    } catch (err: any) {
      const code = err?.code || '';
      const msg = err?.message || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setErrorMsg('Invalid email or password. If you do not have an account, click "Create Account".');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMsg('This email is already registered. Please switch to "Sign In".');
      } else if (code === 'auth/invalid-email') {
        setErrorMsg('Please enter a valid email address.');
      } else {
        setErrorMsg(msg || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    soundFx.playUiClick();
    onContinueAsGuest();
  };

  return (
    <div className="relative h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-sans select-none overflow-y-auto p-4 sm:p-6">
      {/* Background Stadium Backdrop with Dark Vignette */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={coverImage}
          alt="Stadium Atmosphere"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover scale-105 opacity-35 filter blur-[2px] brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/90" />
      </div>

      {/* Top Controls Bar */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleSound}
          aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          className="w-10 h-10 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 shadow-lg flex items-center justify-center transition-all cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>

      {/* Main Authentication Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/95 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 flex flex-col items-center my-auto">
        {/* CrickFrenzy Branding */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-2.5">
            <Trophy className="w-7 h-7 text-slate-950" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter uppercase font-russo leading-none">
            <span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">CRICK</span>
            <span className="text-amber-500 pl-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">FRENZY</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Sign in to track World Cup & ICL career stats, cloud saves & records
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div className="w-full grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-4">
          <button
            type="button"
            onClick={() => {
              soundFx.playUiClick();
              setMode('LOGIN');
              setErrorMsg(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'LOGIN'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundFx.playUiClick();
              setMode('REGISTER');
              setErrorMsg(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'REGISTER'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Notice / Error Display */}
        {errorMsg && (
          <div className="w-full p-3.5 rounded-2xl bg-rose-950/90 border border-rose-600/70 text-rose-200 text-xs text-left mb-4 space-y-2 shadow-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold text-amber-300">
                  {isNetworkOrIframeError ? 'Preview Sandbox Notice' : 'Authentication Alert'}
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{errorMsg}</div>
              </div>
            </div>
            {isNetworkOrIframeError && (
              <div className="pt-1 flex gap-2 border-t border-rose-800/60">
                <button
                  type="button"
                  onClick={openAppInNewTab}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open in New Tab</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 1-Click Social Sign In Options */}
        <div className="w-full flex flex-col gap-2.5 mb-4">
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all transform hover:scale-[1.01] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-3 border border-slate-300 disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loading ? 'CONNECTING...' : 'CONTINUE WITH GOOGLE'}</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleGooglePlaySignIn}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs tracking-wider uppercase shadow-md transition-all transform hover:scale-[1.01] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 border border-emerald-400/40 disabled:opacity-50"
          >
            <Gamepad2 className="w-4 h-4 text-emerald-200" />
            <span>{loading ? 'CONNECTING...' : 'GOOGLE PLAY GAMES'}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="w-full flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">OR EMAIL</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuthSubmit} className="w-full flex flex-col gap-2.5 mt-2">
          {mode === 'REGISTER' && (
            <div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Player Display Name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="Password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? 'PROCESSING...' : mode === 'LOGIN' ? 'SIGN IN WITH EMAIL' : 'CREATE CRICKETER ACCOUNT'}</span>
          </button>
        </form>

        {/* Guest Access Button */}
        <div className="w-full pt-3 mt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleGuest}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-slate-700/60 hover:border-amber-400/40 cursor-pointer group"
          >
            <User className="w-4 h-4 text-amber-400" />
            <span>PLAY AS GUEST (LOCAL SAVE)</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {inIframe && (
          <div className="w-full text-center mt-3">
            <button
              type="button"
              onClick={openAppInNewTab}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Running in preview? Open in new tab</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
