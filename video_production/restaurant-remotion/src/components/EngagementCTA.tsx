import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { BRAND } from "../brand";
import { GradientBg } from "./GradientBg";
import { fontFamily } from "../fonts";

export const EngagementCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mainOp = interpolate(frame, [0, fps * 0.4], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const mainY = interpolate(frame, [0, fps * 0.4], [44, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const lineW = interpolate(frame, [fps * 0.35, fps * 0.72], [0, 380], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Bouncing arrow
  const arrowBounce = 1 + 0.18 * Math.sin((frame / fps) * Math.PI * 2.8);

  const subOp = interpolate(frame, [fps * 0.5, fps * 0.85], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const btnScale = spring({ frame: frame - fps * 0.75, fps, config: { damping: 10, stiffness: 100 } });
  const btnFinalScale = frame < fps * 0.75 ? 0 : btnScale;

  return (
    <AbsoluteFill>
      <GradientBg scaleFrom={1.0} />
      <AbsoluteFill style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "0 70px", gap: 0,
      }}>

        {/* Main engagement question */}
        <div style={{
          opacity: mainOp,
          transform: `translateY(${mainY}px)`,
          fontFamily, fontSize: 82, fontWeight: 800,
          color: BRAND.accent, textAlign: "center",
          textTransform: "uppercase", lineHeight: 1.15,
        }}>
          Tu choisis<br />lequel ?
        </div>

        {/* Gold line */}
        <div style={{
          width: lineW, height: 5,
          background: BRAND.accent, borderRadius: 3,
          margin: "20px 0 22px",
        }} />

        {/* Bouncing arrow */}
        <div style={{
          opacity: mainOp,
          transform: `scale(${arrowBounce})`,
          fontSize: 88, textAlign: "center", lineHeight: 1,
        }}>
          👇
        </div>

        {/* CTA text */}
        <div style={{
          opacity: subOp,
          fontFamily, fontSize: 52, fontWeight: 700,
          color: BRAND.light, textAlign: "center",
          marginTop: 18, marginBottom: 36,
        }}>
          Dis-nous en commentaire !
        </div>

        {/* WhatsApp / Call button */}
        <div style={{
          transform: `scale(${btnFinalScale})`,
          background: BRAND.accent,
          borderRadius: 70,
          paddingTop: 30, paddingBottom: 30,
          paddingLeft: 58, paddingRight: 58,
          boxShadow: `0 12px 40px ${BRAND.accent}55`,
        }}>
          <span style={{
            fontFamily, fontSize: 46, fontWeight: 700,
            color: BRAND.darkText,
          }}>
            📲 {BRAND.phone}
          </span>
        </div>

        {/* Restaurant name */}
        <div style={{
          opacity: subOp,
          fontFamily, fontSize: 34, fontWeight: 500,
          color: `${BRAND.light}99`, textAlign: "center",
          marginTop: 26, letterSpacing: "0.04em",
        }}>
          {BRAND.name}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
