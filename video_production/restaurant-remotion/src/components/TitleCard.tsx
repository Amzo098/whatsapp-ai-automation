import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { BRAND } from "../brand";
import { GradientBg } from "./GradientBg";
import { fontFamily } from "../fonts";

export const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo line scale-in
  const logoScale = spring({ frame, fps, config: { damping: 14, stiffness: 80 }, delay: 0 });

  // Title word by word reveal
  const titleY = interpolate(frame, [4, 4 + fps * 0.6], [60, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const titleOpacity = interpolate(frame, [4, 4 + fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Location slide up
  const locY = interpolate(frame, [fps * 0.5, fps * 0.5 + fps * 0.5], [40, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const locOpacity = interpolate(frame, [fps * 0.5, fps * 0.5 + fps * 0.4], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Gold line width expand
  const lineW = interpolate(frame, [fps * 0.7, fps * 1.1], [0, 420], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Slogan fade
  const sloganOpacity = interpolate(frame, [fps * 1.0, fps * 1.5], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const sloganY = interpolate(frame, [fps * 1.0, fps * 1.5], [30, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <GradientBg />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 60px", gap: 0 }}>

        {/* Animated logo mark */}
        <div style={{ transform: `scale(${logoScale})`, marginBottom: 30 }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            border: `3px solid ${BRAND.accent}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ fontSize: 36 }}>🍽️</div>
          </div>
        </div>

        {/* Main title */}
        <div style={{
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          fontFamily,
          fontSize: 90,
          fontWeight: 800,
          color: BRAND.accent,
          textAlign: "center",
          lineHeight: 1.1,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
        }}>
          Restaurant<br />Occidental
        </div>

        {/* Gold line */}
        <div style={{
          width: lineW,
          height: 5,
          background: BRAND.accent,
          borderRadius: 3,
          margin: "22px auto",
        }} />

        {/* Location */}
        <div style={{
          transform: `translateY(${locY}px)`,
          opacity: locOpacity,
          fontFamily,
          fontSize: 52,
          fontWeight: 600,
          color: BRAND.light,
          textAlign: "center",
        }}>
          {BRAND.location}
        </div>

        {/* Slogan */}
        <div style={{
          transform: `translateY(${sloganY}px)`,
          opacity: sloganOpacity,
          fontFamily,
          fontSize: 40,
          fontWeight: 400,
          color: `${BRAND.light}CC`,
          textAlign: "center",
          marginTop: 28,
          lineHeight: 1.4,
          maxWidth: 800,
        }}>
          {BRAND.slogan}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
