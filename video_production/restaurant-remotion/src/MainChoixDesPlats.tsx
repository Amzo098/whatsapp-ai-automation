import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, staticFile, continueRender, delayRender } from "remotion";
import { loadPoppins } from "./fonts";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { HookScene } from "./components/HookScene";
import { PlatScene } from "./components/PlatScene";
import { EngagementCTA } from "./components/EngagementCTA";

const T = 12;

// Total net: 75 + 105×4 + 120 - 5×12 = 555 frames = 18.5s
export const MainChoixDesPlats: React.FC = () => {
  const [handle] = useState(() => delayRender("Loading fonts"));
  useEffect(() => {
    loadPoppins().then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill>
      <Audio
        src={staticFile("music.wav")}
        volume={(f) => {
          const totalFrames = 555;
          if (f < 30) return (f / 30) * 0.6;
          if (f > totalFrames - 45) return Math.max(0, ((totalFrames - f) / 45) * 0.6);
          return 0.6;
        }}
      />

      <TransitionSeries>
        {/* 1 — Hook */}
        <TransitionSeries.Sequence durationInFrames={75}>
          <HookScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        {/* 2 — Plat 1 : Poisson Grillé + Alloco */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <PlatScene src="plat1_alloco.mp4" number={1} label="Poisson Grillé + Alloco" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        {/* 3 — Plat 2 : Spaghetti Maison */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <PlatScene src="plat2_spaghetti.mp4" number={2} label="Spaghetti Maison" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        {/* 4 — Plat 3 : Poisson + Frites */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <PlatScene src="plat3_frites.mp4" number={3} label="Poisson + Frites" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        {/* 5 — Plat 4 : Poisson Braisé */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <PlatScene src="poisson.mp4" number={4} label="Poisson Braisé" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        {/* 6 — CTA engagement */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <EngagementCTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
