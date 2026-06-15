import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

let loaded = false;

export const loadPoppins = async () => {
  if (loaded) return;
  await Promise.all([
    loadFont({ family: "Poppins", url: staticFile("Poppins-Regular.ttf"),   weight: "400" }),
    loadFont({ family: "Poppins", url: staticFile("Poppins-SemiBold.ttf"),  weight: "600" }),
    loadFont({ family: "Poppins", url: staticFile("Poppins-Bold.ttf"),      weight: "700" }),
    loadFont({ family: "Poppins", url: staticFile("Poppins-Bold.ttf"),      weight: "800" }),
  ]);
  loaded = true;
};

export const fontFamily = "Poppins, sans-serif";
