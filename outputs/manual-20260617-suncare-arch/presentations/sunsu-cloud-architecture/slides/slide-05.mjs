import { C, base, label, panel, lane, node, hFlow, bullet } from "./common.mjs";

export async function slide05(presentation, ctx) {
  const slide = presentation.slides.add();
  base(slide, ctx, {
    index: 5,
    kicker: "SECURITY BOUNDARY",
    title: "보안은 Public/Private 분리와 내부 토큰 검증을 함께 써야 합니다.",
    note: "현재 코드의 JWT 사용자 인증과 INTERNAL_TOKEN 서비스 인증을 클라우드 네트워크 경계에 맞게 배치합니다.",
  });

  lane(slide, ctx, 72, 174, 250, 348, "Public Zone", { color: C.blue, fill: "#F7FCFE", stroke: "#B7E3F3" });
  await node(slide, ctx, { x: 104, y: 236, w: 184, h: 82, title: "HTTPS Entry", sub: "Load Balancer\nTLS certificate", iconName: "ShieldCheck", accent: C.blue, fill: C.blueSoft, small: true });
  await node(slide, ctx, { x: 104, y: 376, w: 184, h: 82, title: "Static Frontend", sub: "Object Storage/CDN\nno server secret", iconName: "Cloud", accent: C.blue, fill: C.paper, small: true });

  lane(slide, ctx, 384, 174, 280, 348, "Private Service Zone", { color: C.mint, fill: "#F8FEFB", stroke: "#BEEBD8" });
  await node(slide, ctx, { x: 420, y: 236, w: 208, h: 82, title: "Express API", sub: "JWT auth\nrole/user ownership check", iconName: "LockKeyhole", accent: C.mint, fill: C.mintSoft, small: true });
  await node(slide, ctx, { x: 420, y: 376, w: 208, h: 82, title: "FastAPI AI", sub: "Bearer INTERNAL_TOKEN\nprivate endpoint only", iconName: "KeyRound", accent: C.amber, fill: C.amberSoft, small: true });

  lane(slide, ctx, 726, 174, 220, 348, "Data Zone", { color: C.ink, fill: "#FBFCFD", stroke: "#D7DEE7" });
  await node(slide, ctx, { x: 754, y: 236, w: 164, h: 82, title: "Cloud DB MySQL", sub: "private access\nbackup policy", iconName: "Database", accent: C.ink, fill: C.paper, small: true });
  await node(slide, ctx, { x: 754, y: 376, w: 164, h: 82, title: "Object Storage", sub: "upload lifecycle\naccess policy", iconName: "HardDrive", accent: C.blue, fill: C.blueSoft, small: true });

  lane(slide, ctx, 1008, 174, 194, 348, "External APIs", { color: C.amber, fill: "#FFFCF5", stroke: "#F8D99C" });
  await node(slide, ctx, { x: 1032, y: 252, w: 146, h: 74, title: "CLOVA OCR", sub: "secret key\nrate limit", iconName: "ScanText", accent: C.amber, fill: C.paper, small: true });
  await node(slide, ctx, { x: 1032, y: 388, w: 146, h: 74, title: "Gemini API", sub: "fallback\nfile cache", iconName: "Bot", accent: C.amber, fill: C.amberSoft, small: true });

  hFlow(slide, ctx, 288, 277, 420, { color: C.blue, text: "JWT user session" });
  hFlow(slide, ctx, 628, 417, 754, { color: C.amber, text: "internal token" });
  hFlow(slide, ctx, 628, 277, 754, { color: C.ink, text: "SQL private" });
  hFlow(slide, ctx, 918, 417, 1032, { color: C.amber, text: "NAT egress" });

  panel(slide, ctx, 92, 568, 1090, 62, { fill: C.paper, stroke: "#D7DEE7" });
  bullet(slide, ctx, 116, 588, "프론트엔드에는 DB/API 키를 두지 않고, 민감 정보는 서버 환경변수 또는 Secret Manager로 분리", { w: 470, color: C.red, size: 11.5 });
  bullet(slide, ctx, 636, 588, "FastAPI 직접 공개 금지: Express만 내부 토큰으로 호출하고, 외부 OCR/LLM은 NAT를 통해 통제", { w: 480, color: C.amber, size: 11.5 });

  return slide;
}
