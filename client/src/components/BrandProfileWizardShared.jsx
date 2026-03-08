import { Fragment, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Pencil, Check, X, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import styles from '../pages/NewBrandProfilePage.module.css';
import modalStyles from './LogoutModal.module.css';
import {
  VOLUME_COLORS,
  DIFFICULTY_COLORS,
  VOL_ORDER,
  DIFF_ORDER,
} from './BrandProfileWizardConstants';

// ===== Sort icon =====
export function SortIcon({ active, dir }) {
  if (!active) return <ChevronUp size={11} className={styles.sortIconOff} />;
  return dir === 'asc'
    ? <ChevronUp size={11} className={styles.sortIconOn} />
    : <ChevronDown size={11} className={styles.sortIconOn} />;
}

// ===== Primary keywords table =====
export function KeywordsTable({ className, title, description, icon: Icon, iconClass, initialKeywords, onDataChange }) {
  const [keywords, setKeywords] = useState(initialKeywords);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editingId, setEditingId] = useState(null);
  const [isNewRow, setIsNewRow] = useState(false);
  const [editDraft, setEditDraft] = useState({ keyword: '', reason: '', volume: 'Medium', difficulty: 'Medium' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showManualWarning, setShowManualWarning] = useState(false);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => { onDataChange?.(keywords); }, [keywords]);

  const allSelected = keywords.length > 0 && selectedIds.size === keywords.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  function handleSort(key) {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else { setSortKey(null); setSortDir('asc'); }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sortedKeywords = useMemo(() => {
    if (!sortKey) return keywords;
    return [...keywords].sort((a, b) => {
      let av, bv;
      if (sortKey === 'keyword')         { av = a.keyword.toLowerCase();    bv = b.keyword.toLowerCase(); }
      else if (sortKey === 'volume')     { av = VOL_ORDER[a.volume];        bv = VOL_ORDER[b.volume]; }
      else if (sortKey === 'difficulty') { av = DIFF_ORDER[a.difficulty];   bv = DIFF_ORDER[b.difficulty]; }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [keywords, sortKey, sortDir]);

  function toggleSelectAll() {
    if (selectedIds.size > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(keywords.map(k => k.id)));
  }

  function toggleSelect(id) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function handleEditStart(kw) {
    setEditingId(kw.id);
    setIsNewRow(false);
    setEditDraft({ keyword: kw.keyword, reason: kw.reason || '', volume: kw.volume, difficulty: kw.difficulty });
  }

  function handleEditSave() {
    setKeywords(prev => prev.map(k => k.id === editingId ? { ...k, ...editDraft } : k));
    setEditingId(null);
    setIsNewRow(false);
  }

  function handleEditCancel() {
    if (isNewRow) setKeywords(prev => prev.filter(k => k.id !== editingId));
    setEditingId(null);
    setIsNewRow(false);
  }

  function handleAddRow() {
    const newId = Date.now();
    setKeywords(prev => {
      let updated = prev;
      if (editingId !== null) updated = prev.map(k => k.id === editingId ? { ...k, ...editDraft } : k);
      return [{ id: newId, keyword: '', reason: '', volume: 'Medium', difficulty: 'Medium' }, ...updated];
    });
    setEditingId(newId);
    setIsNewRow(true);
    setEditDraft({ keyword: '', reason: '', volume: 'Medium', difficulty: 'Medium' });
  }

  function handleDeleteSelected() {
    if (editingId && selectedIds.has(editingId)) { setEditingId(null); setIsNewRow(false); }
    setKeywords(prev => prev.filter(k => !selectedIds.has(k.id)));
    setSelectedIds(new Set());
  }

  return (
    <div className={className}>
      <div className={styles.card3Head}>
        <div className={`${styles.iconSquare} ${iconClass}`}>
          <Icon size={14} strokeWidth={2} />
        </div>
        <div className={styles.card3HeadRow}>
          <div>
            <h2 className={styles.card2Title}>{title}</h2>
            <p className={styles.card2Desc}>{description}</p>
          </div>
          <div className={styles.card3HeadActions}>
            <button className={styles.addRowBtn} onClick={() => setShowManualWarning(true)}>
              <Plus size={13} strokeWidth={2.5} />
              Add keyword
            </button>
            {selectedIds.size > 0 && (
              <button className={styles.deleteSelectedBtn} onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 size={13} />
                Delete selected ({selectedIds.size})
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.kwTable}>
          <colgroup>
            <col className={styles.colCheck} />
            <col />
            <col />
            <col className={styles.colVolume} />
            <col className={styles.colDifficulty} />
            <col className={styles.colActions} />
          </colgroup>
          <thead className={styles.kwThead}>
            <tr>
              <th>
                <input type="checkbox" className={styles.checkboxInput} checked={allSelected}
                  ref={el => { if (el) el.indeterminate = someSelected; }}
                  onChange={toggleSelectAll} />
              </th>
              <th className={styles.sortable} onClick={() => handleSort('keyword')}>
                Keyword <SortIcon active={sortKey === 'keyword'} dir={sortDir} />
              </th>
              <th>Reason for selection</th>
              <th className={styles.sortable} onClick={() => handleSort('volume')}>
                Volume <SortIcon active={sortKey === 'volume'} dir={sortDir} />
              </th>
              <th className={styles.sortable} onClick={() => handleSort('difficulty')}>
                Difficulty <SortIcon active={sortKey === 'difficulty'} dir={sortDir} />
              </th>
              <th />
            </tr>
          </thead>
          <tbody className={styles.kwTbody}>
            {sortedKeywords.map(kw => {
              const isEditing = editingId === kw.id;
              const isAdding  = isEditing && isNewRow;
              return (
                <Fragment key={kw.id}>
                  <tr className={[
                    styles.kwRow,
                    isAdding               ? styles.kwRowNew     : '',
                    isEditing && !isAdding ? styles.kwRowEditing : '',
                    selectedIds.has(kw.id) ? styles.kwRowSelected : '',
                  ].filter(Boolean).join(' ')}>
                    <td>
                      <input type="checkbox" className={styles.checkboxInput}
                        checked={selectedIds.has(kw.id)} onChange={() => toggleSelect(kw.id)} />
                    </td>
                    {isEditing ? (
                      <>
                        <td className={styles.tdEdit}>
                          <input className={styles.editInput} value={editDraft.keyword}
                            onChange={e => setEditDraft(d => ({ ...d, keyword: e.target.value }))}
                            onKeyDown={e => { if (e.key === 'Enter') handleEditSave(); if (e.key === 'Escape') handleEditCancel(); }}
                            placeholder="Enter keyword" autoFocus />
                        </td>
                        <td className={styles.tdEdit}>
                          <input className={styles.editInput} value={editDraft.reason}
                            onChange={e => setEditDraft(d => ({ ...d, reason: e.target.value }))}
                            onKeyDown={e => { if (e.key === 'Enter') handleEditSave(); if (e.key === 'Escape') handleEditCancel(); }}
                            placeholder="Reason for selection" />
                        </td>
                        <td className={styles.tdEdit}>
                          <select className={styles.editSelect} value={editDraft.volume}
                            onChange={e => setEditDraft(d => ({ ...d, volume: e.target.value }))}>
                            <option>High</option><option>Medium</option><option>Low</option>
                          </select>
                        </td>
                        <td className={styles.tdEdit}>
                          <select className={styles.editSelect} value={editDraft.difficulty}
                            onChange={e => setEditDraft(d => ({ ...d, difficulty: e.target.value }))}>
                            <option>Low</option><option>Medium</option><option>High</option>
                          </select>
                        </td>
                        <td>
                          {!isAdding && (
                            <div className={`${styles.actionsCell} ${styles.editIconActions}`}>
                              <button className={`${styles.rowIconBtn} ${styles.rowIconBtnSave}`} onClick={handleEditSave} title="Save"><Check size={13} /></button>
                              <button className={`${styles.rowIconBtn} ${styles.rowIconBtnCancel}`} onClick={handleEditCancel} title="Cancel"><X size={13} /></button>
                            </div>
                          )}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className={styles.tdFit}>
                          <div className={styles.cellFit} style={{ fontSize: '14px' }}>{kw.keyword}</div>
                        </td>
                        <td className={styles.tdReason} title={kw.reason}>
                          <div className={styles.cellClamp} style={{ fontSize: '13px', color: 'var(--text-2)' }}>{kw.reason}</div>
                        </td>
                        <td><span className={styles.kwTag} style={VOLUME_COLORS[kw.volume]}>{kw.volume}</span></td>
                        <td><span className={styles.kwTag} style={DIFFICULTY_COLORS[kw.difficulty]}>{kw.difficulty}</span></td>
                        <td>
                          <div className={styles.actionsCell}>
                            <button className={styles.rowIconBtn} onClick={() => handleEditStart(kw)} title="Edit"><Pencil size={13} /></button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                  {isEditing && (
                    <tr className={`${styles.saveCancelRow} ${!isAdding ? styles.saveCancelRowEdit : ''}`}>
                      <td colSpan={6} className={styles.saveCancelCell}>
                        <div className={styles.saveCancelBtns}>
                          <button className={styles.cancelTextBtn} onClick={handleEditCancel}>Cancel</button>
                          <button className={styles.saveTextBtn} onClick={handleEditSave}>Save</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {showDeleteConfirm && createPortal(
        <div className={modalStyles.backdrop} onClick={() => setShowDeleteConfirm(false)}>
          <div className={modalStyles.sheet} onClick={e => e.stopPropagation()}>
            <p className={modalStyles.title}>Delete keywords</p>
            <p className={modalStyles.message}>Selected keywords will be permanently removed from this profile. This cannot be undone.</p>
            <div className={modalStyles.actions}>
              <button className={modalStyles.cancelBtn} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className={modalStyles.logoutBtn} onClick={() => { handleDeleteSelected(); setShowDeleteConfirm(false); }}>Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showManualWarning && createPortal(
        <div className={modalStyles.backdrop} onClick={() => setShowManualWarning(false)}>
          <div className={modalStyles.sheet} onClick={e => e.stopPropagation()}>
            <p className={modalStyles.title}>Manual input</p>
            <p className={modalStyles.message}>AI won't process this keyword automatically. You'll need to manually add corresponding entries across all relevant steps in this workflow.</p>
            <div className={modalStyles.actions}>
              <button className={modalStyles.cancelBtn} onClick={() => setShowManualWarning(false)}>Cancel</button>
              <button className={modalStyles.primaryBtn} onClick={() => { setShowManualWarning(false); handleAddRow(); }}>Proceed</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ===== Grouped keywords table (related, LSI, long tail, LLM questions) =====
export function GroupedKeywordsTable({ className, title, description, icon: Icon, iconClass, initialData, keywordField, keywordLabel, primaryKeywords, addLabel = 'Add keyword', truncateKeyword = false, onDataChange }) {
  const [data, setData] = useState(initialData);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editingId, setEditingId] = useState(null);
  const [isNewRow, setIsNewRow] = useState(false);
  const [editDraft, setEditDraft] = useState({ primaryKeyword: '', [keywordField]: '', volume: 'Medium', difficulty: 'Medium' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showManualWarning, setShowManualWarning] = useState(false);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => { onDataChange?.(data); }, [data]);

  const pkOptions = useMemo(() =>
    [...new Set(primaryKeywords.map(k => k.keyword))].sort((a, b) => a.localeCompare(b)),
    [primaryKeywords]
  );

  function handleSort(key) {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else { setSortKey(null); setSortDir('asc'); }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sortedData = useMemo(() => {
    const arr = [...data];
    if (!sortKey) {
      return arr.sort((a, b) => {
        const pkCmp = (a.primaryKeyword || '').localeCompare(b.primaryKeyword || '');
        if (pkCmp !== 0) return pkCmp;
        return (a[keywordField] || '').localeCompare(b[keywordField] || '');
      });
    }
    return arr.sort((a, b) => {
      let av, bv;
      if (sortKey === 'primaryKeyword')  { av = (a.primaryKeyword || '').toLowerCase();  bv = (b.primaryKeyword || '').toLowerCase(); }
      else if (sortKey === keywordField) { av = (a[keywordField]  || '').toLowerCase();  bv = (b[keywordField]  || '').toLowerCase(); }
      else if (sortKey === 'volume')     { av = VOL_ORDER[a.volume];   bv = VOL_ORDER[b.volume]; }
      else if (sortKey === 'difficulty') { av = DIFF_ORDER[a.difficulty]; bv = DIFF_ORDER[b.difficulty]; }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDir, keywordField]);

  const allSelected = data.length > 0 && selectedIds.size === data.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  function toggleSelectAll() {
    if (selectedIds.size > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(data.map(r => r.id)));
  }

  function toggleSelect(id) {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  function handleEditStart(row) {
    setEditingId(row.id);
    setIsNewRow(false);
    setEditDraft({ primaryKeyword: row.primaryKeyword, [keywordField]: row[keywordField] || '', volume: row.volume, difficulty: row.difficulty });
  }

  function handleEditSave() {
    setData(prev => prev.map(r => r.id === editingId ? { ...r, ...editDraft } : r));
    setEditingId(null);
    setIsNewRow(false);
  }

  function handleEditCancel() {
    if (isNewRow) setData(prev => prev.filter(r => r.id !== editingId));
    setEditingId(null);
    setIsNewRow(false);
  }

  function handleAddRow() {
    const newId = Date.now();
    const defaultPk = pkOptions[0] || '';
    setData(prev => {
      let updated = prev;
      if (editingId !== null) updated = prev.map(r => r.id === editingId ? { ...r, ...editDraft } : r);
      return [...updated, { id: newId, primaryKeyword: defaultPk, [keywordField]: '', volume: 'Medium', difficulty: 'Medium' }];
    });
    setEditingId(newId);
    setIsNewRow(true);
    setEditDraft({ primaryKeyword: defaultPk, [keywordField]: '', volume: 'Medium', difficulty: 'Medium' });
  }

  function handleDeleteSelected() {
    if (editingId && selectedIds.has(editingId)) { setEditingId(null); setIsNewRow(false); }
    setData(prev => prev.filter(r => !selectedIds.has(r.id)));
    setSelectedIds(new Set());
  }

  return (
    <div className={`${className} ${styles.grouped}`}>
      <div className={styles.card3Head}>
        <div className={`${styles.iconSquare} ${iconClass}`}>
          <Icon size={14} strokeWidth={2} />
        </div>
        <div className={styles.card3HeadRow}>
          <div>
            <h2 className={styles.card2Title}>{title}</h2>
            <p className={styles.card2Desc}>{description}</p>
          </div>
          <div className={styles.card3HeadActions}>
            <button className={styles.addRowBtn} onClick={() => setShowManualWarning(true)}>
              <Plus size={13} strokeWidth={2.5} />
              {addLabel}
            </button>
            {selectedIds.size > 0 && (
              <button className={styles.deleteSelectedBtn} onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 size={13} />
                Delete selected ({selectedIds.size})
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.kwTable}>
          <colgroup>
            <col className={styles.colCheck} />
            <col />
            <col />
            <col className={styles.colVolume} />
            <col className={styles.colDifficulty} />
            <col className={styles.colActions} />
          </colgroup>
          <thead className={styles.kwThead}>
            <tr>
              <th>
                <input type="checkbox" className={styles.checkboxInput} checked={allSelected}
                  ref={el => { if (el) el.indeterminate = someSelected; }}
                  onChange={toggleSelectAll} />
              </th>
              <th className={styles.sortable} onClick={() => handleSort('primaryKeyword')}>
                Primary keyword <SortIcon active={sortKey === 'primaryKeyword'} dir={sortDir} />
              </th>
              <th className={styles.sortable} onClick={() => handleSort(keywordField)}>
                {keywordLabel} <SortIcon active={sortKey === keywordField} dir={sortDir} />
              </th>
              <th className={styles.sortable} onClick={() => handleSort('volume')}>
                Volume <SortIcon active={sortKey === 'volume'} dir={sortDir} />
              </th>
              <th className={styles.sortable} onClick={() => handleSort('difficulty')}>
                Difficulty <SortIcon active={sortKey === 'difficulty'} dir={sortDir} />
              </th>
              <th />
            </tr>
          </thead>
          <tbody className={styles.kwTbody}>
            {sortedData.map(row => {
              const isEditing = editingId === row.id;
              const isAdding  = isEditing && isNewRow;
              return (
                <Fragment key={row.id}>
                  <tr className={[
                    styles.kwRow,
                    isAdding               ? styles.kwRowNew      : '',
                    isEditing && !isAdding ? styles.kwRowEditing  : '',
                    selectedIds.has(row.id) ? styles.kwRowSelected : '',
                  ].filter(Boolean).join(' ')}>
                    <td>
                      <input type="checkbox" className={styles.checkboxInput}
                        checked={selectedIds.has(row.id)} onChange={() => toggleSelect(row.id)} />
                    </td>
                    {isEditing ? (
                      <>
                        <td className={styles.tdEdit}>
                          <select className={styles.editSelect} value={editDraft.primaryKeyword}
                            onChange={e => setEditDraft(d => ({ ...d, primaryKeyword: e.target.value }))}>
                            {pkOptions.map(pk => <option key={pk}>{pk}</option>)}
                          </select>
                        </td>
                        <td className={styles.tdEdit}>
                          <input className={styles.editInput} value={editDraft[keywordField]}
                            onChange={e => setEditDraft(d => ({ ...d, [keywordField]: e.target.value }))}
                            onKeyDown={e => { if (e.key === 'Enter') handleEditSave(); if (e.key === 'Escape') handleEditCancel(); }}
                            placeholder={`Enter ${keywordLabel.toLowerCase()}`} autoFocus />
                        </td>
                        <td className={styles.tdEdit}>
                          <select className={styles.editSelect} value={editDraft.volume}
                            onChange={e => setEditDraft(d => ({ ...d, volume: e.target.value }))}>
                            <option>High</option><option>Medium</option><option>Low</option>
                          </select>
                        </td>
                        <td className={styles.tdEdit}>
                          <select className={styles.editSelect} value={editDraft.difficulty}
                            onChange={e => setEditDraft(d => ({ ...d, difficulty: e.target.value }))}>
                            <option>Low</option><option>Medium</option><option>High</option>
                          </select>
                        </td>
                        <td>
                          {!isAdding && (
                            <div className={`${styles.actionsCell} ${styles.editIconActions}`}>
                              <button className={`${styles.rowIconBtn} ${styles.rowIconBtnSave}`} onClick={handleEditSave} title="Save"><Check size={13} /></button>
                              <button className={`${styles.rowIconBtn} ${styles.rowIconBtnCancel}`} onClick={handleEditCancel} title="Cancel"><X size={13} /></button>
                            </div>
                          )}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className={truncateKeyword ? styles.tdFit : undefined}>
                          <div className={truncateKeyword ? styles.cellFit : undefined} style={{ fontSize: '14px' }}>{row.primaryKeyword}</div>
                        </td>
                        <td className={styles.tdFit}>
                          <div className={styles.cellFit} style={{ fontSize: '14px' }}>{row[keywordField]}</div>
                        </td>
                        <td><span className={styles.kwTag} style={VOLUME_COLORS[row.volume]}>{row.volume}</span></td>
                        <td><span className={styles.kwTag} style={DIFFICULTY_COLORS[row.difficulty]}>{row.difficulty}</span></td>
                        <td>
                          <div className={styles.actionsCell}>
                            <button className={styles.rowIconBtn} onClick={() => handleEditStart(row)} title="Edit"><Pencil size={13} /></button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                  {isEditing && (
                    <tr className={`${styles.saveCancelRow} ${!isAdding ? styles.saveCancelRowEdit : ''}`}>
                      <td colSpan={6} className={styles.saveCancelCell}>
                        <div className={styles.saveCancelBtns}>
                          <button className={styles.cancelTextBtn} onClick={handleEditCancel}>Cancel</button>
                          <button className={styles.saveTextBtn} onClick={handleEditSave}>Save</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {showDeleteConfirm && createPortal(
        <div className={modalStyles.backdrop} onClick={() => setShowDeleteConfirm(false)}>
          <div className={modalStyles.sheet} onClick={e => e.stopPropagation()}>
            <p className={modalStyles.title}>Delete keywords</p>
            <p className={modalStyles.message}>Selected keywords will be permanently removed from this profile. This cannot be undone.</p>
            <div className={modalStyles.actions}>
              <button className={modalStyles.cancelBtn} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className={modalStyles.logoutBtn} onClick={() => { handleDeleteSelected(); setShowDeleteConfirm(false); }}>Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showManualWarning && createPortal(
        <div className={modalStyles.backdrop} onClick={() => setShowManualWarning(false)}>
          <div className={modalStyles.sheet} onClick={e => e.stopPropagation()}>
            <p className={modalStyles.title}>Manual input</p>
            <p className={modalStyles.message}>AI won't process this entry automatically. You'll need to manually add corresponding entries across all relevant steps in this workflow.</p>
            <div className={modalStyles.actions}>
              <button className={modalStyles.cancelBtn} onClick={() => setShowManualWarning(false)}>Cancel</button>
              <button className={modalStyles.primaryBtn} onClick={() => { setShowManualWarning(false); handleAddRow(); }}>Proceed</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
