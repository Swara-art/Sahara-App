import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import {
  getProfile,
  updateProfile,
  getLeaderboard,
  getVouchers,
  buyVoucher,
} from '../api/api';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import './ProfilePage.css';

const TABS = ['My Profile', 'My Complaints', 'Rewards & Shop'];

export default function ProfilePage() {
  const { token } = useAuth();
  const { toast, showToast } = useToast();

  const [activeTab, setActiveTab] = useState(0);
  const [profile, setProfile] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [prof, lb, vch] = await Promise.all([
        getProfile(token),
        getLeaderboard(),
        getVouchers(),
      ]);
      setProfile(prof);
      setLeaderboard(Array.isArray(lb) ? lb : []);
      setVouchers(Array.isArray(vch) ? vch : []);
    } catch (err) {
      showToast('Failed to load profile: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  useEffect(() => { load(); }, [load]);

  async function handleBuyVoucher(v) {
    if (!profile) return;
    if (profile.tokens < v.cost) {
      showToast(`Not enough tokens. You need ${v.cost} tokens.`, 'error');
      return;
    }
    try {
      await buyVoucher(v._id, token);
      showToast(`🎉 ${v.name} voucher purchased!`, 'success');
      load(); // refresh profile (tokens + rewards)
    } catch (err) {
      showToast(err.message || 'Purchase failed.', 'error');
    }
  }

  if (loading) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="center-state">
          <span className="spinner" style={{ width: 36, height: 36 }} />
          <p>Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="center-state"><p>Could not load profile.</p></div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />

      {/* Profile header */}
      <section className="profile-header-section">
        <div className="container profile-header-inner">
          <div className="profile-avatar">
            {profile.profile_pic
              ? <img src={profile.profile_pic} alt={profile.name} />
              : <span className="avatar-placeholder">{profile.name?.[0]?.toUpperCase() || '?'}</span>
            }
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{profile.name}</h1>
            <p className="profile-phone">📱 {profile.phone}</p>
            <div className="token-badge">
              <span className="token-icon">🪙</span>
              <span className="token-value">{profile.tokens?.toLocaleString() || 0}</span>
              <span className="token-label">tokens</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm edit-btn" onClick={() => setEditOpen(true)}>
            ✏️ Edit Profile
          </button>
        </div>
      </section>

      {/* Tabs */}
      <div className="container tabs-bar">
        {TABS.map((t, i) => (
          <button
            key={t}
            className={`tab-btn ${activeTab === i ? 'active' : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {t}
            {t === 'My Complaints' && profile.my_complaints?.length > 0 && (
              <span className="tab-count">{profile.my_complaints.length}</span>
            )}
            {t === 'Rewards & Shop' && profile.rewards?.length > 0 && (
              <span className="tab-count">{profile.rewards.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <main className="container profile-content">
        {activeTab === 0 && (
          <ProfileInfoTab profile={profile} />
        )}
        {activeTab === 1 && (
          <MyComplaintsTab complaints={profile.my_complaints || []} />
        )}
        {activeTab === 2 && (
          <RewardsShopTab
            rewards={profile.rewards || []}
            vouchers={vouchers}
            tokens={profile.tokens || 0}
            onBuy={handleBuyVoucher}
            leaderboard={leaderboard}
          />
        )}
      </main>

      {/* Edit Profile Modal */}
      {editOpen && (
        <EditProfileModal
          profile={profile}
          token={token}
          onClose={() => setEditOpen(false)}
          onSaved={() => { setEditOpen(false); load(); showToast('Profile updated!', 'success'); }}
        />
      )}

      <Toast message={toast?.message} type={toast?.type} />
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────── */

function ProfileInfoTab({ profile }) {
  const stats = [
    { label: 'Total Complaints', value: profile.my_complaints?.length || 0 },
    { label: 'Resolved',         value: profile.my_complaints?.filter(c => c.status === 'resolved').length || 0 },
    { label: 'Pending',          value: profile.my_complaints?.filter(c => c.status === 'pending').length || 0 },
    { label: 'Tokens Earned',    value: (profile.tokens || 0).toLocaleString() },
  ];

  return (
    <div className="info-tab">
      <div className="stats-grid">
        {stats.map((s) => (
          <div key={s.label} className="stat-card card">
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MyComplaintsTab({ complaints }) {
  if (!complaints.length) {
    return <EmptyState icon="📋" text="You haven't filed any complaints yet." />;
  }

  const STATUS_MAP = {
    pending:     { label: 'Pending',     cls: 'status-pending' },
    assigned:    { label: 'Assigned',    cls: 'status-assigned' },
    in_progress: { label: 'In Progress', cls: 'status-in_progress' },
    resolved:    { label: 'Resolved',    cls: 'status-resolved' },
  };

  return (
    <div className="complaints-list">
      {complaints.map((c) => {
        const s = STATUS_MAP[c.status] || { label: c.status, cls: '' };
        return (
          <div key={c._id} className="complaint-row card">
            {c.image_url && (
              <img className="complaint-row-img" src={c.image_url} alt={c.title} />
            )}
            <div className="complaint-row-body">
              <div className="complaint-row-header">
                <span className={`badge ${s.cls}`}>{s.label}</span>
                <span className="complaint-row-date">
                  {c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN') : ''}
                </span>
              </div>
              <h3 className="complaint-row-title">{c.title}</h3>
              {c.location_text && <p className="complaint-row-loc">📌 {c.location_text}</p>}
              <p className="complaint-row-desc">{c.description}</p>
              <div className="complaint-row-footer">
                <span>▲ {c.upvotes || 0} upvotes</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RewardsShopTab({ rewards, vouchers, tokens, onBuy, leaderboard }) {
  return (
    <div className="rewards-tab">
      {/* My Rewards */}
      <section className="rewards-section">
        <h2 className="section-title">🎁 My Rewards</h2>
        {rewards.length === 0 ? (
          <EmptyState icon="🎫" text="No rewards yet. Buy vouchers from the shop below!" />
        ) : (
          <div className="rewards-grid">
            {rewards.map((r, i) => (
              <div key={i} className="reward-card card">
                <div className="reward-card-icon">🏷️</div>
                <div>
                  <div className="reward-card-name">{r.voucher_id}</div>
                  <div className="reward-card-code">Code: <strong>{r.code}</strong></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <hr className="divider" />

      {/* Shop */}
      <section className="rewards-section">
        <h2 className="section-title">🛍️ Voucher Shop</h2>
        <p className="section-subtitle">Your balance: <strong>🪙 {tokens.toLocaleString()} tokens</strong></p>
        <div className="vouchers-grid">
          {vouchers.map((v) => (
            <VoucherCard key={v._id} voucher={v} tokens={tokens} onBuy={() => onBuy(v)} />
          ))}
          {vouchers.length === 0 && (
            <EmptyState icon="🏪" text="No vouchers available right now." />
          )}
        </div>
      </section>

      <hr className="divider" />

      {/* Leaderboard */}
      <section className="rewards-section">
        <h2 className="section-title">🏆 Leaderboard</h2>
        <div className="leaderboard-list">
          {leaderboard.map((u, i) => (
            <div key={u._id} className={`leaderboard-row ${i < 3 ? 'top-three' : ''}`}>
              <span className="lb-rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
              <div className="lb-avatar">
                {u.profile_pic
                  ? <img src={u.profile_pic} alt={u.name} />
                  : <span>{u.name?.[0]?.toUpperCase()}</span>
                }
              </div>
              <span className="lb-name">{u.name}</span>
              <span className="lb-tokens">🪙 {u.tokens?.toLocaleString()}</span>
            </div>
          ))}
          {leaderboard.length === 0 && <EmptyState icon="📊" text="No leaderboard data." />}
        </div>
      </section>
    </div>
  );
}

function VoucherCard({ voucher, tokens, onBuy }) {
  const canAfford = tokens >= voucher.cost;
  const brand = voucher.name?.toLowerCase().includes('amazon') ? '🛒' : '🛍️';

  return (
    <div className="voucher-card card">
      <div className="voucher-brand">{brand}</div>
      <div className="voucher-name">{voucher.name}</div>
      <div className="voucher-value">{voucher.description || 'Instant voucher'}</div>
      <div className="voucher-cost">🪙 {voucher.cost?.toLocaleString()} tokens</div>
      <button
        className={`btn btn-sm ${canAfford ? 'btn-primary' : 'btn-ghost'}`}
        onClick={onBuy}
        disabled={!canAfford}
        title={!canAfford ? 'Not enough tokens' : 'Buy now'}
      >
        {canAfford ? 'Buy Now' : 'Need More Tokens'}
      </button>
    </div>
  );
}

function EditProfileModal({ profile, token, onClose, onSaved }) {
  const [form, setForm] = useState({ name: profile.name || '', profile_pic: profile.profile_pic || '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return setError('Name cannot be empty.');
    setLoading(true);
    try {
      await updateProfile({ name: form.name.trim(), profile_pic: form.profile_pic.trim() }, token);
      onSaved();
    } catch (err) {
      setError(err.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2>✏️ Edit Profile</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-name">Name</label>
            <input
              id="edit-name"
              name="name"
              className="form-input"
              value={form.name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-phone">Phone (read-only)</label>
            <input id="edit-phone" className="form-input" value={profile.phone} disabled />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-pic">Profile Picture URL</label>
            <input
              id="edit-pic"
              name="profile_pic"
              className="form-input"
              placeholder="https://…"
              value={form.profile_pic}
              onChange={handleChange}
            />
          </div>
          {form.profile_pic && (
            <div className="edit-preview">
              <img src={form.profile_pic} alt="Preview" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
          )}
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="empty-state">
      <span style={{ fontSize: '2.5rem' }}>{icon}</span>
      <p>{text}</p>
    </div>
  );
}
