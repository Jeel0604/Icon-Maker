import { useState, useCallback, useRef } from 'react';
import JSZip from 'jszip';
import { FileIcon } from './FileIcon';

// ── Constants ──────────────────────────────────────────────────
const H = 20; // viewBox height — used for offset max calc

const PRESETS = [
    { label: 'X', color: '#1d6f42', name: 'Excel' },
    { label: 'W', color: '#2b579a', name: 'Word' },
    { label: 'P', color: '#c43e1c', name: 'PowerPoint' },
    { label: 'PDF', color: '#e03030', name: 'PDF' },
    { label: 'IMG', color: '#7c3aed', name: 'Image' },
    { label: '<>', color: '#0891b2', name: 'Code' },
    { label: 'CSV', color: '#059669', name: 'CSV' },
    { label: '@', color: '#d97706', name: 'Email' },
    { label: 'ZIP', color: '#64748b', name: 'Archive' },
    { label: 'TXT', color: '#6b7280', name: 'Text' },
    { label: 'XPS', color: '#4f46e5', name: 'XPS' },
    { label: 'FILE', color: '#374151', name: 'Default' },
];

const PREVIEW_SIZES = [16, 20, 24, 32, 48, 64, 96];

const DEFAULT_CONFIG = {
    label: 'PDF',
    color: '#e03030',
    bannerHeight: 5,
    foldSize: 4,
    bannerOffset: 0,
    alignment: 'center',
    folded: true,
    bodyColor: '#2d2d2d',
    foldColor: '#1a1a1a',
    bannerOverhang: 'none',
    bannerOverhangSize: 3,
};

// ── SVG string builder ─────────────────────────────────────────
// NOTE: no <filter> — exported SVGs must be clean. Drop-shadow is CSS-only.
function buildSvgString(cfg, size = 128) {
    const { color, label, bannerHeight, foldSize, bannerOffset,
        alignment, folded, bodyColor, foldColor,
        bannerOverhang = 'none', bannerOverhangSize = 3 } = cfg;
    const W = 16;
    const fold = Math.max(1, Math.min(foldSize, 7));
    const bannerH = Math.max(3, Math.min(bannerHeight, 8));
    const r = 1.2;
    const maxOff = (H - bannerH) / 2;
    const offset = Math.max(0, Math.min(bannerOffset, maxOff));
    const overhang = Math.max(1, Math.min(bannerOverhangSize, 8));
    const renderW = size;
    const renderH = Math.round(size * (H / W));

    const body = folded
        ? `M2,0 L${W - fold},0 L${W},${fold} L${W},${H - r} Q${W},${H} ${W - r},${H} L${r},${H} Q0,${H} 0,${H - r} L0,2 Q0,0 2,0 Z`
        : `M2,0 L${W - r},0 Q${W},0 ${W},${r} L${W},${H - r} Q${W},${H} ${W - r},${H} L${r},${H} Q0,${H} 0,${H - r} L0,2 Q0,0 2,0 Z`;
    const foldP = `M${W - fold},0 L${W - fold},${fold} L${W},${fold} Z`;

    const bannerY = H - bannerH - offset;
    const hasOH = bannerOverhang !== 'none';
    const bannerX = bannerOverhang === 'left' ? -overhang : 0;
    const bannerW = hasOH ? W + overhang : W;

    const ty = bannerY + bannerH / 2;
    const tx = alignment === 'left' ? 2.5 : alignment === 'right' ? W - 2.5 : W / 2;
    const anchor = alignment === 'left' ? 'start' : alignment === 'right' ? 'end' : 'middle';
    const fs = label.length > 3 ? '3.2' : label.length > 2 ? '3.6' : '4.4';
    const up = label.toUpperCase();

    const clipAttr = hasOH ? '' : 'clip-path="url(#clip)"';
    const rxAttr = hasOH ? 'rx="0.6" ry="0.6"' : '';

    return `<svg width="${renderW}" height="${renderH}" viewBox="0 0 ${W} ${H}" overflow="visible" xmlns="http://www.w3.org/2000/svg" aria-label="${up} file icon">
  <defs>
    <clipPath id="clip"><path d="${body}"/></clipPath>
  </defs>
  <path d="${body}" fill="${bodyColor}"/>
  ${folded ? `<path d="${foldP}" fill="${foldColor}"/>` : ''}
  <rect x="${bannerX}" y="${bannerY}" width="${bannerW}" height="${bannerH}" fill="${color}" ${rxAttr} ${clipAttr}/>
  <text x="${tx}" y="${ty}" text-anchor="${anchor}" dominant-baseline="central" fill="#fff" font-size="${fs}" font-family="'Inter','Segoe UI',system-ui,sans-serif" font-weight="700" letter-spacing="0">${up}</text>
</svg>`;
}

function slugify(s) {
    return s.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'icon';
}

// ── Sub-components ─────────────────────────────────────────────
function SliderRow({ label, value, min, max, step = 0.5, onChange, hint }) {
    return (
        <div className="panel-section">
            <label className="panel-label">
                {label}
                <span className="panel-value">{value}</span>
            </label>
            <input type="range" className="panel-range"
                min={min} max={max} step={step} value={value}
                onChange={(e) => onChange(Number(e.target.value))} />
            <div className="range-labels">
                <span>{hint ? hint[0] : min}</span>
                <span>{hint ? hint[1] : max}</span>
            </div>
        </div>
    );
}

function MiniColorPicker({ label, value, onChange }) {
    return (
        <div className="mini-color-row">
            <span className="mini-color-label">{label}</span>
            <div className="mini-color-wrap">
                <input type="color" className="color-native mini-native"
                    value={value} onChange={(e) => onChange(e.target.value)} />
                <span className="mini-color-hex">{value.toUpperCase()}</span>
            </div>
        </div>
    );
}

const AlignIcon = ({ type, active, onClick }) => (
    <button className={`align-btn ${active ? 'align-btn--active' : ''}`}
        onClick={onClick} title={`Align ${type}`} aria-pressed={active}>
        {type === 'left' && <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="12" height="1.5" rx=".75" fill="currentColor" /><rect x="1" y="5.5" width="8" height="1.5" rx=".75" fill="currentColor" /><rect x="1" y="9" width="10" height="1.5" rx=".75" fill="currentColor" /></svg>}
        {type === 'center' && <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="12" height="1.5" rx=".75" fill="currentColor" /><rect x="3" y="5.5" width="8" height="1.5" rx=".75" fill="currentColor" /><rect x="2" y="9" width="10" height="1.5" rx=".75" fill="currentColor" /></svg>}
        {type === 'right' && <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="12" height="1.5" rx=".75" fill="currentColor" /><rect x="5" y="5.5" width="8" height="1.5" rx=".75" fill="currentColor" /><rect x="3" y="9" width="10" height="1.5" rx=".75" fill="currentColor" /></svg>}
    </button>
);

// ══════════════════════════════════════════════════════════════
export default function IconBuilder() {
    const [draft, setDraft] = useState({ ...DEFAULT_CONFIG });
    const [editingId, setEditingId] = useState(null);
    const [bucket, setBucket] = useState([]);
    const [selected, setSelected] = useState(new Set());
    const nextId = useRef(1);
    const [batchColor, setBatchColor] = useState('#6366f1');
    const [batchBarActive, setBatchBarActive] = useState(false);
    const [dlState, setDlState] = useState('idle');

    // ── Draft helpers ──────────────────────────────────────────
    const set = (key, val) => setDraft((d) => ({ ...d, [key]: val }));

    const handleReset = () => {
        setDraft({ ...DEFAULT_CONFIG });
        setEditingId(null);
    };

    // When bannerHeight changes, clamp offset to new max
    const handleBannerHeight = (v) => {
        setDraft((d) => ({
            ...d,
            bannerHeight: v,
            bannerOffset: Math.min(d.bannerOffset, (H - v) / 2),
        }));
    };

    const signalDone = () => {
        setDlState('done');
        setTimeout(() => setDlState('idle'), 2000);
    };

    // ── Bucket ops ─────────────────────────────────────────────
    const handleAddOrUpdate = () => {
        if (editingId) {
            setBucket((b) => b.map((item) => item.id === editingId ? { ...draft, id: editingId } : item));
            setEditingId(null);
        } else {
            const id = String(nextId.current++);
            setBucket((b) => [...b, { ...draft, id }]);
        }
    };

    const handleCancelEdit = () => { setEditingId(null); setDraft({ ...DEFAULT_CONFIG }); };
    const loadIntoPanel = (item) => { const { id, ...cfg } = item; setDraft(cfg); setEditingId(id); };

    const toggleSelect = (id, e) => {
        e.stopPropagation();
        setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
    };
    const selectAll = () => setSelected(new Set(bucket.map((i) => i.id)));
    const clearSel = () => setSelected(new Set());

    const deleteItem = (id, e) => {
        e.stopPropagation();
        setBucket((b) => b.filter((i) => i.id !== id));
        setSelected((s) => { const n = new Set(s); n.delete(id); return n; });
        if (editingId === id) { setEditingId(null); setDraft({ ...DEFAULT_CONFIG }); }
    };

    const deleteSelected = () => {
        setBucket((b) => b.filter((i) => !selected.has(i.id)));
        if (selected.has(editingId)) { setEditingId(null); setDraft({ ...DEFAULT_CONFIG }); }
        clearSel();
    };

    const applyBatchColor = () => {
        setBucket((b) => b.map((i) => selected.has(i.id) ? { ...i, color: batchColor } : i));
        setBatchBarActive(false);
    };

    const exportZip = useCallback(async (items) => {
        if (!items.length) return;
        const zip = new JSZip();
        const counts = {};
        items.forEach((item) => {
            const base = slugify(item.label);
            counts[base] = (counts[base] || 0) + 1;
            const fname = counts[base] > 1 ? `${base}-${counts[base]}.svg` : `${base}.svg`;
            zip.file(fname, buildSvgString(item, 128));
        });
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'file-icons.zip'; a.click();
        URL.revokeObjectURL(url);
        signalDone();
    }, []);

    const downloadSingle = () => {
        const svg = buildSvgString(draft, 128);
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${slugify(draft.label)}.svg`; a.click();
        URL.revokeObjectURL(url);
        signalDone();
    };

    const selectedItems = bucket.filter((i) => selected.has(i.id));
    const hasSelection = selected.size > 0;
    const bannerOffsetMax = parseFloat(((H - draft.bannerHeight) / 2).toFixed(1));

    return (
        <div className="builder-page">

            {/* ══ LEFT: Controls ════════════════════════════ */}
            <aside className="builder-panel">
                {editingId && (
                    <div className="edit-banner">
                        <span>✏️ Editing icon</span>
                        <button className="edit-cancel" onClick={handleCancelEdit}>✕ Cancel</button>
                    </div>
                )}

                {/* Label */}
                <div className="panel-section">
                    <label className="panel-label">Label</label>
                    <input className="panel-input" value={draft.label} maxLength={5}
                        onChange={(e) => set('label', e.target.value)}
                        placeholder="e.g. PDF" spellCheck={false} />
                    <p className="panel-hint">Up to 5 chars · auto uppercase</p>
                </div>

                {/* Banner colour + presets */}
                <div className="panel-section">
                    <label className="panel-label">Banner colour</label>
                    <div className="color-picker-wrap">
                        <input type="color" className="color-native" value={draft.color}
                            onChange={(e) => set('color', e.target.value)} />
                        <span className="color-hex">{draft.color.toUpperCase()}</span>
                    </div>
                    <div className="preset-grid">
                        {PRESETS.map((p) => (
                            <button key={p.name}
                                className={`preset-swatch ${draft.color === p.color ? 'preset-swatch--active' : ''}`}
                                style={{ '--swatch-color': p.color }}
                                onClick={() => { set('label', p.label); set('color', p.color); }}
                                title={`${p.name} — ${p.color}`} />
                        ))}
                    </div>
                </div>

                {/* Document colours: body + fold */}
                <div className="panel-section">
                    <label className="panel-label">Document colours</label>
                    <div className="doc-color-row">
                        <MiniColorPicker label="Body" value={draft.bodyColor}
                            onChange={(v) => set('bodyColor', v)} />
                        <MiniColorPicker label="Fold" value={draft.foldColor}
                            onChange={(v) => set('foldColor', v)} />
                    </div>
                </div>

                {/* Sliders */}
                <SliderRow label="Banner height" value={draft.bannerHeight}
                    min={3} max={8} step={0.5} onChange={handleBannerHeight} />

                <SliderRow
                    label="Banner position"
                    value={draft.bannerOffset}
                    min={0} max={bannerOffsetMax} step={0.5}
                    hint={['Bottom', 'Centre']}
                    onChange={(v) => set('bannerOffset', v)}
                />

                <SliderRow label="Fold size" value={draft.foldSize}
                    min={1} max={7} step={0.5}
                    onChange={(v) => { set('foldSize', v); if (!draft.folded) set('folded', true); }} />

                {/* Alignment */}
                <div className="panel-section">
                    <label className="panel-label">Label alignment</label>
                    <div className="align-group">
                        {['left', 'center', 'right'].map((a) => (
                            <AlignIcon key={a} type={a} active={draft.alignment === a}
                                onClick={() => set('alignment', a)} />
                        ))}
                    </div>
                </div>

                {/* Fold toggle */}
                <div className="panel-section">
                    <label className="panel-label">Folded corner</label>
                    <button className={`toggle-btn ${draft.folded ? 'toggle-btn--on' : ''}`}
                        onClick={() => set('folded', !draft.folded)} role="switch" aria-checked={draft.folded}>
                        <span className="toggle-thumb" />
                        <span className="toggle-text">{draft.folded ? 'On' : 'Off'}</span>
                    </button>
                </div>

                {/* Banner overhang */}
                <div className="panel-section">
                    <label className="panel-label">Ribbon overhang</label>
                    <div className="overhang-group">
                        {[
                            { val: 'left', icon: '← Left' },
                            { val: 'none', icon: 'None' },
                            { val: 'right', icon: 'Right →' },
                        ].map(({ val, icon }) => (
                            <button key={val}
                                className={`overhang-btn ${draft.bannerOverhang === val ? 'overhang-btn--active' : ''}`}
                                onClick={() => set('bannerOverhang', val)}>
                                {icon}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Overhang size — only when active */}
                {draft.bannerOverhang !== 'none' && (
                    <SliderRow
                        label="Ribbon width"
                        value={draft.bannerOverhangSize}
                        min={1} max={8} step={0.5}
                        hint={['Narrow', 'Wide']}
                        onChange={(v) => set('bannerOverhangSize', v)}
                    />
                )}

                {/* Reset */}
                <button className="btn-reset" onClick={handleReset}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M11 6.5A4.5 4.5 0 1 1 6.5 2c1.2 0 2.3.47 3.1 1.25L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M11 2v3H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Reset to defaults
                </button>

                {/* Add to Bucket + single download */}
                <div className="panel-actions">
                    <button className="btn-add-bucket" onClick={handleAddOrUpdate}>
                        {editingId ? (
                            <><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg> Update Icon</>
                        ) : (
                            <><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg> Add to Bucket</>
                        )}
                    </button>
                    <button className={`btn-download-single ${dlState === 'done' ? 'btn-done' : ''}`}
                        onClick={downloadSingle} title="Download this icon as SVG">
                        {dlState === 'done' ? '✓' : (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M7 1v8M4.5 6.5l2.5 2.5 2.5-2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M1 11h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                        )}
                    </button>
                </div>
            </aside>

            {/* ══ RIGHT: Preview + Bucket ════════════════════ */}
            <div className="builder-right">

                {/* Live preview */}
                <section className="builder-preview">
                    <div className="preview-hero">
                        <FileIcon {...draft} size={120} docId="preview-hero" />
                    </div>
                    <div className="preview-sizes">
                        {PREVIEW_SIZES.map((px) => (
                            <div className="preview-size-cell" key={px}>
                                <div className="preview-size-icon">
                                    <FileIcon {...draft} size={px} docId={`preview-${px}`} />
                                </div>
                                <span className="preview-size-label">{px}px</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Bucket */}
                <section className="bucket-section">
                    <div className="bucket-header">
                        <div className="bucket-title-row">
                            <h2 className="bucket-title">
                                Bucket
                                {bucket.length > 0 && <span className="bucket-count">{bucket.length}</span>}
                            </h2>
                            {bucket.length > 0 && (
                                <div className="bucket-header-actions">
                                    {hasSelection ? (
                                        <>
                                            <button className="hdr-btn" onClick={clearSel}>Clear</button>
                                            <button className="hdr-btn hdr-btn--danger" onClick={deleteSelected}>
                                                Delete {selected.size}
                                            </button>
                                            <button
                                                className={`hdr-btn hdr-btn--accent ${batchBarActive ? 'hdr-btn--active' : ''}`}
                                                onClick={() => setBatchBarActive((v) => !v)}>
                                                🎨 Recolour {selected.size}
                                            </button>
                                            <button className="hdr-btn hdr-btn--export"
                                                onClick={() => exportZip(selectedItems)}>
                                                ↓ Export {selected.size}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="hdr-btn" onClick={selectAll}>Select all</button>
                                            <button
                                                className={`hdr-btn hdr-btn--export ${dlState === 'done' ? 'hdr-btn--done' : ''}`}
                                                onClick={() => exportZip(bucket)}>
                                                {dlState === 'done' ? '✓ Done' : `↓ Export all (${bucket.length})`}
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {batchBarActive && hasSelection && (
                            <div className="batch-bar">
                                <span className="batch-bar-label">Apply colour to {selected.size} icons:</span>
                                <div className="color-picker-wrap batch-picker">
                                    <input type="color" className="color-native"
                                        value={batchColor} onChange={(e) => setBatchColor(e.target.value)} />
                                    <span className="color-hex">{batchColor.toUpperCase()}</span>
                                </div>
                                <button className="btn-apply-color" onClick={applyBatchColor}>Apply</button>
                                <button className="hdr-btn" onClick={() => setBatchBarActive(false)}>Cancel</button>
                            </div>
                        )}
                    </div>

                    {bucket.length === 0 && (
                        <div className="bucket-empty">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" opacity=".3">
                                <rect x="8" y="4" width="24" height="30" rx="3" fill="#fff" />
                                <path d="M28 4l8 8h-8V4z" fill="#aaa" />
                                <rect x="8" y="28" width="24" height="6" rx="2" fill="#6366f1" />
                            </svg>
                            <p>Add icons to the bucket to export them together</p>
                        </div>
                    )}

                    {bucket.length > 0 && (
                        <div className="bucket-grid">
                            {bucket.map((item) => {
                                const isSelected = selected.has(item.id);
                                const isEditing = editingId === item.id;
                                return (
                                    <div key={item.id}
                                        className={`bucket-cell ${isSelected ? 'bucket-cell--selected' : ''} ${isEditing ? 'bucket-cell--editing' : ''}`}
                                        onClick={() => loadIntoPanel(item)} title="Click to edit">
                                        <button className={`bucket-check ${isSelected ? 'bucket-check--on' : ''}`}
                                            onClick={(e) => toggleSelect(item.id, e)} aria-label="Select">
                                            {isSelected && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l3 3 4-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                        </button>
                                        <button className="bucket-delete"
                                            onClick={(e) => deleteItem(item.id, e)} aria-label="Delete">✕</button>
                                        <FileIcon {...item} size={40} docId={`bucket-${item.id}`} />
                                        <span className="bucket-cell-label">{item.label.toUpperCase()}</span>
                                        {isEditing && <span className="editing-badge">editing</span>}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
