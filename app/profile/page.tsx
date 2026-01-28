import Link from 'next/link';
import { redirect } from 'next/navigation';
import { userApi } from '@/lib/api';

async function getCurrentUser() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/current`, {
      credentials: 'include',
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Thông tin người dùng</h2>

              <div className="mb-3">
                <label htmlFor="name" className="form-label fw-bold">Họ và tên</label>
                <p id="name" className="form-control-plaintext fs-5">{user.name}</p>
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-bold">Email</label>
                <p id="email" className="form-control-plaintext fs-5">{user.email}</p>
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label fw-bold">Mật khẩu</label>
                <p id="password" className="form-control-plaintext fs-5">*******</p>
              </div>

              <div className="text-center mt-4">
                <Link href="/edit-profile" className="btn btn-primary btn-lg px-4 py-2 mb-2">
                  Chỉnh sửa thông tin
                </Link>
                <br />
                <Link href="/change-password" className="btn btn-secondary btn-lg px-4 py-2">
                  Đổi mật khẩu
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
