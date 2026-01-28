'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Comment {
  _id: string;
  user: {
    name: string;
  };
  commentText: string;
  createdAt: string;
}

interface CommentSectionProps {
  recipeId: string;
  initialComments: Comment[];
  user: any;
  isAdmin: boolean;
}

export default function CommentSection({ recipeId, initialComments, user, isAdmin }: CommentSectionProps) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    if (!commentText.trim()) {
      return;
    }

    setLoading(true);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    try {
      const formData = new FormData();
      formData.append('commentText', commentText);

      const response = await fetch(`${API_BASE_URL}/recipe/${recipeId}/comment`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        setCommentText('');
        // Refresh to get updated comments
        window.location.reload();
      } else {
        alert('Có lỗi xảy ra khi thêm bình luận.');
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi thêm bình luận.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      return;
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    try {
      const response = await fetch(`${API_BASE_URL}/recipe/${recipeId}/comment/delete/${commentId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        setComments(comments.filter(comment => comment._id !== commentId));
        router.refresh();
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa bình luận.');
    }
  };

  return (
    <div className="row pt-4">
      <div className="col-12">
        <h4 className="text-primary mb-3">Bình luận</h4>

        {comments.length > 0 ? (
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment._id} className="comment-item mb-4 p-3 rounded shadow-sm">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong className="fs-5">{comment.user.name}</strong>
                    <span className="text-muted small ms-2">
                      {new Date(comment.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="btn btn-danger btn-sm ms-3 mt-2"
                    >
                      Xóa
                    </button>
                  )}
                </div>
                <p className="mt-2">{comment.commentText}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
        )}
      </div>

      {user ? (
        <div className="row pt-3">
          <div className="col-12">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="commentText" className="form-label">Thêm bình luận</label>
                <textarea
                  className="form-control"
                  id="commentText"
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Viết bình luận của bạn..."
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Đang gửi...' : 'Gửi bình luận'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="row pt-3">
          <div className="col-12">
            <p className="text-muted">
              Vui lòng <Link href="/login">đăng nhập</Link> để thêm bình luận.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
