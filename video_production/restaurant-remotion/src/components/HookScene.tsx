import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Video } from "@remotion/media";
import { staticFile } from "remotion";
import { BRAND } from "../brand";
import { fontFamily } from "../fonts";

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const textScale = spring({ frame: frame - 6, fps, config: { damping: 12, stiffness: 90 } });
  const textOp = interpolate(frame, [6, 20], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Video
        src={staticFile("plat1_alloco.mp4")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        muted
        volume={0}
      />

      {/* Semi-dark overlay for text legibility */}
      <AbsoluteFill style={{ background: "rgba(0,0,0,0.42)" }} />

      {/* Hook text */}
      <AbsoluteFill style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "0 60px",
      }}>
        <div style={{
          opacity: textOp,
          transform: `scale(${textScale})`,
          textAlign: "center",
        }}>
          <div style={{
            fontFamily,
            fontSize: 92,
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.1,
            textShadow: "0 4px 24px rgba(0,0,0,0.6)",
            letterSpacing: "-0.01em",
          }}>
            Tu choisis<br />quoi ce soir ?
          </div>
          <div style={{ fontSize: 80, marginTop: 20 }}>😋</div>
          <div style={{
            fontFamily, fontSize: 44, fontWeight: 600,
            color: BRAND.accent, marginTop: 18,
            textShadow: "0 2px 12px rgba(0,0,0,0.5)",
          }}>
            Restaurant Occidental
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
