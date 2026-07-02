import { useState, useEffect } from 'react';
import API from '../../api';
import './AdminLayout.css';
import './Modal.css';

function AdminHomestays() {
  const [homestays, setHomestays] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [editing,   setEditing]   = useState(null);
  const [form,      setForm]      = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    API.get('/admin/homestays', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setHomestays(res.data))
      .finally(() => setLoading(false));
  }, []);

  const startEdit = (hs) => {
    setEditing(hs.id);
    setForm({ ...hs });
  };

  const handleSave = async () => {
    try {
      await API.put(`/admin/homestays/${editing}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHomestays(prev => prev.map(h => h.id === editing ? {...h, ...form} : h));
      setEditing(null);
    } catch { alert('Failed to update homestay.'); }
  };

  const toggleStatus = async (hs) => {
    const newStatus = hs.status === 'available' ? 'unavailable' : 'available';
    try {
      await API.put(`/admin/homestays/${hs.id}`, {...hs, status: newStatus}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHomestays(prev => prev.map(h => h.id === hs.id ? {...h, status: newStatus} : h));
    } catch { alert('Failed to update status.'); }
  };

  return (
    <div>
      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h2>All Homestays ({homestays.length})</h2>
        </div>

        {loading ? (
          <div style={{textAlign:'center', padding:'40px', color:'var(--text-light)'}}>Loading...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Location</th>
                <th>Price/Night</th>
                <th>Rooms</th>
                <th>Max Guests</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {homestays.map(hs => (
                <tr key={hs.id}>
                  <td><strong>#{hs.id}</strong></td>
                  <td>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                      <img src={`/images/${hs.image}`} alt={hs.name}
                        style={{width:'48px', height:'36px', objectFit:'cover', borderRadius:'6px'}}
                        onError={e => e.target.style.display='none'} />
                      <strong>{hs.name}</strong>
                    </div>
                  </td>
                  <td>{hs.location}</td>
                  <td><strong>RM {parseFloat(hs.price_per_night).toFixed(0)}</strong></td>
                  <td>{hs.rooms}</td>
                  <td>{hs.max_guests}</td>
                  <td>{hs.rating}</td>
                  <td><span className={`badge badge-${hs.status}`}>{hs.status}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-sm btn-sm-primary" onClick={() => startEdit(hs)}>Edit</button>
                      <button className={`btn-sm ${hs.status === 'available' ? 'btn-sm-warning' : 'btn-sm-success'}`}
                        onClick={() => toggleStatus(hs)}>
                        {hs.status === 'available' ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* EDIT MODAL */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Edit Homestay</h2>
              <button className="modal-close" onClick={() => setEditing(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-grid">
                <div className="form-group">
                  <label>Name</label>
                  <input value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input value={form.location || ''} onChange={e => setForm({...form, location: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Price Per Night (RM)</label>
                  <input type="number" value={form.price_per_night || ''} onChange={e => setForm({...form, price_per_night: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Max Guests</label>
                  <input type="number" value={form.max_guests || ''} onChange={e => setForm({...form, max_guests: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Rooms</label>
                  <input type="number" value={form.rooms || ''} onChange={e => setForm({...form, rooms: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Bathrooms</label>
                  <input type="number" value={form.bathrooms || ''} onChange={e => setForm({...form, bathrooms: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Amenities (comma separated)</label>
                <input value={form.amenities || ''} onChange={e => setForm({...form, amenities: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={4} value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status || 'available'} onChange={e => setForm({...form, status: e.target.value})}>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-sm btn-sm-danger" style={{padding:'10px 24px'}} onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn-sm btn-sm-success" style={{padding:'10px 24px'}} onClick={handleSave}>💾 Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminHomestays;