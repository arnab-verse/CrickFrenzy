import React, { useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  signInWithGoogle,
  signInWithGooglePlay,
  signInWithEmail,
  registerWithEmail,
  logoutFirebase,
  isAppInIframe,
  openAppInNewTab,
} from '../lib/firebase';
import { soundFx } from '../utils/audio';
import {
  X,
  Trophy,
  CheckCircle2,
  BarChart3,
  LogOut,
  AlertTriangle,
  Gamepad2,
  ExternalLink,
  User,
  LogIn,
  UserPlus,
  Lock,
  Mail,
  ShieldCheck,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  onOpenStats?: () => void;
  onSelectGuest?: () => void;
  isInitialGate?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenStats,
  onSelectGuest,
  isInitialGate = false,
}) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isNetworkOrIframeError, setIsNetworkOrIframeError] = useState(false);

  if (!isOpen) return null;

  const inIframe = isAppInIframe();

  const handleGoogleSignIn = async () => {
    soundFx.playUiClick();
    setLoading(true);
    setErrorMsg(null);
    setIsNetworkOrIframeError(false);
    try {
      await signInWithGoogle();
      onSelectGuest?.();
      onClose();
    } catch (err: any) {
      const code = err?.code || '';
      const msg = err?.message || '';
      if (code === 'auth/network-request-failed' || msg.includes('network-request-failed') || code === 'auth/popup-blocked') {
        setIsNetworkOrIframeError(true);
        setErrorMsg(
          'Sign-in was blocked by browser security. In embedded preview iframes, third-party authentication popups are restricted.'
        );
      } else if (code !== 'auth/popup-closed-by-user') {
        setErrorMsg(msg || 'Failed to sign in with Google.');
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
      onSelectGuest?.();
      onClose();
    } catch (err: any) {
      const code = err?.code || '';
      const msg = err?.message || '';
      if (code === 'auth/network-request-failed' || msg.includes('network-request-failed') || code === 'auth/popup-blocked') {
        setIsNetworkOrIframeError(true);
        setErrorMsg(
          'Sign-in was blocked by browser security. In embedded preview iframes, third-party authentication popups are restricted.'
        );
      } else if (code !== 'auth/popup-closed-by-user') {
        setErrorMsg(msg || 'Failed to sign in with Google Play.');
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
      onSelectGuest?.();
      onClose();
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

  const handleLogout = async () => {
    soundFx.playUiClick();
    setLoading(true);
    try {
      await logoutFirebase();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign out.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestContinue = () => {
    soundFx.playUiClick();
    onSelectGuest?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-[fade-in_0.2s_ease-out] overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col items-center text-center my-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            soundFx.playUiClick();
            if (isInitialGate && !currentUser) {
              handleGuestContinue();
            } else {
              onClose();
            }
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-base transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon Header */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4">
          <Trophy className="w-8 h-8 text-slate-950" />
        </div>

        {currentUser ? (
          /* LOGGED IN USER PROFILE VIEW */
          <div className="w-full flex flex-col items-center space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 w-full">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full border-2 border-amber-400 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 font-black text-xl flex items-center justify-center">
                  {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="text-left min-w-0 flex-1">
                <div className="font-bold text-white text-base truncate">
                  {currentUser.displayName || 'Cricket Player'}
                </div>
                <div className="text-xs text-slate-400 truncate">{currentUser.email}</div>
                <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Cloud Synced</span>
                </div>
              </div>
            </div>

            {onOpenStats && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playUiClick();
                  onClose();
                  onOpenStats();
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm tracking-wider uppercase shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>VIEW RECORDS & PLAYER STATS</span>
              </button>
            )}

            <button
              type="button"
              disabled={loading}
              onClick={handleLogout}
              className="w-full py-3 px-4 rounded-2xl bg-rose-950/80 hover:bg-rose-900 border border-rose-700/80 text-rose-200 font-bold text-sm tracking-wider uppercase transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>{loading ? 'SIGNING OUT...' : 'SIGN OUT'}</span>
            </button>
          </div>
        ) : (
          /* SIGN IN / REGISTER OPTIONS */
          <div className="w-full flex flex-col items-center space-y-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-400 font-cinzel uppercase tracking-wider">
                PLAYER SIGN IN
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Save match history, ongoing World Cup & ICL tournaments, and view player career statistics across devices.
              </p>
            </div>

            {/* Tab Switcher: Sign In vs Create Account */}
            <div className="w-full grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  soundFx.playUiClick();
                  setMode('LOGIN');
                  setErrorMsg(null);
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
                className={`py-1.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'REGISTER'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>

            {errorMsg && (
              <div className="w-full p-3.5 rounded-2xl bg-rose-950/90 border border-rose-600/70 text-rose-200 text-xs text-left space-y-2 shadow-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold text-amber-300">
                      {isNetworkOrIframeError ? 'Preview Sandbox Notice' : 'Authentication Notice'}
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{errorMsg}</div>
                  </div>
                </div>

                {isNetworkOrIframeError && (
                  <div className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-rose-800/60">
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playUiClick();
                        openAppInNewTab();
                      }}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in New Tab</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="w-full flex flex-col gap-2 pt-1">
              {/* Option 1: Continue with Google */}
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
                <span>{loading ? 'SIGNING IN...' : 'CONTINUE WITH GOOGLE'}</span>
              </button>

              {/* Option 2: Continue with Google Play */}
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

            {/* Email Form */}
            <form onSubmit={handleEmailAuthSubmit} className="w-full flex flex-col gap-2">
              {mode === 'REGISTER' && (
                <div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Player Display Name"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
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
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
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
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{loading ? 'PROCESSING...' : mode === 'LOGIN' ? 'SIGN IN WITH EMAIL' : 'CREATE ACCOUNT'}</span>
              </button>
            </form>

            {/* Option 3: Continue as Guest */}
            <div className="w-full pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleGuestContinue}
                className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white font-bold text-xs tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-700"
              >
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>CONTINUE AS GUEST (LOCAL SAVE)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
