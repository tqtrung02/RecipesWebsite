'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    try {
      const formData = new FormData();
      formData.append('email', email);

      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        setSuccess('Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.');
      } else {
        const data = await response.text();
        setError(data || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
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
                <h4 className="card-title text-center mb-4">Quên mật khẩu?</h4>

                {error && (
                  <div className="alert alert-danger">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="alert alert-success">
                    {success}
                  </div>
                )}

                <div className="form-group mb-3">
                  <label htmlFor="email" className="form-label">Nhập Email của bạn</label>
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

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 mt-3"
                  disabled={loading}
                >
                  {loading ? 'Đang gửi...' : 'Gửi link đổi mật khẩu'}
                </button>

                <div className="mt-3 text-center">
                  <Link href="/login">Quay lại đăng nhập</Link>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
