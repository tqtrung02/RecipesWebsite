'use client';

import { useState } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  googleId?: string;
}

interface AdminUserTableProps {
  users: User[];
}

export default function AdminUserTable({ users }: AdminUserTableProps) {
  const [localUsers, setLocalUsers] = useState(users);

  const handleUpdate = async (userId: string, formData: FormData) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/user/edit-update/${userId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, role }),
      });

      if (response.ok) {
        // Update local state
        setLocalUsers(localUsers.map(user => 
          user._id === userId ? { ...user, name, email, role } : user
        ));
        alert('Cập nhật thành công!');
      } else {
        alert('Có lỗi xảy ra khi cập nhật người dùng.');
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi cập nhật người dùng.');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Bạn có muốn xóa người dùng này?')) {
      return;
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/user/delete/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        // Remove from local state
        setLocalUsers(localUsers.filter(user => user._id !== userId));
        alert('Xóa thành công!');
      } else {
        alert('Có lỗi xảy ra khi xóa người dùng.');
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa người dùng.');
    }
  };

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead className="table-light">
          <tr>
            <th scope="col">Họ và tên</th>
            <th scope="col">Email</th>
            <th scope="col">Vai trò</th>
            <th scope="col">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {localUsers.map((user) => (
            <tr key={user._id}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdate(user._id, new FormData(e.currentTarget));
                }}
              >
                <td>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    defaultValue={user.name}
                    required
                  />
                </td>
                <td>
                  {user.googleId ? (
                    <input
                      type="email"
                      className="form-control"
                      value={user.email}
                      readOnly
                    />
                  ) : (
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      defaultValue={user.email}
                      required
                    />
                  )}
                </td>
                <td>
                  <select
                    name="role"
                    className="form-select"
                    required
                    defaultValue={user.role}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <button type="submit" className="btn btn-success btn-sm me-2">
                    Cập nhật
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(user._id)}
                  >
                    Xóa
                  </button>
                </td>
              </form>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
