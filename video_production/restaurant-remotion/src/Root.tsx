import "./index.css";
import { Composition } from "remotion";
import { Main45s } from "./Main45s";

// Scenes: 135+135+120+135+120+135+120+105+105+165 = 1275
// Transitions: 9 × 12 = 108  →  Total: 1167 frames ≈ 38.9s
const TOTAL = 1167;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="RestaurantOccidental"
      component={Main45s}
      durationInFrames={TOTAL}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
