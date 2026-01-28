'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userApi } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await userApi.login(email, password);
      
      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data.success) {
          // Wait a bit for session cookie to be set
          await new Promise(resolve => setTimeout(resolve, 200));
          // Use window.location for full page reload to ensure session is loaded
          window.location.href = '/';
        } else {
          setError(data.error || 'Email hoặc mật khẩu không đúng.');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Email hoặc mật khẩu không đúng.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <form onSubmit={handleSubmit} className="p-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h4 className="card-title text-center mb-4">Đăng nhập</h4>

                {error && (
                  <div className="alert alert-danger">
                    <p className="mb-0">{error}</p>
                  </div>
                )}

                <div className="form-group mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Nhập email của bạn"
                    />
                  </div>
                </div>

                <div className="form-group mb-3">
                  <label htmlFor="password" className="form-label">Mật khẩu</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-lock"></i></span>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Nhập mật khẩu của bạn"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 mt-3"
                  disabled={loading}
                >
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>

                <div className="mt-3">
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/google`}
                    className="btn btn-danger w-100 py-2"
                  >
                    <i className="fab fa-google"></i> Đăng nhập bằng Google
                  </a>
                </div>

                <div className="mt-3 text-center">
                  <Link href="/forgot-password" className="text-muted">
                    Quên mật khẩu?
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
