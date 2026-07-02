import { useState, useEffect } from 'react';
import API from '../../api';

export function AdminRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [expanded, setExpanded] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    API.get('/refunds/admin', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setRefunds(res.data))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/refunds/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRefunds(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch {
      alert('Failed to update refund status.');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-MY', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const filtered = filter === 'all' ? refunds : refunds.filter(r => r.status === filter);

  return (
    <div>
      {/* FILTER TABS */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 20px',
              borderRadius: '99px',
              border: '1.5px solid',
              borderColor: filter === f ? 'var(--primary)' : 'var(--border)',
              background: filter === f ? 'var(--primary)' : '#fff',
              color: filter === f ? '#fff' : 'var(--text-light)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.2s ease',
            }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {' '}({f === 'all' ? refunds.length : refunds.filter(r => r.status === f).length})
          </button>
        ))}
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h2>Refund Requests ({filtered.length})</h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>No refund requests found.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Guest</th>
                <th>Homestay</th>
                <th>Dates</th>
                <th>Amount</th>
                <th>Bank Details</th>
                <th>Reason</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td><strong>#{r.id}</strong></td>

                  <td>
                    <div>
                      <strong style={{ display: 'block' }}>{r.user_name}</strong>
                      <small style={{ color: 'var(--text-light)' }}>{r.user_email}</small>
                    </div>
                  </td>

                  <td>{r.homestay_name}</td>

                  <td style={{ fontSize: '0.82rem' }}>
                    <div>{formatDate(r.checkin_date)}</div>
                    <div style={{ color: 'var(--text-light)' }}>→ {formatDate(r.checkout_date)}</div>
                  </td>

                  <td>
                    <strong style={{ color: 'var(--primary)' }}>
                      RM {parseFloat(r.total_price).toFixed(0)}
                    </strong>
                  </td>

                  {/* BANK DETAILS */}
                  <td>
                    {r.bank_name ? (
                      <div style={{
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        fontSize: '0.8rem',
                        minWidth: '160px',
                      }}>
                        <div style={{ marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-light)' }}>Bank: </span>
                          <strong>{r.bank_name}</strong>
                        </div>
                        <div style={{ marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-light)' }}>Name: </span>
                          <strong>{r.account_name}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-light)' }}>Acc No: </span>
                          <strong>{r.account_number}</strong>
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>Not provided</span>
                    )}
                  </td>

                  {/* REASON */}
                  <td>
                    <div style={{ maxWidth: '180px' }}>
                      {expanded === r.id ? (
                        <div>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.5, marginBottom: '6px' }}>
                            {r.reason}
                          </p>
                          <button onClick={() => setExpanded(null)}
                            style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                            Show less
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.5, marginBottom: '4px' }}>
                            {r.reason?.length > 60 ? r.reason.substring(0, 60) + '...' : r.reason}
                          </p>
                          {r.reason?.length > 60 && (
                            <button onClick={() => setExpanded(r.id)}
                              style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                              Read more
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  <td style={{ fontSize: '0.82rem', color: 'var(--text-light)', whiteSpace: 'nowrap' }}>
                    {formatDate(r.created_at)}
                  </td>

                  <td>
                    <span className={`badge ${
                      r.status === 'pending'  ? 'badge-pending' :
                      r.status === 'approved' ? 'badge-confirmed' :
                      'badge-cancelled'
                    }`}>
                      {r.status}
                    </span>
                  </td>

                  <td>
                    <div className="action-btns">
                      {r.status === 'pending' && (
                        <>
                          <button className="btn-sm btn-sm-success"
                            onClick={() => updateStatus(r.id, 'approved')}>
                            Approve
                          </button>
                          <button className="btn-sm btn-sm-danger"
                            onClick={() => updateStatus(r.id, 'rejected')}>
                            Reject
                          </button>
                        </>
                      )}
                      {r.status === 'approved' && (
                        <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>
                          Approved
                        </span>
                      )}
                      {r.status === 'rejected' && (
                        <button className="btn-sm btn-sm-warning"
                          onClick={() => updateStatus(r.id, 'approved')}>
                          Approve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}