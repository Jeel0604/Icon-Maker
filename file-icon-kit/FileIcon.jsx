/**
 * FileIcon.jsx
 * ─────────────────────────────────────────────────────────────────
 * A reusable SVG file-type icon component.
 *
 * Props
 * ─────
 * color    {string}  Hex / CSS color for the bottom banner   default '#6b7280'
 * label    {string}  Short uppercase text inside the banner  default '?'
 * docId    {string}  Unique ID used for SVG filter/clipPath  default 'doc'
 * size     {number}  Rendered pixel width (height is auto)   default 20
 *
 * The component renders at a 16:20 (4:5) portrait aspect ratio —
 * the ideal proportion for a document icon at small sizes.
 *
 * No external dependencies — drop this file into any React project.
 */
export function FileIcon({ color = '#6b7280', label = '?', docId = 'doc', size = 20 }) {
    const W = 16;        // viewBox width
    const H = 20;        // viewBox height  → 4:5 portrait ratio
    const fold = 4;      // folded top-right corner
    const bannerH = 5;   // coloured banner height
    const r = 1.2;       // bottom-corner radius

    // Preserve aspect ratio when rendering at arbitrary sizes
    const renderW = size;
    const renderH = Math.round(size * (H / W));

    // Unique IDs prevent SVG filter/clipPath collisions when
    // multiple icons share the same defs namespace on the page
    const clipId = `clip-${docId}`;
    const filterId = `shadow-${docId}`;

    // Document outline path:
    //  top-left  — rounded (2px)
    //  top-right — folded corner
    //  bottom    — rounded with radius r
    const bodyPath = [
        `M2,0`,
        `L${W - fold},0`,
        `L${W},${fold}`,
        `L${W},${H - r}`,
        `Q${W},${H} ${W - r},${H}`,
        `L${r},${H}`,
        `Q0,${H} 0,${H - r}`,
        `L0,2`,
        `Q0,0 2,0`,
        `Z`,
    ].join(' ');

    // Fold-crease triangle
    const foldPath = `M${W - fold},0 L${W - fold},${fold} L${W},${fold} Z`;

    return (
        <svg
            width={renderW}
            height={renderH}
            viewBox={`0 0 ${W} ${H}`}
            xmlns="http://www.w3.org/2000/svg"
            aria-label={`${label} file icon`}
            style={{ display: 'block', flexShrink: 0 }}
        >
            <defs>
                {/* Subtle drop shadow */}
                <filter id={filterId} x="-25%" y="-25%" width="150%" height="150%">
                    <feDropShadow
                        dx="0" dy="0.8"
                        stdDeviation="0.7"
                        floodColor="#000"
                        floodOpacity="0.4"
                    />
                </filter>

                {/* Clip the banner to the document outline */}
                <clipPath id={clipId}>
                    <path d={bodyPath} />
                </clipPath>
            </defs>

            <g filter={`url(#${filterId})`}>
                {/* Document body */}
                <path d={bodyPath} fill="#2d2d2d" />

                {/* Fold crease */}
                <path d={foldPath} fill="#1a1a1a" />

                {/* Coloured banner */}
                <rect
                    x={0}
                    y={H - bannerH}
                    width={W}
                    height={bannerH}
                    fill={color}
                    clipPath={`url(#${clipId})`}
                />
            </g>

            {/* Label — perfectly centred inside the banner */}
            <text
                x={W / 2}
                y={H - bannerH / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#fff"
                fontSize={label.length > 2 ? '3.6' : '4.4'}
                fontFamily="'Inter', 'Segoe UI', system-ui, sans-serif"
                fontWeight="700"
                letterSpacing="0"
            >
                {label.toUpperCase()}
            </text>
        </svg>
    );
}

export default FileIcon;
