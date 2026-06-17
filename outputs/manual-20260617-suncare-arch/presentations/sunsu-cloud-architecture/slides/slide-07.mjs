import { C, base, label, panel, bullet } from "./common.mjs";

export async function slide07(presentation, ctx) {
  const slide = presentation.slides.add();
  base(slide, ctx, {
    index: 7,
    kicker: "IMPLEMENTATION ROADMAP",
    title: "처음부터 복잡하게 가지 말고, AI 병목이 보일 때 단계적으로 확장합니다.",
    note: "수업 산출물로는 MVP 배포안과 확장안을 함께 제시하는 구성이 설명하기 좋습니다.",
  });

  const startX = 108;
  const y = 234;
  const gap = 18;
  const widths = [246, 246, 246, 246];
  const phases = [
    ["1", "MVP 배포", "Docker Server", C.blue, "Object Storage + Cloud DB + Docker 기반 Express/FastAPI 분리 배포"],
    ["2", "운영 안정화", "Managed observability", C.mint, "Cloud Log Analytics, Cloud Insight, Health Check, 알림 기준 추가"],
    ["3", "AI 병목 해소", "Queue + worker", C.amber, "분석 요청을 큐로 분리하고 FastAPI worker를 수평 확장"],
    ["4", "서비스 확장", "NKS + autoscale", C.ink, "Ncloud Kubernetes Service, private registry, rolling deployment 적용"],
  ];

  phases.forEach((phase, idx) => {
    const x = startX + idx * (widths[idx] + gap);
    panel(slide, ctx, x, y, widths[idx], 218, { fill: C.paper, stroke: "#D7DEE7" });
    ctx.addShape(slide, { x, y, w: widths[idx], h: 8, fill: phase[3], line: ctx.line() });
    ctx.addShape(slide, { x: x + 22, y: y + 32, w: 36, h: 36, fill: phase[3], line: ctx.line() });
    label(slide, ctx, x + 22, y + 39, 36, 20, phase[0], { size: 14, bold: true, color: C.paper, align: "center", valign: "middle", face: "Arial" });
    label(slide, ctx, x + 72, y + 30, 150, 26, phase[1], { size: 17, bold: true, color: C.ink });
    label(slide, ctx, x + 72, y + 60, 150, 22, phase[2], { size: 11, color: phase[3], bold: true, face: "Arial" });
    label(slide, ctx, x + 24, y + 104, widths[idx] - 48, 64, phase[4], { size: 12.2, color: C.muted });
  });

  panel(slide, ctx, 112, 508, 484, 90, { fill: "#F7FCFE", stroke: "#B7E3F3" });
  label(slide, ctx, 138, 530, 180, 22, "발표용 결론", { size: 16, bold: true });
  bullet(slide, ctx, 138, 560, "수업 구조는 유지하되, Sunsu Care는 AI 서버와 DB를 Private으로 격리해야 합니다.", { w: 400, size: 11.5 });

  panel(slide, ctx, 680, 508, 484, 90, { fill: "#FFFCF5", stroke: "#F8D99C" });
  label(slide, ctx, 706, 530, 180, 22, "구현 우선순위", { size: 16, bold: true, color: C.amber });
  bullet(slide, ctx, 706, 560, "1차: Object Storage, Cloud DB, Docker 배포. 2차: Queue/Redis, NKS, 모니터링 자동화.", { w: 390, size: 11.5, color: C.amber });

  return slide;
}
