import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function AdminPanel({ onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({ username: '', password: '', displayName: '', role: 'MEMBER' });

  const load = () => {
    setLoading(true);
    api.getUsers().then(d => setUsers(Array.isArray(d) ? d : d.content || d.data || [])).catch(() => setUsers([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const addUser = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) return;
    try { await api.createUser(newUser); setNewUser({ username: '', password: '', displayName: '', role: 'MEMBER' }); load(); } catch (e) { console.error(e); }
  };

  const changeRole = async (id, role) => {
    try { await api.updateUserRole(id, role); load(); } catch (e) { console.error(e); }
  };

  const delUser = async (id) => {
    if (!confirm('确定删除此用户？')) return;
    try { await api.deleteUser(id); load(); } catch (e) { console.error(e); }
  };

  return (
    <div className="modal-overlay active" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-admin">
        <div className="modal-header">
          <h2>⚙️ 成员管理</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="admin-section">
            <h3>➕ 添加成员</h3>
            <form className="admin-add-form" onSubmit={addUser}>
              <div className="admin-form-row">
                <input type="text" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} placeholder="用户名" required />
                <input type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="密码" required />
                <input type="text" value={newUser.displayName} onChange={e => setNewUser({ ...newUser, displayName: e.target.value })} placeholder="显示名" />
                <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                  <option value="MEMBER">🎮 成员</option>
                  <option value="ADMIN">👑 管理员</option>
                  <option value="VISITOR">👀 游客</option>
                </select>
                <button type="submit" className="btn btn-primary btn-sm">添加</button>
              </div>
            </form>
          </div>

          <div className="admin-section">
            <h3>👥 现有成员 ({users.length})</h3>
            {loading ? <div className="loading"><div className="spinner"></div></div> : (
              <div className="admin-user-list">
                {users.map(u => (
                  <div className="admin-user-item" key={u.id}>
                    <div className="admin-user-info">
                      <span className="admin-user-avatar">{u.username?.[0]}</span>
                      <div className="admin-user-detail">
                        <span className="admin-user-name">{u.displayName || u.username}</span>
                        <span className="admin-user-username">@{u.username}</span>
                      </div>
                    </div>
                    <div className="admin-user-actions">
                      <select value={u.role} onChange={e => changeRole(u.id, e.target.value)}>
                        <option value="ADMIN">👑 管理员</option>
                        <option value="MEMBER">🎮 成员</option>
                        <option value="VISITOR">👀 游客</option>
                      </select>
                      <button className="btn-delete-user" onClick={() => delUser(u.id)}>删除</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
