import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../components/ui/ToastContext';
import { api } from '../services/api';

export const AssistantsPage = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', username: '', password: '' });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.users.getAll();
      setUsers(res.users);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.users.create({
        full_name: formData.full_name,
        username: formData.username,
        password: formData.password,
        role: 'assistant'
      });
      addToast('Assistant created successfully', 'success');
      setIsModalOpen(false);
      setFormData({ full_name: '', username: '', password: '' });
      fetchUsers();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>{t('assistants.title')}</h2>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          {t('assistants.create_btn')}
        </button>
      </div>

      <div className="card table-container">
        {loading ? (
          <div className="text-center p-8"><span className="loader"></span></div>
        ) : (
          <table className="report-table">
            <thead>
              <tr>
                <th>{t('assistants.table_name')}</th>
                <th>{t('assistants.table_user')}</th>
                <th>{t('assistants.table_role')}</th>
                <th>{t('assistants.table_created')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="font-medium">
                    <div className="user-cell">
                      <div className="user-avatar">{u.full_name.charAt(0)}</div>
                      {u.full_name}
                    </div>
                  </td>
                  <td>{u.username}</td>
                  <td><span className="status-badge badge-progress">{u.role}</span></td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center p-4">No assistants found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '400px', maxWidth: '90%' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>{t('assistants.modal_title')}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t('assistants.modal_name')}</label>
                <input 
                  type="text" 
                  required 
                  value={formData.full_name} 
                  onChange={e => setFormData({...formData, full_name: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>{t('assistants.modal_user')}</label>
                <input 
                  type="text" 
                  required 
                  value={formData.username} 
                  onChange={e => setFormData({...formData, username: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>{t('assistants.modal_pass')}</label>
                <input 
                  type="text" 
                  required 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  {t('assistants.modal_submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
