export default function Loading() {
  return (
    <div className="container py-5 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Đang tải...</span>
      </div>
      <p className="mt-3">Đang tải dữ liệu...</p>
    </div>
  );
}
