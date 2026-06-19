import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Video } from "@remotion/media";
import { staticFile } from "remotion";
import { BRAND } from "../brand";
import { fontFamily } from "../fonts";

interface TestimonialSceneProps {
  src: string;
  tag?: string;
  headline: string[];
  showStars?: boolean;
}

export const TestimonialScene: React.FC<TestimonialSceneProps> = ({ src, tag, headline, showStars }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const scale = interpolate(frame, [0, durationInFrames], [1.06, 1.0], {
    extrapolateRight: "clamp",
  });

  const tagOp = interpolate(frame, [4, 4 + fps * 0.3], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const headlineScale = spring({ frame: frame - fps * 0.15, fps, config: { damping: 13, stiffness: 95 } });
  const headlineOp = interpolate(frame, [fps * 0.15, fps * 0.15 + fps * 0.4], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const starsOp = interpolate(frame, [fps * 0.85, fps * 1.15], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
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

      {/* Dark gradient for legibility */}
      <AbsoluteFill style={{
        background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 100%)",
      }} />

      {/* Top tag pill */}
      {tag && (
        <div style={{ position: "absolute", top: 90, left: 0, right: 0, textAlign: "center", opacity: tagOp }}>
          <span style={{
            fontFamily, fontSize: 32, fontWeight: 700,
            color: BRAND.darkText, background: BRAND.accent,
            borderRadius: 30, paddingTop: 12, paddingBottom: 12,
            paddingLeft: 32, paddingRight: 32,
            letterSpacing: "0.04em", textTransform: "uppercase",
          }}>
            {tag}
          </span>
        </div>
      )}

      {/* Bottom stack: headline + optional stars */}
      <AbsoluteFill style={{
        display: "flex", flexDirection: "column",
        justifyContent: "flex-end", alignItems: "center",
        padding: "0 64px 130px", gap: 18,
      }}>
        <div style={{ opacity: headlineOp, transform: `scale(${headlineScale})`, textAlign: "center" }}>
          {headline.map((line, i) => (
            <div key={i} style={{
              fontFamily, fontSize: 66, fontWeight: 800,
              color: "#fff", lineHeight: 1.18,
              textShadow: "0 4px 20px rgba(0,0,0,0.6)",
            }}>
              {line}
            </div>
          ))}
        </div>

        {showStars && (
          <div style={{ opacity: starsOp, fontSize: 36, letterSpacing: 8 }}>
            ⭐⭐⭐⭐⭐
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
