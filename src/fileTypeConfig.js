// fileTypeConfig.js
// Maps file extensions → { color, label, group, extensions[] }

export const FILE_TYPE_CONFIG = {
    // ── Spreadsheets ────────────────────────────────────────────
    excel: {
        label: 'X',
        color: '#1d6f42',
        group: 'Spreadsheet',
        extensions: ['xls', 'xlsx', 'xlsm', 'xlsb', 'ods'],
    },

    // ── Word processing ─────────────────────────────────────────
    word: {
        label: 'W',
        color: '#2b579a',
        group: 'Document',
        extensions: ['doc', 'docx', 'odt', 'rtf'],
    },

    // ── Presentations ────────────────────────────────────────────
    powerpoint: {
        label: 'P',
        color: '#c43e1c',
        group: 'Presentation',
        extensions: ['ppt', 'pptx', 'odp'],
    },

    // ── PDF ──────────────────────────────────────────────────────
    pdf: {
        label: 'PDF',
        color: '#e03030',
        group: 'PDF',
        extensions: ['pdf'],
    },

    // ── Images ───────────────────────────────────────────────────
    image: {
        label: 'IMG',
        color: '#7c3aed',
        group: 'Image',
        extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tif', 'tiff', 'heic', 'heif'],
    },

    // ── Code / markup ────────────────────────────────────────────
    code: {
        label: '<>',
        color: '#0891b2',
        group: 'Code',
        extensions: ['json', 'xml', 'html', 'md'],
    },

    // ── CSV ──────────────────────────────────────────────────────
    csv: {
        label: 'CSV',
        color: '#059669',
        group: 'CSV',
        extensions: ['csv'],
    },

    // ── Email ────────────────────────────────────────────────────
    email: {
        label: '@',
        color: '#d97706',
        group: 'Email',
        extensions: ['eml', 'msg'],
    },

    // ── Archive / diagram ────────────────────────────────────────
    archive: {
        label: 'ZIP',
        color: '#64748b',
        group: 'Archive',
        extensions: ['vsdx', 'zip', 'iso'],
    },

    // ── Plain text ───────────────────────────────────────────────
    txt: {
        label: 'TXT',
        color: '#6b7280',
        group: 'Text',
        extensions: ['txt'],
    },

    // ── XPS ──────────────────────────────────────────────────────
    xps: {
        label: 'XPS',
        color: '#4f46e5',
        group: 'XPS',
        extensions: ['xps'],
    },

    // ── Default fallback ─────────────────────────────────────────
    default: {
        label: 'FILE',
        color: '#374151',
        group: 'Other',
        extensions: [],
    },
};

/**
 * Returns the config entry for a given file extension.
 * Falls back to the `default` entry if no match is found.
 */
export function getConfigForExtension(ext = '') {
    const lower = ext.toLowerCase().replace(/^\./, '');
    const entry = Object.values(FILE_TYPE_CONFIG).find(
        (cfg) => cfg.extensions.includes(lower)
    );
    return entry ?? FILE_TYPE_CONFIG.default;
}
