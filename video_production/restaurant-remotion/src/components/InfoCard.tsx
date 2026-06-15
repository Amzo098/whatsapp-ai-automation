import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { BRAND } from "../brand";
import { GradientBg } from "./GradientBg";
import { fontFamily } from "../fonts";

interface InfoCardProps {
  title: string;
  subtitle?: string;
  lines: string[];
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, subtitle, lines }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleY = interpolate(frame, [0, fps * 0.45], [50, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const titleOp = interpolate(frame, [0, fps * 0.4], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const lineW = interpolate(frame, [fps * 0.4, fps * 0.75], [0, 380], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill>
      <GradientBg scaleFrom={1.02} />
      <AbsoluteFill style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "0 70px", gap: 0,
      }}>
        {/* Title */}
        <div style={{
          transform: `translateY(${titleY}px)`,
          opacity: titleOp,
          fontFamily,
          fontSize: 82,
          fontWeight: 700,
          color: BRAND.accent,
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          lineHeight: 1.15,
        }}>
          {title}
        </div>

        {/* Gold underline */}
        <div style={{
          width: lineW,
          height: 5,
          background: BRAND.accent,
          borderRadius: 3,
          margin: "18px 0 20px",
        }} />

        {/* Subtitle */}
        {subtitle && (
          <div style={{
            opacity: interpolate(frame, [fps * 0.55, fps * 0.85], [0, 1], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp",
            }),
            fontFamily,
            fontSize: 50,
            fontWeight: 600,
            color: BRAND.light,
            textAlign: "center",
            marginBottom: 28,
          }}>
            {subtitle}
          </div>
        )}

        {/* Body lines — staggered */}
        {lines.map((line, i) => {
          const delay = fps * (0.65 + i * 0.18);
          const op = interpolate(frame, [delay, delay + fps * 0.3], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          const y = interpolate(frame, [delay, delay + fps * 0.35], [28, 0], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          });
          return (
            <div key={i} style={{
              opacity: op,
              transform: `translateY(${y}px)`,
              fontFamily,
              fontSize: 46,
              fontWeight: 400,
              color: `${BRAND.light}DD`,
              textAlign: "center",
              lineHeight: 1.55,
            }}>
              {line}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
