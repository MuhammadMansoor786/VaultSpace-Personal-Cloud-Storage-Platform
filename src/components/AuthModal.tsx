/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Lock,
  User,
  Mail,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { useVault } from '../context/VaultContext';

interface AuthModalProps {
  initialTab?: 'signin' | 'signup' | 'recover';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialTab = 'signin', onClose }) => {
  const { login, register, resetPasswordWithRecovery, loginAttempts } = useVault();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'recover'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sign In Form
  const [signInUser, setSignInUser] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up Form
  const [signUpUser, setSignUpUser] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [generatedPhrase, setGeneratedPhrase] = useState<string | null>(null);
  const [isCopiedPhrase, setIsCopiedPhrase] = useState(false);

  // Recovery Form
  const [recoverUser, setRecoverUser] = useState('');
  const [recoverPhrase, setRecoverPhrase] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(signUpPassword);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    const res = await login(signInUser, signInPassword);
    setIsLoading(false);
    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || 'Failed to sign in.');
    }
  };

  const handleFillDemo = () => {
    setSignInUser('demo_user');
    setSignInPassword('Vault2026!*');
    setErrorMessage('');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (signUpPassword.length < 8) {
      setErrorMessage('Master password must be at least 8 characters long.');
      return;
    }
    setIsLoading(true);
    const res = await register(signUpUser, signUpName, signUpEmail, signUpPassword);
    setIsLoading(false);
    if (res.success && res.recoveryPhrase) {
      setGeneratedPhrase(res.recoveryPhrase);
    } else {
      setErrorMessage(res.error || 'Failed to register account.');
    }
  };

  const handleCopyPhrase = () => {
    if (generatedPhrase) {
      navigator.clipboard.writeText(generatedPhrase);
      setIsCopiedPhrase(true);
      setTimeout(() => setIsCopiedPhrase(false), 2500);
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);
    const res = await resetPasswordWithRecovery(recoverUser, recoverPhrase, newPassword);
    setIsLoading(false);
    if (res.success) {
      setSuccessMessage('Password successfully updated! Vault opened.');
      setTimeout(() => onClose(), 1200);
    } else {
      setErrorMessage(res.error || 'Recovery failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 relative transition-all"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Generated Recovery Phrase View (Shown upon registration) */}
        {generatedPhrase ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Save Your 12-Word Recovery Key
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Because VaultSpace is Zero-Knowledge, this phrase is the <strong>only way</strong> to recover your files if you forget your master password.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-2">
              {generatedPhrase.split(' ').map((word, idx) => (
                <div
                  key={idx}
                  className="px-2 py-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 text-xs font-mono flex items-center gap-1.5"
                >
                  <span className="text-[10px] text-slate-400 select-none">{idx + 1}.</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{word}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyPhrase}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {isCopiedPhrase ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{isCopiedPhrase ? 'Copied to Clipboard' : 'Copy All 12 Words'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
              >
                I Saved My Key · Enter Vault
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header / Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signin');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'signin'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signup');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'signup'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                New Vault
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('recover');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'recover'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Recovery
              </button>
            </div>

            {/* Error & Warning Banners */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {loginAttempts >= 3 && loginAttempts < 5 && activeTab === 'signin' && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Warning: {5 - loginAttempts} login attempts remaining before temporary rate-lock.</span>
              </div>
            )}

            {/* 1. Sign In Form */}
            {activeTab === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Username or Email
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={signInUser}
                      onChange={e => setSignInUser(e.target.value)}
                      placeholder="e.g. demo_user"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Master Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTab('recover')}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={signInPassword}
                      onChange={e => setSignInPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  {isLoading ? 'Decrypting Vault...' : 'Unlock Private Vault'}
                </button>

                {/* Quick Auto-fill button for fast testing */}
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Auto-fill Demo Credentials (demo_user)</span>
                </button>
              </form>
            )}

            {/* 2. Register Form */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={signUpUser}
                      onChange={e => setSignUpUser(e.target.value)}
                      placeholder="e.g. alex_rivera"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={e => setSignUpName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={signUpEmail}
                      onChange={e => setSignUpEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Master Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={signUpPassword}
                      onChange={e => setSignUpPassword(e.target.value)}
                      placeholder="At least 8 chars (letters, digits, symbol)"
                      className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {signUpPassword && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full transition-all ${
                            strength <= 1
                              ? 'w-1/4 bg-rose-500'
                              : strength === 2
                              ? 'w-2/4 bg-amber-500'
                              : strength === 3
                              ? 'w-3/4 bg-blue-500'
                              : 'w-full bg-emerald-500'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-slate-500">
                        {strength <= 1 ? 'Weak' : strength === 2 ? 'Fair' : strength === 3 ? 'Good' : 'Strong'}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  {isLoading ? 'Deriving Master Keys...' : 'Generate Vault & Recovery Phrase'}
                </button>
              </form>
            )}

            {/* 3. Account Recovery Form */}
            {activeTab === 'recover' && (
              <form onSubmit={handleRecover} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Your Username
                  </label>
                  <input
                    type="text"
                    required
                    value={recoverUser}
                    onChange={e => setRecoverUser(e.target.value)}
                    placeholder="e.g. demo_user"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    12-Word Recovery Phrase
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={recoverPhrase}
                    onChange={e => setRecoverPhrase(e.target.value)}
                    placeholder="Enter the 12 words separated by spaces..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    New Master Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  {isLoading ? 'Verifying Recovery Key...' : 'Reset Password & Unlock Vault'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
