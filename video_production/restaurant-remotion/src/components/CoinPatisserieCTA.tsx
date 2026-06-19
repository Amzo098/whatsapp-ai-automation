import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { BRAND } from "../brand";
import { GradientBg } from "./GradientBg";
import { fontFamily } from "../fonts";

export const CoinPatisserieCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tagOp = interpolate(frame, [0, fps * 0.35], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const titleOp = interpolate(frame, [fps * 0.2, fps * 0.65], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [fps * 0.2, fps * 0.65], [40, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const lineW = interpolate(frame, [fps * 0.6, fps * 0.95], [0, 380], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const subOp = interpolate(frame, [fps * 0.75, fps * 1.1], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const btnScale = spring({ frame: frame - fps * 1.1, fps, config: { damping: 10, stiffness: 100 } });
  const pulse = 1 + 0.025 * Math.sin(((frame - fps * 1.6) / fps) * Math.PI * 2.5);
  const btnFinalScale = frame < fps * 1.1 ? 0 : btnScale * (frame > fps * 1.6 ? pulse : 1);

  const phoneOp = interpolate(frame, [fps * 1.3, fps * 1.6], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const tagListOp = interpolate(frame, [fps * 1.8, fps * 2.15], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <GradientBg scaleFrom={1.0} />
      <AbsoluteFill style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "0 64px",
      }}>
        <div style={{
          opacity: tagOp,
          fontFamily, fontSize: 34, fontWeight: 700,
          color: BRAND.accent, textAlign: "center",
          textTransform: "uppercase", letterSpacing: "0.06em",
          marginBottom: 18,
        }}>
          Le Saviez-Vous ?
        </div>

        <div style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          fontFamily, fontSize: 70, fontWeight: 800,
          color: BRAND.light, textAlign: "center",
          lineHeight: 1.15,
        }}>
          Le Coin<br /><span style={{ color: BRAND.accent }}>Pâtisserie</span>
        </div>

        <div style={{ width: lineW, height: 5, background: BRAND.accent, borderRadius: 3, margin: "22px 0 22px" }} />

        <div style={{
          opacity: subOp,
          fontFamily, fontSize: 40, fontWeight: 600,
          color: BRAND.light, textAlign: "center",
          marginBottom: 40,
        }}>
          Un service que peu de gens connaissent
        </div>

        <div style={{
          transform: `scale(${btnFinalScale})`,
          background: BRAND.accent,
          borderRadius: 70,
          paddingTop: 32, paddingBottom: 32,
          paddingLeft: 58, paddingRight: 58,
          boxShadow: `0 12px 40px ${BRAND.accent}55`,
        }}>
          <span style={{ fontFamily, fontSize: 46, fontWeight: 700, color: BRAND.darkText }}>
            📲 Découvrir / WhatsApp
          </span>
        </div>

        <div style={{
          opacity: phoneOp,
          fontFamily, fontSize: 52, fontWeight: 700,
          color: BRAND.light, textAlign: "center",
          marginTop: 26,
        }}>
          {BRAND.phone}
        </div>

        <div style={{
          opacity: tagListOp,
          fontFamily, fontSize: 32, fontWeight: 500,
          color: `${BRAND.light}AA`, textAlign: "center",
          marginTop: 30, letterSpacing: "0.02em",
        }}>
          Anniversaires · Mariages · Saint-Valentin
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
