import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { BRAND } from "../brand";
import { fontFamily } from "../fonts";

export const BrandBug: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const op = interpolate(frame, [fps * 0.5, fps * 0.9], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{
      position: "absolute", top: 50, left: 46, opacity: op,
      display: "flex", alignItems: "center", gap: 10,
      background: "rgba(8,40,74,0.55)",
      border: `1.5px solid ${BRAND.accent}AA`,
      borderRadius: 30,
      paddingTop: 10, paddingBottom: 10, paddingLeft: 18, paddingRight: 22,
    }}>
      <div style={{ fontSize: 22 }}>🍽️</div>
      <span style={{ fontFamily, fontSize: 26, fontWeight: 700, color: "#fff", letterSpacing: "0.02em" }}>
        {BRAND.name}
      </span>
    </div>
  );
};
