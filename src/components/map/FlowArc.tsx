"use client";

import { hashId, particleRadius } from "@/lib/arc";

interface FlowArcProps {
  id: string;
  d: string;
  color: string;
  strokeWidth: number;
  magnitude: number;
  /** whether this arc gets an animated particle - capped per asset class for performance */
  isAnimated: boolean;
  isFocused: boolean;
  onHoverChange: (id: string | null) => void;
}

export function FlowArc({
  id,
  d,
  color,
  strokeWidth,
  magnitude,
  isAnimated,
  isFocused,
  onHoverChange,
}: FlowArcProps) {
  const pathId = `flow-path-${id}`;
  const seed = hashId(id);
  const duration = 9 + (seed % 600) / 100; // 9s - 15s
  const beginOffset = -((seed % 500) / 100);
  const r = particleRadius(magnitude, isFocused);

  return (
    <g>
      <path
        id={pathId}
        d={d}
        fill="none"
        stroke="transparent"
        strokeWidth={10}
        className="cursor-pointer"
        onMouseEnter={() => onHoverChange(id)}
        onMouseLeave={() => onHoverChange(null)}
      />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={isFocused ? strokeWidth + 1.2 : strokeWidth}
        strokeOpacity={isFocused ? 0.95 : 0.32}
        strokeLinecap="round"
        className="transition-[stroke-opacity] duration-200"
        pointerEvents="none"
      />
      {isAnimated && (
        <>
          {/* soft halo behind the particle - cheaper than an SVG blur filter */}
          <circle r={r + 2.2} fill={color} opacity={isFocused ? 0.35 : 0.18}>
            <animateMotion
              dur={`${duration}s`}
              begin={`${beginOffset}s`}
              repeatCount="indefinite"
            >
              <mpath href={`#${pathId}`} />
            </animateMotion>
          </circle>
          <circle r={r} fill={color} opacity={isFocused ? 1 : 0.9}>
            <animateMotion
              dur={`${duration}s`}
              begin={`${beginOffset}s`}
              repeatCount="indefinite"
            >
              <mpath href={`#${pathId}`} />
            </animateMotion>
          </circle>
        </>
      )}
    </g>
  );
}
