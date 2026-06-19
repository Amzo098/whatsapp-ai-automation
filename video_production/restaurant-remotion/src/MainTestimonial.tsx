import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, continueRender, delayRender } from "remotion";
import { loadPoppins } from "./fonts";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { TestimonialScene } from "./components/TestimonialScene";
import { VideoScene } from "./components/VideoScene";
import { TestimonialCTA } from "./components/TestimonialCTA";
import { BrandBug } from "./components/BrandBug";

const T = 12;

// AIDA structure — Attention (anniversaire) → Intérêt (famille) → Désir (plats) → Action (CTA)
// Net total: 165 + 165 + 100 + 100 + 180 - 4×12 = 662 frames = 22.07s
export const MainTestimonial: React.FC = () => {
  const [handle] = useState(() => delayRender("Loading fonts"));
  useEffect(() => {
    loadPoppins().then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill>
      <Audio
        src={staticFile("music.wav")}
        volume={(f) => {
          const totalFrames = 662;
          if (f < 30) return (f / 30) * 0.65;
          if (f > totalFrames - 60) return Math.max(0, ((totalFrames - f) / 60) * 0.65);
          return 0.65;
        }}
      />

      <TransitionSeries>
        {/* 1 — Attention : célébration réelle */}
        <TransitionSeries.Sequence durationInFrames={165}>
          <TestimonialScene
            src="testimonial_birthday.mp4"
            tag="100% clients réels"
            headline={["Ici, chaque repas", "devient un souvenir."]}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        {/* 2 — Intérêt : preuve sociale en famille */}
        <TransitionSeries.Sequence durationInFrames={165}>
          <TestimonialScene
            src="testimonial_family.mp4"
            headline={["Des familles entières", "nous font confiance"]}
            showStars
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        {/* 3 — Désir : plat 1 */}
        <TransitionSeries.Sequence durationInFrames={100}>
          <VideoScene src="poisson.mp4" caption="Fait maison, servi avec amour" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        {/* 4 — Désir : plat 2 */}
        <TransitionSeries.Sequence durationInFrames={100}>
          <VideoScene src="plat3_frites.mp4" caption="Fraîcheur garantie, à chaque assiette" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        {/* 5 — Action : CTA */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <TestimonialCTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Persistent brand mark during Attention/Intérêt/Désir, before the CTA takes over branding */}
      <Sequence durationInFrames={482}>
        <BrandBug />
      </Sequence>
    </AbsoluteFill>
  );
};
