'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg">
            <div className="card-body text-center">
              <h2 className="card-title text-danger mb-4">Đã xảy ra lỗi</h2>
              <p className="text-muted mb-4">
                {error.message || 'Có lỗi xảy ra khi tải trang. Vui lòng thử lại.'}
              </p>
              <div className="d-flex gap-2 justify-content-center">
                <button
                  onClick={reset}
                  className="btn btn-primary"
                >
                  Thử lại
                </button>
                <Link href="/" className="btn btn-secondary">
                  Về trang chủ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
