import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { BRAND } from "../brand";
import { GradientBg } from "./GradientBg";
import { fontFamily } from "../fonts";

export const PatisserieCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = interpolate(frame, [0, fps * 0.45], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [0, fps * 0.45], [40, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const lineW = interpolate(frame, [fps * 0.4, fps * 0.75], [0, 360], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const subOp = interpolate(frame, [fps * 0.55, fps * 0.9], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const btnScale = spring({ frame: frame - fps * 0.85, fps, config: { damping: 10, stiffness: 100 } });
  const pulse = 1 + 0.025 * Math.sin(((frame - fps * 1.25) / fps) * Math.PI * 2.5);
  const btnFinalScale = frame < fps * 0.85 ? 0 : btnScale * (frame > fps * 1.35 ? pulse : 1);

  const phoneOp = interpolate(frame, [fps * 1.05, fps * 1.35], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const tagOp = interpolate(frame, [fps * 1.55, fps * 1.9], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <GradientBg scaleFrom={1.0} />
      <AbsoluteFill style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "0 70px",
      }}>
        <div style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          fontFamily, fontSize: 78, fontWeight: 800,
          color: BRAND.accent, textAlign: "center",
          textTransform: "uppercase", lineHeight: 1.15,
        }}>
          Un Gâteau<br />Sur Mesure ?
        </div>

        <div style={{ width: lineW, height: 5, background: BRAND.accent, borderRadius: 3, margin: "22px 0 22px" }} />

        <div style={{
          opacity: subOp,
          fontFamily, fontSize: 44, fontWeight: 600,
          color: BRAND.light, textAlign: "center",
          marginBottom: 40,
        }}>
          Pour vos plus belles occasions
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
            📲 Commander / WhatsApp
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
          opacity: tagOp,
          fontFamily, fontSize: 32, fontWeight: 500,
          color: `${BRAND.light}AA`, textAlign: "center",
          marginTop: 30, letterSpacing: "0.02em",
        }}>
          Anniversaires · Mariages · Cérémonies
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
