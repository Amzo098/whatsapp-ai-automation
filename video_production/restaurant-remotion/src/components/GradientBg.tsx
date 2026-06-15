import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { BRAND } from "../brand";

export const GradientBg: React.FC<{ scaleFrom?: number }> = ({ scaleFrom = 1.04 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Subtle Ken-Burns zoom on the gradient itself
  const scale = interpolate(frame, [0, durationInFrames], [scaleFrom, 1.0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${BRAND.primary} 0%, ${BRAND.dark} 100%)`,
        transform: `scale(${scale})`,
      }}
    >
      {/* Radial golden halo */}
      <div
        style={{
          position: "absolute",
          top: "18%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(ellipse at center, ${BRAND.accent}22 0%, transparent 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};
