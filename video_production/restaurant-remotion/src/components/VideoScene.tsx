import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { Video } from "@remotion/media";
import { staticFile } from "remotion";
import { BRAND } from "../brand";
import { fontFamily } from "../fonts";

interface VideoSceneProps {
  src: string;      // filename in public/
  caption?: string;
}

export const VideoScene: React.FC<VideoSceneProps> = ({ src, caption }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Subtle Ken-Burns zoom
  const scale = interpolate(frame, [0, durationInFrames], [1.08, 1.0], {
    extrapolateRight: "clamp",
  });

  // Caption fade-in
  const capOp = interpolate(frame, [fps * 0.4, fps * 0.8], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const capY = interpolate(frame, [fps * 0.4, fps * 0.8], [20, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Video
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
        }}
        muted
        volume={0}
      />

      {/* Bottom gradient overlay */}
      <AbsoluteFill style={{
        background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 45%)",
      }} />

      {/* Caption */}
      {caption && (
        <div style={{
          position: "absolute",
          bottom: 80,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: capOp,
          transform: `translateY(${capY}px)`,
        }}>
          <span style={{
            fontFamily,
            fontSize: 52,
            fontWeight: 600,
            color: "#fff",
            background: `${BRAND.accent}CC`,
            borderRadius: 16,
            paddingTop: 14,
            paddingBottom: 14,
            paddingLeft: 38,
            paddingRight: 38,
          }}>
            {caption}
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};
