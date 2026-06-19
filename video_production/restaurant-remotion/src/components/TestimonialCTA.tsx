import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { BRAND } from "../brand";
import { GradientBg } from "./GradientBg";
import { fontFamily } from "../fonts";

export const TestimonialCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = interpolate(frame, [0, fps * 0.45], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [0, fps * 0.45], [40, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const lineW = interpolate(frame, [fps * 0.4, fps * 0.75], [0, 380], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const subOp = interpolate(frame, [fps * 0.55, fps * 0.9], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const btnScale = spring({ frame: frame - fps * 0.9, fps, config: { damping: 10, stiffness: 100 } });
  const pulse = 1 + 0.025 * Math.sin(((frame - fps * 1.3) / fps) * Math.PI * 2.5);
  const btnFinalScale = frame < fps * 0.9 ? 0 : btnScale * (frame > fps * 1.4 ? pulse : 1);

  const phoneOp = interpolate(frame, [fps * 1.1, fps * 1.4], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const urgencyOp = interpolate(frame, [fps * 1.7, fps * 2.05], [0, 1], {
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
          Rejoignez-les<br />Ce Soir
        </div>

        <div style={{ width: lineW, height: 5, background: BRAND.accent, borderRadius: 3, margin: "22px 0 22px" }} />

        <div style={{
          opacity: subOp,
          fontFamily, fontSize: 46, fontWeight: 600,
          color: BRAND.light, textAlign: "center",
          marginBottom: 40,
        }}>
          Une table vous attend
        </div>

        <div style={{
          transform: `scale(${btnFinalScale})`,
          background: BRAND.accent,
          borderRadius: 70,
          paddingTop: 32, paddingBottom: 32,
          paddingLeft: 64, paddingRight: 64,
          boxShadow: `0 12px 40px ${BRAND.accent}55`,
        }}>
          <span style={{ fontFamily, fontSize: 48, fontWeight: 700, color: BRAND.darkText }}>
            📲 Appeler / WhatsApp
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
          opacity: urgencyOp,
          fontFamily, fontSize: 32, fontWeight: 500, fontStyle: "italic",
          color: `${BRAND.light}AA`, textAlign: "center",
          marginTop: 30,
        }}>
          Les bonnes tables partent vite le week-end
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
