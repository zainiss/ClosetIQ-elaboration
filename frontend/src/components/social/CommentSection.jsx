import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../AuthContext';
import { getComments, addComment, deleteComment, flagComment } from '../../api/social';

const CommentSection = ({ outfitId }) => {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getComments(outfitId)
      .then((data) => { if (!cancelled) setComments(Array.isArray(data) ? data : []); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [outfitId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await addComment(outfitId, trimmed);
      setComments((prev) => [...prev, res.comment]);
      setText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prev) =>
        prev.map((c) => c.id === commentId ? { ...c, is_deleted: true, text: '[deleted]' } : c)
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFlag = async (commentId) => {
    try {
      await flagComment(commentId);
      setComments((prev) =>
        prev.map((c) => c.id === commentId ? { ...c, is_flagged: true } : c)
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const initials = (username) => (username || '?').slice(0, 2).toUpperCase();

  return (
    <div className="comment-section">
      {loading ? (
        <p className="no-comments">Loading comments…</p>
      ) : (
        <>
          {error && <p style={{ color: 'var(--danger)', fontSize: 'var(--font-xs)', marginBottom: '0.5rem' }}>{error}</p>}
          <div className="comment-list">
            {comments.length === 0 && (
              <p className="no-comments">No comments yet — be the first!</p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="comment-item">
                <div className="comment-avatar">{initials(c.username)}</div>
                <div className="comment-body">
                  <div className="comment-author">{c.username}</div>
                  <div className={`comment-text${c.is_deleted ? ' deleted' : ''}`}>{c.text}</div>
                  {!c.is_deleted && (
                    <div className="comment-actions">
                      {(user?.id === c.user_id || user?.is_admin) && (
                        <button
                          className="comment-action-btn"
                          onClick={() => handleDelete(c.id)}
                          title="Delete comment"
                        >
                          Delete
                        </button>
                      )}
                      {user?.id !== c.user_id && !c.is_flagged && (
                        <button
                          className="comment-action-btn flag"
                          onClick={() => handleFlag(c.id)}
                          title="Report comment"
                        >
                          Report
                        </button>
                      )}
                      {c.is_flagged && (
                        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--warning)' }}>Reported</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form className="comment-form" onSubmit={handleSubmit}>
            <textarea
              className="comment-input"
              placeholder="Add a comment…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
              }}
            />
            <button
              type="submit"
              className="comment-submit-btn"
              disabled={submitting || !text.trim()}
            >
              {submitting ? '…' : 'Post'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default CommentSection;
