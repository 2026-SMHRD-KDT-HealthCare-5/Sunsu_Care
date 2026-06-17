import { C, base, label, panel, node, hFlow, vFlow, bullet } from "./common.mjs";

export async function slide02(presentation, ctx) {
  const slide = presentation.slides.add();
  base(slide, ctx, {
    index: 2,
    kicker: "CLASSROOM MODEL TO SUNSU CARE",
    title: "기본 React+Node 구조에 AI 분석 전용 경로를 추가합니다.",
    note: "수업시간 웹 서비스 아키텍처는 좋은 출발점입니다. Sunsu Care는 이미지 분석과 추천 이유 생성을 위한 별도 서비스 경계가 필요합니다.",
  });

  panel(slide, ctx, 58, 168, 520, 412, { fill: C.paper, stroke: "#D7DEE7" });
  label(slide, ctx, 88, 196, 260, 30, "수업 예시 구조", { size: 18, bold: true });
  label(slide, ctx, 88, 227, 420, 34, "React + Node 웹 서버 중심의 단순 요청/응답 구조", { size: 12.5, color: C.muted });
  await node(slide, ctx, { x: 110, y: 304, w: 150, h: 72, title: "Users", sub: "Browser", iconName: "Users", accent: C.blue, fill: C.blueSoft, small: true });
  await node(slide, ctx, { x: 330, y: 304, w: 150, h: 72, title: "Load Balancer", sub: "Public entry", iconName: "Network", accent: C.blue, fill: C.paper, small: true });
  await node(slide, ctx, { x: 220, y: 444, w: 170, h: 78, title: "Web Servers", sub: "Docker / Node.js", iconName: "Server", accent: C.mint, fill: C.mintSoft, small: true });
  hFlow(slide, ctx, 260, 340, 330, { color: C.blue });
  vFlow(slide, ctx, 405, 376, 444, { color: C.mint, text: "Get/Post" });
  bullet(slide, ctx, 94, 548, "요청 흐름은 단순하지만 AI 작업 대기, 콜백, 외부 API 통제가 표현되지 않음", { w: 410, color: C.red, size: 11.5 });

  panel(slide, ctx, 702, 168, 520, 412, { fill: C.paper, stroke: "#D7DEE7" });
  label(slide, ctx, 732, 196, 300, 30, "Sunsu Care 확장 구조", { size: 18, bold: true });
  label(slide, ctx, 732, 227, 420, 34, "API 서버와 AI 서버를 분리하고, 결과 저장과 추천 생성까지 연결", { size: 12.5, color: C.muted });
  await node(slide, ctx, { x: 732, y: 304, w: 132, h: 72, title: "React SPA", sub: "Object Storage\nCDN", iconName: "Smartphone", accent: C.blue, fill: C.blueSoft, small: true });
  await node(slide, ctx, { x: 920, y: 304, w: 132, h: 72, title: "Express API", sub: "Auth / Upload\nPolling", iconName: "Server", accent: C.mint, fill: C.mintSoft, small: true });
  await node(slide, ctx, { x: 920, y: 442, w: 132, h: 72, title: "FastAPI AI", sub: "YOLOv8\nCLOVA OCR", iconName: "Cpu", accent: C.amber, fill: C.amberSoft, small: true });
  await node(slide, ctx, { x: 1080, y: 374, w: 112, h: 72, title: "MySQL", sub: "Analysis\nProfile", iconName: "Database", accent: C.ink, fill: C.paper, small: true });
  hFlow(slide, ctx, 864, 340, 920, { color: C.blue, text: "API" });
  vFlow(slide, ctx, 986, 376, 442, { color: C.amber, text: "Analyze" });
  hFlow(slide, ctx, 1052, 410, 1080, { color: C.mint, text: "Save" });
  bullet(slide, ctx, 738, 548, "이미지 업로드, AI 분석, 콜백 저장, Gemini 추천 이유 생성을 별도 경로로 구분", { w: 410, color: C.mint, size: 11.5 });

  return slide;
}
