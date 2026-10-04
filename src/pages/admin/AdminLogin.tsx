import { inputClass } from '@/components/ui/TextInput';
import { useState, useId, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';

export default function AdminLogin() {
  const { login, isAuthenticated, loading } = useAuth();
  const id = useId();
  const usernameInputId = `${id}-username`;
  const passwordInputId = `${id}-password`;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Sign-in failed. Check the username and password.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login min-h-screen bg-void flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-soot border border-fog">
          <div className="admin-panel-heading font-mono text-xs">SUBCULT / ADMIN ACCESS</div>

          <div className="p-6">
            {/* Header */}
            <div className="text-center mb-8">
              <img src="/brand/subcult/fisheye-circle.png?v=fisheye-flat-20261004" className="admin-login-mark" alt="" />
              <h1 className="text-3xl font-display text-glow tracking-widest mb-2">SUBCULT</h1>
              <p className="font-mono text-xs text-dust">Admin sign-in</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-ash border border-signal font-mono text-xs text-signal">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor={usernameInputId}
                  className="block font-mono text-xs text-bone uppercase mb-1"
                >
                  &gt; IDENT
                </label>
                <input
                  type="text"
                  id={usernameInputId}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                  className={inputClass}
                  placeholder="username"
                />
              </div>

              <div>
                <label
                  htmlFor={passwordInputId}
                  className="block font-mono text-xs text-bone uppercase mb-1"
                >
                  &gt; PASSKEY
                </label>
                <input
                  type="password"
                  id={passwordInputId}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-static text-void font-mono text-sm font-bold tracking-wider
                           hover:bg-glow transition-colors duration-200 cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'SIGNING IN…' : 'SIGN IN'}
              </button>
            </form>

            {/* Bottom text */}
            <div className="mt-6 text-center">
              <a
                href="/"
                className="font-mono text-xs text-dust hover:text-bone transition-colors duration-200"
              >
                ← Back to subcult.tv
              </a>
            </div>
          </div>
        </div>

        {/* Footer blink */}
        <div className="mt-4 text-center font-mono text-xs text-fog">
          <span className="cursor-blink">&gt; awaiting input</span>
        </div>
      </div>
    </div>
  );
}
