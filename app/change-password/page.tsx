'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { userApi } from '@/lib/api';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await userApi.changePassword(currentPassword, newPassword, confirmPassword);
      
      if (response.ok) {
        setSuccess('Cập nhật mật khẩu thành công!');
        setTimeout(() => {
          router.push('/profile');
        }, 1500);
      } else {
        const data = await response.text();
        setError(data || 'Có lỗi xảy ra khi cập nhật mật khẩu.');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi cập nhật mật khẩu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg rounded">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Đổi mật khẩu</h2>

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
                  <label htmlFor="currentPassword" className="form-label">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    className="form-control"
                    id="currentPassword"
                    name="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">Mật khẩu mới</label>
                  <input
                    type="password"
                    className="form-control"
                    id="newPassword"
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100"
                  disabled={submitting}
                >
                  {submitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
