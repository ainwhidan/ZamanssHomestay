import { useState, useEffect } from 'react';
import { CheckCircle2, EyeOff } from 'lucide-react';
import API from '../../api';

export default function AdminRating() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = () => {
    setLoading(true);
    API.get('/admin/reviews', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setReviews(res.data))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await API.delete(`/admin/reviews/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch { alert('Failed to delete review.'); }
  };

  const togglePublish = async (id, current) => {
    try {
      await API.put(`/admin/reviews/${id}/publish`, { is_published: !current },
        { headers: { Authorization: `Bearer ${token}` } });
      setReviews(prev => prev.map(r => r.id === id ? { ...r, is_published: !current } : r));
    } catch { alert('Failed to update review status.'); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="admin-table-wrap">
      <div className="admin-table-header">
        <h2>All Reviews ({reviews.length})</h2>
      </div>
      {loading ? (
        <div style={{textAlign:'center', padding:'40px', color:'var(--text-light)'}}>Loading...</div>
      ) : reviews.length === 0 ? (
        <div style={{textAlign:'center', padding:'40px', color:'var(--text-light)'}}>No reviews yet.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th><th>Guest</th><th>Homestay</th><th>Rating</th>
              <th>Comment</th><th>Date</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td><strong>{r.user_name}</strong></td>
                <td>{r.homestay_name}</td>
                <td>{'⭐'.repeat(r.rating)} ({r.rating}/5)</td>
                <td style={{maxWidth:'250px'}}>
                  <span style={{display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                    {r.comment || '—'}
                  </span>
                </td>
                <td>{formatDate(r.created_at)}</td>
                <td>
                  <span style={{
                    padding:'4px 10px', borderRadius:'99px', fontSize:'0.78rem', fontWeight:600,
                    background: r.is_published ? '#dcfce7' : '#fef9c3',
                    color: r.is_published ? '#16a34a' : '#a16207',
                  }}>
                    {r.is_published ? 'Published' : 'Pending'}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    {r.is_published ? (
                      <button className="btn-sm" onClick={() => togglePublish(r.id, r.is_published)}>
                        <EyeOff size={14} /> Unpublish
                      </button>
                    ) : (
                      <button className="btn-sm btn-sm-success" onClick={() => togglePublish(r.id, r.is_published)}>
                        <CheckCircle2 size={14} /> Save
                      </button>
                    )}
                    <button className="btn-sm btn-sm-danger" onClick={() => handleDelete(r.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}