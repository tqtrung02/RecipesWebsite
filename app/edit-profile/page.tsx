'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { userApi } from '@/lib/api';

export default function EditProfilePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await userApi.getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setName(user.name);
        setEmail(user.email);
      } catch (err) {
        console.error('Error fetching user:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await userApi.updateProfile(name, email);
      
      if (response.ok) {
        setSuccess('Cập nhật thông tin thành công!');
        setTimeout(() => {
          router.push('/profile');
        }, 1500);
      } else {
        setError('Có lỗi xảy ra khi cập nhật thông tin.');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi cập nhật thông tin.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg rounded">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Chỉnh sửa thông tin</h2>

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

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Họ và tên</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100"
                    disabled={submitting}
                  >
                    {submitting ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
