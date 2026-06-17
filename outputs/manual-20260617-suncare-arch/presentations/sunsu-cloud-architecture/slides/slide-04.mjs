import { C, base, label, panel, node, hFlow, badge } from "./common.mjs";

export async function slide04(presentation, ctx) {
  const slide = presentation.slides.add();
  base(slide, ctx, {
    index: 4,
    kicker: "ASYNC ANALYSIS FLOW",
    title: "업로드 응답과 AI 완료를 분리해야 사용자가 기다리지 않습니다.",
    note: "현재 코드의 Express -> FastAPI 요청, task 조회, callback 저장 구조를 클라우드 운영 흐름으로 정리했습니다.",
  });

  const y = 255;
  await node(slide, ctx, { x: 66, y, w: 150, h: 88, title: "User", sub: "제품 성분표\n이미지 업로드", iconName: "Smartphone", accent: C.blue, fill: C.blueSoft });
  await node(slide, ctx, { x: 284, y, w: 156, h: 88, title: "Express API", sub: "JWT 확인\ntb_upload 저장", iconName: "Server", accent: C.mint, fill: C.mintSoft });
  await node(slide, ctx, { x: 508, y, w: 156, h: 88, title: "FastAPI AI", sub: "task_id 발급\n백그라운드 실행", iconName: "Cpu", accent: C.amber, fill: C.amberSoft });
  await node(slide, ctx, { x: 732, y, w: 156, h: 88, title: "OCR / YOLO", sub: "CLOVA OCR\nYOLOv8 detection", iconName: "ScanText", accent: C.amber, fill: C.paper });
  await node(slide, ctx, { x: 956, y, w: 156, h: 88, title: "MySQL", sub: "analysis_log\nanalysis result", iconName: "Database", accent: C.ink, fill: C.paper });

  hFlow(slide, ctx, 216, y + 44, 284, { color: C.blue, text: "1. POST /upload" });
  hFlow(slide, ctx, 440, y + 44, 508, { color: C.mint, text: "2. POST analyze" });
  hFlow(slide, ctx, 664, y + 44, 732, { color: C.amber, text: "3. parallel OCR/YOLO" });
  hFlow(slide, ctx, 888, y + 44, 956, { color: C.ink, text: "5. save result" });

  badge(slide, ctx, 258, 219, "1", C.blue);
  badge(slide, ctx, 482, 219, "2", C.mint);
  badge(slide, ctx, 706, 219, "3", C.amber);
  badge(slide, ctx, 885, 219, "4", C.amber);
  badge(slide, ctx, 930, 219, "5", C.ink);

  panel(slide, ctx, 160, 432, 948, 104, { fill: "#FFFFFFDD", stroke: "#D7DEE7" });
  label(slide, ctx, 188, 455, 222, 26, "사용자 체감 흐름", { size: 16, bold: true });
  label(slide, ctx, 188, 488, 348, 32, "Express는 202 Accepted와 task_id를 빠르게 반환하고, 화면은 /tasks/:taskId를 폴링합니다.", { size: 12, color: C.muted });
  label(slide, ctx, 564, 455, 190, 26, "서버 완료 흐름", { size: 16, bold: true, color: C.amber });
  label(slide, ctx, 564, 488, 420, 32, "FastAPI 완료 후 Express callback으로 결과를 보내고, Express가 점수 계산과 MySQL 저장을 담당합니다.", { size: 12, color: C.muted });
  hFlow(slide, ctx, 664, 536, 440, { color: C.amber, text: "callback /api/suncare/callbacks/suncare" });
  hFlow(slide, ctx, 284, 536, 116, { color: C.blue, text: "polling result" });

  return slide;
}
