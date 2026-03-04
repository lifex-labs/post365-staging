import { useState } from 'react';
import { Plus, X, Globe, Pencil, Trash2, PenLine } from 'lucide-react';
import styles from './ProfilesPage.module.css';

const IND_COLOR  = { bg: '#dbeafe', text: '#1d4ed8' };
const TONE_COLOR = { bg: '#dcfce7', text: '#15803d' };

const SAMPLE_PROFILES = [
  {
    id: 1,
    name: 'TechCorp Solutions',
    website: 'techcorp.io',
    industry: 'Software Development',
    brandTone: 'Authoritative',
    targetAudience: 'CTOs and engineering leads at mid-market enterprises',
    usp: 'Enterprise-grade AI automation for complex multi-system workflows',
  },
  {
    id: 2,
    name: 'StyleHive',
    website: 'stylehive.com',
    industry: 'E-commerce',
    brandTone: 'Friendly',
    targetAudience: 'Fashion-forward millennials and Gen Z shoppers aged 20 to 35',
    usp: 'Curated sustainable fashion collections at accessible price points',
  },
  {
    id: 3,
    name: 'GrowthMind',
    website: 'growthmind.co',
    industry: 'Marketing & Advertising',
    brandTone: 'Conversational',
    targetAudience: 'Startup founders and growth marketers at early-stage companies',
    usp: 'Data-driven growth frameworks that triple customer acquisition in 90 days',
  },
  {
    id: 4,
    name: 'MedTrack',
    website: 'medtrack.health',
    industry: 'Healthcare Technology',
    brandTone: 'Professional',
    targetAudience: 'Hospital administrators and clinical care teams in acute care settings',
    usp: 'Real-time patient flow optimization that reduces wait times by 40%',
  },
  {
    id: 5,
    name: 'LearnForge',
    website: 'learnforge.io',
    industry: 'EdTech',
    brandTone: 'Inspiring',
    targetAudience: 'Corporate L&D managers and HR teams at companies with 500 or more employees',
    usp: 'Adaptive learning paths that cut new hire onboarding time in half',
  },
];

const EMPTY_FORM = {
  name: '',
  website: '',
  industry: '',
  brandTone: '',
  targetAudience: '',
  usp: '',
};

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState(SAMPLE_PROFILES);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState('method');
  const [method, setMethod] = useState('manual');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMethod('manual');
    setModalStep('method');
    setModalOpen(true);
  }

  function openEdit(profile) {
    setEditingId(profile.id);
    setForm({
      name: profile.name,
      website: profile.website,
      industry: profile.industry,
      brandTone: profile.brandTone,
      targetAudience: profile.targetAudience,
      usp: profile.usp,
    });
    setModalStep('form');
    setModalOpen(true);
  }

  function handleDelete(id) {
    setProfiles(prev => prev.filter(p => p.id !== id));
  }

  function handleSave() {
    if (editingId !== null) {
      setProfiles(prev => prev.map(p => p.id === editingId ? { ...p, ...form } : p));
    } else {
      setProfiles(prev => [...prev, { id: Date.now(), ...form }]);
    }
    handleClose();
  }

  function handleClose() {
    setModalOpen(false);
    setModalStep('method');
    setMethod('manual');
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Company profiles</h1>
          <p className={styles.description}>Manage your company brand profiles for content generation and targeting.</p>
        </div>
        <button className={styles.newBtn} onClick={openAdd}>
          <Plus size={14} strokeWidth={2.5} />
          New profile
        </button>
      </header>

      <div className={styles.grid}>
        {profiles.map(profile => (
          <div key={profile.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardName}>{profile.name}</span>
              <div className={styles.cardActions}>
                <button className={styles.iconBtn} onClick={() => openEdit(profile)} title="Edit">
                  <Pencil size={14} />
                </button>
                <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => handleDelete(profile.id)} title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className={styles.websiteRow}>
              <Globe size={12} style={{ flexShrink: 0, color: 'var(--text-2)' }} />
              <span className={styles.websiteText}>{profile.website}</span>
            </div>

            <div className={styles.tagsRow}>
              <span className={styles.tag} style={{ background: IND_COLOR.bg, color: IND_COLOR.text }}>
                {profile.industry}
              </span>
              <span className={styles.tag} style={{ background: TONE_COLOR.bg, color: TONE_COLOR.text }}>
                {profile.brandTone}
              </span>
            </div>

            <div className={styles.cardField}>
              <span className={styles.fieldLabel}>Target Audience</span>
              <p className={styles.fieldText}>{profile.targetAudience}</p>
            </div>

            <div className={styles.cardField}>
              <span className={styles.fieldLabel}>USP</span>
              <p className={styles.fieldText}>{profile.usp}</p>
            </div>
          </div>
        ))}
      </div>

      {/* New / Edit modal */}
      {modalOpen && (
        <div className={styles.backdrop} onClick={handleClose}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>
                {editingId !== null ? 'Edit Profile' : 'New Profile'}
              </span>
              <button className={styles.closeBtn} onClick={handleClose}>
                <X size={16} />
              </button>
            </div>

            {modalStep === 'method' && (
              <>
                <div className={styles.optionGrid}>
                  <button
                    className={`${styles.option} ${method === 'website' ? styles.optionSelected : ''}`}
                    onClick={() => setMethod('website')}
                  >
                    <div className={styles.optionIcon} style={{ background: '#2563eb', color: '#ffffff' }}>
                      <Globe size={13} strokeWidth={2} />
                    </div>
                    <div className={styles.optionText}>
                      <span className={styles.optionLabel}>Fill from website</span>
                      <span className={styles.optionDesc}>Enter your website URL and we'll auto-populate your profile details.</span>
                    </div>
                  </button>
                  <button
                    className={`${styles.option} ${method === 'manual' ? styles.optionSelected : ''}`}
                    onClick={() => setMethod('manual')}
                  >
                    <div className={styles.optionIcon} style={{ background: '#16a34a', color: '#ffffff' }}>
                      <PenLine size={13} strokeWidth={2} />
                    </div>
                    <div className={styles.optionText}>
                      <span className={styles.optionLabel}>Write manually</span>
                      <span className={styles.optionDesc}>Fill in your company profile details manually at your own pace.</span>
                    </div>
                  </button>
                </div>
                <div className={styles.modalFooter}>
                  <button className={styles.cancelBtn} style={{ marginLeft: 'auto' }} onClick={handleClose}>Cancel</button>
                  <button className={styles.primaryBtn} onClick={() => setModalStep('form')}>Next</button>
                </div>
              </>
            )}

            {modalStep === 'form' && (
              <>
                <div className={styles.form}>
                  <div className={styles.field}>
                    <label className={styles.label}>Name</label>
                    <input className={styles.input} name="name" value={form.name} onChange={handleChange} placeholder="e.g. Acme Corp" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Website</label>
                    <input className={styles.input} name="website" value={form.website} onChange={handleChange} placeholder="e.g. acme.com" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Industry</label>
                    <input className={styles.input} name="industry" value={form.industry} onChange={handleChange} placeholder="e.g. Software Development" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Brand Tone</label>
                    <input className={styles.input} name="brandTone" value={form.brandTone} onChange={handleChange} placeholder="e.g. Conversational" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Target Audience</label>
                    <textarea
                      className={styles.textarea}
                      name="targetAudience"
                      value={form.targetAudience}
                      onChange={handleChange}
                      placeholder="Describe your ideal customer or target audience"
                      rows={5}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>USP</label>
                    <textarea
                      className={styles.textarea}
                      name="usp"
                      value={form.usp}
                      onChange={handleChange}
                      placeholder="What makes your company uniquely valuable?"
                      rows={5}
                    />
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  {editingId === null && (
                    <button className={styles.backBtn} onClick={() => setModalStep('method')}>Back</button>
                  )}
                  <button className={styles.cancelBtn} style={{ marginLeft: 'auto' }} onClick={handleClose}>Cancel</button>
                  <button className={styles.primaryBtn} onClick={handleSave} disabled={!form.name.trim()}>Save</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
