import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container py-5 text-center">
      <h1 className="display-1 fw-bold">404</h1>
      <h2 className="mb-4">Không tìm thấy trang</h2>
      <p className="lead mb-4">
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
      </p>
      <Link href="/" className="btn btn-primary btn-lg">
        Về trang chủ
      </Link>
    </div>
  );
}
