import { mkdirSync, writeFileSync } from "node:fs";
import * as k from "./vendor/anatomy/iso-kit.mjs";
mkdirSync("public/art", { recursive: true });
const plan = { x: -125, y: -55, w: 250, d: 110, r: 12 };
const P = k.fitProjection(k.boxCorners(plan, -12, 60), 640, 390, {
  pad: 35,
  azimuth: 38,
  elevation: 34,
});
const palette = {
  stone: ["#eef0ec", "#c8ceca", "#adb7b1", "#87988e"],
  mint: ["#d5ffe1", "#a1e7bb", "#73c69b", "#429c77"],
  dark: ["#48554e", "#35463c", "#24382c", "#19291f"],
  metal: ["#fbfcf9", "#dce3da", "#c2cdc1", "#a9bba9"],
};
const solid = (p, t = "stone") => {
  const c = palette[t];
  return `<g><path d="${p.fill}" fill="${c[1]}"/>${p.shades.map((d, i) => `<path d="${d}" fill="${c[i]}"/>`).join("")}<path d="${p.top}" fill="${c[0]}"/><path d="${p.outline}" fill="none" stroke="#24412d" stroke-opacity=".3" stroke-width=".8"/><path d="${p.bevel || ""}" fill="none" stroke="#fff" stroke-opacity=".65" stroke-width="1"/></g>`;
};
const slab = (p, z, h, t) => solid(k.slabOf(p, z, h, P, 6, 0.7), t);
for (let day = 0; day <= 7; day++) {
  const out = [];
  const corners = k
    .corners(plan, 20)
    .sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P));
  for (const [x, y] of corners)
    out.push(slab({ x: x - 7, y: y - 7, w: 14, d: 14, r: 3 }, -12, 10, "dark"));
  out.push(
    slab(plan, -2, 9, "metal"),
    slab(k.insetPlan(plan, 3), 7, 2, "dark"),
    slab(k.insetPlan(plan, 2), 9, 31, "stone"),
    slab(plan, 40, 5, "metal"),
  );
  for (const [x, y] of corners)
    out.push(slab({ x: x - 2, y: y - 2, w: 4, d: 4, r: 0.8 }, 45, 0.8, "dark"));
  for (const y of [-43, 29])
    out.push(slab({ x: -108, y, w: 216, d: 4, r: 1 }, 45, 2, "stone"));
  const slots = Array.from({ length: 7 }, (_, i) => ({
    i,
    x: -105 + i * 30,
  })).sort((a, b) => k.depthOf([a.x, 0, 0], P) - k.depthOf([b.x, 0, 0], P));
  for (const { i, x } of slots) {
    out.push(slab({ x, y: -30, w: 23, d: 53, r: 4 }, 45, 2, "stone"));
    out.push(slab({ x: x + 2, y: -27, w: 19, d: 47, r: 3 }, 47, 0.5, "dark"));
    const raised = i < day;
    out.push(
      slab(
        { x: x + 4, y: -25, w: 15, d: 43, r: 2 },
        47.5,
        raised ? 10 : 1,
        raised ? "mint" : "stone",
      ),
    );
    out.push(
      slab(
        { x: x + 7, y: -19, w: 9, d: 4, r: 1 },
        raised ? 57.5 : 48.5,
        0.5,
        raised ? "metal" : "dark",
      ),
    );
  }
  out.push(
    slab({ x: 68, y: 36, w: 34, d: 5, r: 1 }, 45, 0.5, "dark"),
    slab(
      { x: 96, y: 37, w: 4, d: 3, r: 0.5 },
      45.5,
      0.5,
      day ? "mint" : "stone",
    ),
  );
  out.push(slab({ x: -92, y: 36, w: 62, d: 5, r: 1 }, 45, 0.5, "stone"));
  out.push(
    k.faceTextSvg(k.topMatrix([-61, 38], 45.5, P, "x"), "STREAK VAULT", {
      size: 2.4,
      anchor: "middle",
      tone: "lo",
    }),
  );
  writeFileSync(
    `public/art/vault-${day}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="390" viewBox="0 0 640 390" role="img" aria-label="Streak vault with ${day} of seven daily tokens filled"><ellipse cx="320" cy="320" rx="207" ry="30" fill="#24412d" opacity=".07"/>${out.join("")}</svg>`,
  );
}
console.log("Built 8 Anatomy vault states, 45 physical pieces each.");
