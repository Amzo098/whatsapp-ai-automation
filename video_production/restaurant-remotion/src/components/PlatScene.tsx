import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { Video } from "@remotion/media";
import { staticFile } from "remotion";
import { BRAND } from "../brand";
import { fontFamily } from "../fonts";

interface PlatSceneProps {
  src: string;
  number: number;
  label: string;
}

export const PlatScene: React.FC<PlatSceneProps> = ({ src, number, label }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Subtle Ken-Burns zoom out
  const scale = interpolate(frame, [0, durationInFrames], [1.08, 1.0], {
    extrapolateRight: "clamp",
  });

  // Number badge: spring scale + slide from left
  const badgeDelay = 6;
  const badgeScale = spring({ frame: frame - badgeDelay, fps, config: { damping: 11, stiffness: 120 } });
  const badgeX = interpolate(frame, [badgeDelay, badgeDelay + fps * 0.35], [-180, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Label slides up from bottom
  const labelOp = interpolate(frame, [fps * 0.3, fps * 0.6], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const labelY = interpolate(frame, [fps * 0.3, fps * 0.6], [36, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Video
        src={staticFile(src)}
        style={{
          width: "100%", height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
        }}
        muted
        volume={0}
      />

      {/* Bottom gradient overlay */}
      <AbsoluteFill style={{
        background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, transparent 48%)",
      }} />

      {/* Number badge — top left */}
      <div style={{
        position: "absolute",
        top: 90,
        left: 60,
        transform: `translateX(${badgeX}px) scale(${badgeScale})`,
        transformOrigin: "left center",
      }}>
        <div style={{
          width: 130,
          height: 130,
          borderRadius: "50%",
          background: BRAND.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 8px 36px ${BRAND.accent}99`,
          border: "4px solid #fff",
        }}>
          <span style={{
            fontFamily, fontSize: 72, fontWeight: 800,
            color: BRAND.darkText, lineHeight: 1,
          }}>
            {number}
          </span>
        </div>
      </div>

      {/* Dish label — bottom center */}
      <div style={{
        position: "absolute",
        bottom: 110,
        left: 0, right: 0,
        textAlign: "center",
        opacity: labelOp,
        transform: `translateY(${labelY}px)`,
      }}>
        <span style={{
          fontFamily, fontSize: 58, fontWeight: 700,
          color: "#fff",
          background: `${BRAND.primary}EE`,
          borderRadius: 22,
          paddingTop: 18, paddingBottom: 18,
          paddingLeft: 44, paddingRight: 44,
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}>
          {label}
        </span>
      </div>
    </AbsoluteFill>
  );
};
