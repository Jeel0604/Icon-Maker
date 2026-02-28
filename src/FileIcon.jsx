// FileIcon.jsx
// Props:
//   color             {string}   Banner color                         default '#6b7280'
//   label             {string}   Short text in the banner             default '?'
//   docId             {string}   Unique id for SVG defs               default 'doc'
//   size              {number}   Rendered pixel width                 default 20
//   bannerHeight      {number}   Banner height (viewBox units)        default 5  · 3–8
//   foldSize          {number}   Fold corner size                     default 4  · 1–7
//   bannerOffset      {number}   Lift banner from bottom toward ctr   default 0
//   alignment         {string}   'left' | 'center' | 'right'          default 'center'
//   folded            {boolean}  Show top-right fold crease           default true
//   bodyColor         {string}   Document body fill                   default '#2d2d2d'
//   foldColor         {string}   Fold triangle fill                   default '#1a1a1a'
//   bannerOverhang    {string}   'none' | 'left' | 'right'            default 'none'
//   bannerOverhangSize{number}   How far banner sticks out            default 3  · 1–8

export function FileIcon({
    color = '#6b7280',
    label = '?',
    docId = 'doc',
    size = 20,
    bannerHeight = 5,
    foldSize = 4,
    bannerOffset = 0,
    alignment = 'center',
    folded = true,
    bodyColor = '#2d2d2d',
    foldColor = '#1a1a1a',
    bannerOverhang = 'none',
    bannerOverhangSize = 3,
}) {
    const W = 16;
    const H = 20;
    const fold = Math.max(1, Math.min(foldSize, 7));
    const bannerH = Math.max(3, Math.min(bannerHeight, 8));
    const r = 1.2;
    const maxOff = (H - bannerH) / 2;
    const offset = Math.max(0, Math.min(bannerOffset, maxOff));
    const overhang = Math.max(1, Math.min(bannerOverhangSize, 8));

    const renderW = size;
    const renderH = Math.round(size * (H / W));
    const clipId = `clip-${docId}`;

    // ── Banner geometry ────────────────────────────────────────
    // When overhang is active the banner extends beyond the document edge
    // on the chosen side. overflow="visible" lets it render outside viewBox.
    const bannerY = H - bannerH - offset;
    const hasOverhang = bannerOverhang !== 'none';

    let bannerX = 0;
    let bannerW = W;
    if (bannerOverhang === 'left') { bannerX = -overhang; bannerW = W + overhang; }
    if (bannerOverhang === 'right') { bannerX = 0; bannerW = W + overhang; }

    // Label text is always centred on the document body, not the full banner
    const textX = alignment === 'left' ? 2.5 : alignment === 'right' ? W - 2.5 : W / 2;
    const textAnchor = alignment === 'left' ? 'start' : alignment === 'right' ? 'end' : 'middle';
    const textY = bannerY + bannerH / 2;
    const fontSize = label.length > 3 ? '3.2' : label.length > 2 ? '3.6' : '4.4';

    // ── Paths ──────────────────────────────────────────────────
    const bodyPath = folded
        ? `M2,0 L${W - fold},0 L${W},${fold} L${W},${H - r} Q${W},${H} ${W - r},${H} L${r},${H} Q0,${H} 0,${H - r} L0,2 Q0,0 2,0 Z`
        : `M2,0 L${W - r},0 Q${W},0 ${W},${r} L${W},${H - r} Q${W},${H} ${W - r},${H} L${r},${H} Q0,${H} 0,${H - r} L0,2 Q0,0 2,0 Z`;

    const foldPath = `M${W - fold},0 L${W - fold},${fold} L${W},${fold} Z`;

    return (
        <svg
            width={renderW}
            height={renderH}
            viewBox={`0 0 ${W} ${H}`}
            xmlns="http://www.w3.org/2000/svg"
            aria-label={`${label} file icon`}
            overflow="visible"
            style={{
                display: 'block',
                flexShrink: 0,
                filter: 'drop-shadow(0 0.8px 1.4px rgba(0,0,0,0.38))',
            }}
        >
            <defs>
                {/* Used only when no overhang — clips banner to document outline */}
                <clipPath id={clipId}>
                    <path d={bodyPath} />
                </clipPath>
            </defs>

            {/* Document body — always below banner */}
            <path d={bodyPath} fill={bodyColor} />

            {/* Fold crease */}
            {folded && <path d={foldPath} fill={foldColor} />}

            {/*
              Banner:
              - When no overhang: clipped to document outline (rounded bottom corners)
              - When overhang active: unclipped so it extends beyond the document edge
                The document body drawn above naturally "sits on top" of the banner in
                the overlap zone, creating the layered ribbon / "coming from back" look.
            */}
            <rect
                x={bannerX} y={bannerY}
                width={bannerW} height={bannerH}
                fill={color}
                rx={hasOverhang ? 0.6 : 0}
                ry={hasOverhang ? 0.6 : 0}
                clipPath={hasOverhang ? undefined : `url(#${clipId})`}
            />

            {/* Label — rendered last, always on top */}
            <text
                x={textX}
                y={textY}
                textAnchor={textAnchor}
                dominantBaseline="central"
                fill="#fff"
                fontSize={fontSize}
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
