# file-icon-kit

A lightweight, zero-dependency SVG file icon system for React.  
Drop two files into your project and you're done.

---

## What's included

| File | Purpose |
|---|---|
| `FileIcon.jsx` | The SVG icon component |
| `fileTypeConfig.js` | Extension → color/label map + lookup helper |

---

## Setup

1. Copy both files into your project (e.g. `src/components/file-icon/`)
2. No install required — pure React + inline SVG, no external packages

---

## Basic usage

```jsx
import { FileIcon } from './FileIcon';

// Hardcoded
<FileIcon color="#1d6f42" label="X" docId="my-excel" size={24} />
```

### With the config lookup helper

```jsx
import { FileIcon } from './FileIcon';
import { getConfigForExtension } from './fileTypeConfig';

function FileAttachment({ filename }) {
  const ext = filename.split('.').pop();              // e.g. 'xlsx'
  const { color, label } = getConfigForExtension(ext);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <FileIcon color={color} label={label} docId={filename} size={20} />
      <span>{filename}</span>
    </div>
  );
}
```

### In a file list

```jsx
import { FileIcon } from './FileIcon';
import { getConfigForExtension } from './fileTypeConfig';

const files = ['report.xlsx', 'slides.pptx', 'photo.jpg', 'notes.txt'];

export function FileList() {
  return (
    <ul>
      {files.map((file) => {
        const ext = file.split('.').pop();
        const { color, label } = getConfigForExtension(ext);
        return (
          <li key={file} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <FileIcon color={color} label={label} docId={file} size={20} />
            {file}
          </li>
        );
      })}
    </ul>
  );
}
```

---

## FileIcon props

| Prop | Type | Default | Description |
|---|---|---|---|
| `color` | `string` | `'#6b7280'` | Banner background color (hex or CSS) |
| `label` | `string` | `'?'` | Short uppercase text in the banner |
| `docId` | `string` | `'doc'` | **Must be unique per instance** — used for internal SVG `id` attributes |
| `size` | `number` | `20` | Rendered pixel width; height scales automatically at a 4:5 ratio |

> **Important:** Always pass a unique `docId` when rendering multiple icons on the same page.  
> Using `filename` or a slug derived from the file path works well.

---

## Supported extensions

| Group | Label | Color | Extensions |
|---|---|---|---|
| Spreadsheet | X | `#1d6f42` | xls, xlsx, xlsm, xlsb, ods |
| Document | W | `#2b579a` | doc, docx, odt, rtf |
| Presentation | P | `#c43e1c` | ppt, pptx, odp |
| PDF | PDF | `#e03030` | pdf |
| Image | IMG | `#7c3aed` | jpg, jpeg, png, gif, webp, bmp, tif, tiff, heic, heif |
| Code | <> | `#0891b2` | json, xml, html, md |
| CSV | CSV | `#059669` | csv |
| Email | @ | `#d97706` | eml, msg |
| Archive | ZIP | `#64748b` | vsdx, zip, iso |
| Text | TXT | `#6b7280` | txt |
| XPS | XPS | `#4f46e5` | xps |
| *(fallback)* | FILE | `#374151` | any unrecognised extension |

---

## Adding a new type

Open `fileTypeConfig.js` and add a new entry to `FILE_TYPE_CONFIG`:

```js
myType: {
  label: 'LOG',
  color: '#b45309',
  group: 'Log',
  extensions: ['log', 'out'],
},
```

`getConfigForExtension` will pick it up automatically.

---

## Visual design notes

- **ViewBox:** `16×20` (4:5 portrait ratio) — no vertical stretch
- **Fold:** 4px top-right corner crease
- **Banner height:** 5px coloured footer band
- **Drop shadow:** subtle `feDropShadow` filter per icon
- **Font:** Inter → Segoe UI → system-ui fallback chain
- Label font size auto-adjusts: `4.4px` for ≤2 chars, `3.6px` for 3+ chars

---

## Requirements

- React 17+ (uses JSX, no hooks)
- Any bundler that handles `.jsx` (Vite, CRA, Next.js, etc.)
