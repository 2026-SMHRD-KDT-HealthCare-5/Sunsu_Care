import { C, FONT, base, label, panel, node, hFlow, bullet } from "./common.mjs";

export async function slide01(presentation, ctx) {
  const slide = presentation.slides.add();
  base(slide, ctx, { index: 1, kicker: "SUNSU CARE ARCHITECTURE" });

  label(slide, ctx, 58, 78, 660, 128, "수업 웹 아키텍처를\nAI 선케어 분석 플랫폼으로 확장", {
    size: 40,
    bold: true,
    color: C.ink,
    face: FONT,
  });
  label(slide, ctx, 62, 222, 650, 52, "React + Node 기본 구조에 FastAPI AI 분석 서버, Object Storage, Cloud DB, 외부 OCR/LLM API, 운영 관측성을 추가한 클라우드 설계안입니다.", {
    size: 16,
    color: C.muted,
  });

  panel(slide, ctx, 760, 72, 400, 272, { fill: C.paper, stroke: "#D7DEE7" });
  label(slide, ctx, 790, 99, 340, 24, "핵심 설계 방향", { size: 16, bold: true });
  bullet(slide, ctx, 790, 143, "Load Balancer만 Public, API/AI/DB는 Private Subnet에 배치", { w: 320 });
  bullet(slide, ctx, 790, 198, "이미지 분석은 업로드 수락과 AI 완료를 분리한 비동기 흐름", { w: 320, color: C.amber });
  bullet(slide, ctx, 790, 253, "OCR/Gemini 호출은 NAT Gateway와 내부 토큰으로 통제", { w: 320, color: C.mint });

  await node(slide, ctx, { x: 94, y: 404, w: 208, h: 92, title: "React SPA", sub: "Vite build\nObject Storage + CDN", iconName: "Smartphone", accent: C.blue, fill: C.blueSoft });
  await node(slide, ctx, { x: 390, y: 404, w: 208, h: 92, title: "Express API", sub: "Auth / Upload / Callback\nRecommendation", iconName: "Server", accent: C.mint, fill: C.mintSoft });
  await node(slide, ctx, { x: 686, y: 404, w: 208, h: 92, title: "FastAPI AI", sub: "YOLOv8 + OCR\nIngredient matcher", iconName: "Cpu", accent: C.amber, fill: C.amberSoft });
  await node(slide, ctx, { x: 982, y: 404, w: 208, h: 92, title: "Data Plane", sub: "Cloud DB MySQL\nObject Storage / Logs", iconName: "Database", accent: C.ink, fill: C.paper });

  hFlow(slide, ctx, 302, 450, 390, { color: C.blue, text: "API" });
  hFlow(slide, ctx, 598, 450, 686, { color: C.mint, text: "internal request" });
  hFlow(slide, ctx, 894, 450, 982, { color: C.amber, text: "result / storage" });

  label(slide, ctx, 60, 596, 1060, 30, "수업 예시의 VPC/Subnet/Load Balancer 구조는 유지하고, Sunsu Care의 AI 분석·저장·운영 요소를 실제 배포 단위로 추가합니다.", {
    size: 14,
    color: C.muted,
  });
  return slide;
}
