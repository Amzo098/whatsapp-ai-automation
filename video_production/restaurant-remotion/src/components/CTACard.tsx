import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { BRAND } from "../brand";
import { GradientBg } from "./GradientBg";
import { fontFamily } from "../fonts";

export const CTACard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [0, fps * 0.5], [40, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const lineW = interpolate(frame, [fps * 0.45, fps * 0.85], [0, 400], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const phoneOp = interpolate(frame, [fps * 0.7, fps * 1.1], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Pulsing button
  const btnScale = spring({ frame: frame - fps * 1.0, fps, config: { damping: 10, stiffness: 100 } });
  const pulse = 1 + 0.025 * Math.sin(((frame - fps * 1.2) / fps) * Math.PI * 2.5);
  const btnFinalScale = frame < fps * 1.0 ? 0 : btnScale * (frame > fps * 1.5 ? pulse : 1);

  return (
    <AbsoluteFill>
      <GradientBg scaleFrom={1.0} />
      <AbsoluteFill style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "0 70px", gap: 0,
      }}>

        {/* Title */}
        <div style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          fontFamily,
          fontSize: 80,
          fontWeight: 800,
          color: BRAND.accent,
          textAlign: "center",
          textTransform: "uppercase",
          lineHeight: 1.15,
        }}>
          Réservez<br />Votre Table
        </div>

        <div style={{ width: lineW, height: 5, background: BRAND.accent, borderRadius: 3, margin: "22px 0 24px" }} />

        <div style={{
          opacity: interpolate(frame, [fps * 0.6, fps * 0.9], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          }),
          fontFamily, fontSize: 48, fontWeight: 600,
          color: BRAND.light, textAlign: "center", marginBottom: 16,
        }}>
          Une minute suffit
        </div>

        {/* Phone number */}
        <div style={{
          opacity: phoneOp,
          fontFamily, fontSize: 56, fontWeight: 700,
          color: BRAND.light, textAlign: "center",
          marginBottom: 50,
        }}>
          📱 {BRAND.phone}
        </div>

        {/* CTA Button */}
        <div style={{
          transform: `scale(${btnFinalScale})`,
          background: BRAND.accent,
          borderRadius: 70,
          paddingTop: 34,
          paddingBottom: 34,
          paddingLeft: 70,
          paddingRight: 70,
          boxShadow: `0 12px 40px ${BRAND.accent}55`,
        }}>
          <span style={{
            fontFamily, fontSize: 50, fontWeight: 700,
            color: BRAND.darkText,
          }}>
            📲 Appeler / WhatsApp
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
