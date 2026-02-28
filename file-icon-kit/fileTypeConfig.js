/**
 * fileTypeConfig.js
 * ─────────────────────────────────────────────────────────────────
 * Maps file extensions to FileIcon display properties.
 *
 * Each entry has:
 *   label      {string}    Short text shown in the banner
 *   color      {string}    Banner background color
 *   group      {string}    Human-readable category name
 *   extensions {string[]}  All extensions that map to this type
 *
 * Usage:
 *   import { getConfigForExtension } from './fileTypeConfig';
 *   const { color, label } = getConfigForExtension('xlsx');
 */

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

    // ── Archive ───────────────────────────────────────────────────
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
 * getConfigForExtension(ext)
 * ─────────────────────────────────────────────────────────────────
 * Returns the FILE_TYPE_CONFIG entry that matches the given extension.
 * The leading dot is optional — both 'pdf' and '.pdf' are accepted.
 * Falls back to FILE_TYPE_CONFIG.default if no match is found.
 *
 * @param   {string} ext  e.g. 'xlsx', '.xlsx', 'PDF'
 * @returns {{ label: string, color: string, group: string, extensions: string[] }}
 */
export function getConfigForExtension(ext = '') {
    const normalized = ext.toLowerCase().replace(/^\./, '');
    const match = Object.values(FILE_TYPE_CONFIG).find(
        (cfg) => cfg.extensions.includes(normalized)
    );
    return match ?? FILE_TYPE_CONFIG.default;
}
