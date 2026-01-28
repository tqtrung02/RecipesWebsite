'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validToken, setValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    // Verify token is valid
    const verifyToken = async () => {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      
      try {
        const response = await fetch(`${API_BASE_URL}/reset-password/${token}`, {
          credentials: 'include',
        });

        if (response.ok) {
          setValidToken(true);
        } else {
          setValidToken(false);
          setError('Token không hợp lệ hoặc đã hết hạn.');
        }
      } catch (err) {
        setValidToken(false);
        setError('Có lỗi xảy ra khi xác thực token.');
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    try {
      const formData = new FormData();
      formData.append('password', password);

      const response = await fetch(`${API_BASE_URL}/reset-password/${token}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        setSuccess('Mật khẩu đã được cập nhật thành công!');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
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

  if (validToken === null) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang xác thực...</span>
        </div>
      </div>
    );
  }

  if (validToken === false) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="alert alert-danger">
              {error || 'Token không hợp lệ hoặc đã hết hạn.'}
            </div>
            <div className="text-center mt-3">
              <Link href="/forgot-password" className="btn btn-primary">
                Yêu cầu link mới
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <form onSubmit={handleSubmit} className="p-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h4 className="card-title text-center mb-4">Đổi Mật khẩu</h4>

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
                  <label htmlFor="password" className="form-label">Mật khẩu mới</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Nhập mật khẩu mới"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 mt-3"
                  disabled={loading}
                >
                  {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
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
