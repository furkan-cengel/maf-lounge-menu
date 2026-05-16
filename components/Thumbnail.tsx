interface ThumbnailProps {
  colorHue: number;
  label: string;
  size?: number;
}

export function Thumbnail({ colorHue, label, size = 78 }: ThumbnailProps) {
  const slug = label.replace(/\s+/g, "").toLowerCase().slice(0, 12);
  const patternId = `p-${colorHue}-${slug}`;
  const clipId = `c-${colorHue}-${slug}`;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={patternId}
          x="0"
          y="0"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="5" height="10" fill={`oklch(55% 0.16 ${colorHue} / 0.22)`} />
          <rect x="5" width="5" height="10" fill={`oklch(30% 0.10 ${colorHue} / 0.12)`} />
        </pattern>
        <clipPath id={clipId}>
          <rect width={size} height={size} rx="10" ry="10" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width={size} height={size} fill={`oklch(18% 0.09 ${colorHue} / 0.95)`} />
        <rect width={size} height={size} fill={`url(#${patternId})`} />
        <text
          x={cx}
          y={cy - 3}
          dominantBaseline="middle"
          textAnchor="middle"
          fill={`oklch(75% 0.18 ${colorHue} / 0.3)`}
          fontSize="7.5"
          fontFamily="Inter, system-ui, sans-serif"
          fontWeight="700"
          letterSpacing="1.2"
          transform={`rotate(-32, ${cx}, ${cy})`}
        >
          ÇOK
        </text>
        <text
          x={cx}
          y={cy + 7}
          dominantBaseline="middle"
          textAnchor="middle"
          fill={`oklch(75% 0.18 ${colorHue} / 0.3)`}
          fontSize="7.5"
          fontFamily="Inter, system-ui, sans-serif"
          fontWeight="700"
          letterSpacing="1.2"
          transform={`rotate(-32, ${cx}, ${cy})`}
        >
          YAKINDA
        </text>
      </g>
    </svg>
  );
}
