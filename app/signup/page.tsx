'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userApi } from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await userApi.signup(name, email, password);
      
      if (response.ok) {
        router.push('/');
        router.refresh();
      } else {
        const data = await response.text();
        setError(data || 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.');
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
                <h4 className="card-title text-center mb-4">Tạo tài khoản</h4>

                {error && (
                  <div className="alert alert-danger">
                    <p className="mb-0">{error}</p>
                  </div>
                )}

                <div className="form-group mb-3">
                  <label htmlFor="name" className="form-label">Họ và tên</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-person"></i></span>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Điền họ và tên"
                    />
                  </div>
                </div>

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
                      placeholder="Điền email"
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
                      placeholder="Tạo mật khẩu"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 mt-3"
                  disabled={loading}
                >
                  {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                </button>

                <div className="mt-3 text-center">
                  <p>Đã có tài khoản? <Link href="/login">Đăng nhập ở đây</Link></p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
