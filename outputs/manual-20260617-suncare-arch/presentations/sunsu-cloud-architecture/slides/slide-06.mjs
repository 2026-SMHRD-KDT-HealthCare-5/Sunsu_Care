import { C, base, label, panel } from "./common.mjs";

const rows = [
  ["Object Storage", "원본/리사이즈 이미지", "scan image, product image", "Lifecycle + private URL"],
  ["Cloud DB MySQL", "업무 데이터 원장", "users, profile, upload, analysis, product", "Private subnet + backup"],
  ["Cache / Redis", "짧은 상태·중복 방지", "task map, Gemini reason cache", "MVP file cache -> managed cache"],
  ["Model Storage", "AI 모델과 seed data", "best.pt, yolov8n.pt, ingredient index", "배포 버전 고정"],
  ["Logs / Metrics", "운영 관측성", "API latency, AI duration, 429, failures", "Cloud Log Analytics + Alert"],
];

export async function slide06(presentation, ctx) {
  const slide = presentation.slides.add();
  base(slide, ctx, {
    index: 6,
    kicker: "DATA RESPONSIBILITY",
    title: "저장소별 책임을 나누면 분석 결과와 운영 데이터가 섞이지 않습니다.",
    note: "현재 프로젝트의 DB 테이블과 파일 캐시를 클라우드 저장소 책임으로 재배치한 설계입니다.",
  });

  const x = 78;
  const y = 178;
  const w = 1122;
  const headerH = 42;
  const rowH = 72;
  panel(slide, ctx, x, y, w, headerH + rowH * rows.length, { fill: C.paper, stroke: "#D7DEE7" });
  const cols = [0, 220, 470, 790, 1122];
  const headers = ["저장소", "역할", "담는 데이터", "운영 기준"];
  for (let i = 0; i < headers.length; i += 1) {
    label(slide, ctx, x + cols[i] + 18, y + 12, cols[i + 1] - cols[i] - 32, 20, headers[i], {
      size: 12,
      bold: true,
      color: C.muted,
      face: "Arial",
    });
  }
  ctx.addShape(slide, { x, y: y + headerH, w, h: 1, fill: C.faint, line: ctx.line() });
  for (let c = 1; c < cols.length - 1; c += 1) {
    ctx.addShape(slide, { x: x + cols[c], y, w: 1, h: headerH + rowH * rows.length, fill: C.faint, line: ctx.line() });
  }
  rows.forEach((row, idx) => {
    const yy = y + headerH + idx * rowH;
    if (idx > 0) ctx.addShape(slide, { x, y: yy, w, h: 1, fill: C.faint, line: ctx.line() });
    const accent = idx === 0 ? C.blue : idx === 1 ? C.ink : idx === 2 ? C.mint : idx === 3 ? C.amber : C.red;
    ctx.addShape(slide, { x, y: yy, w: 6, h: rowH, fill: accent, line: ctx.line() });
    label(slide, ctx, x + 18, yy + 21, 180, 30, row[0], { size: 14, bold: true, color: C.ink, face: "Arial" });
    label(slide, ctx, x + cols[1] + 18, yy + 18, 220, 34, row[1], { size: 13, color: C.ink });
    label(slide, ctx, x + cols[2] + 18, yy + 18, 280, 34, row[2], { size: 12, color: C.muted, face: "Arial" });
    label(slide, ctx, x + cols[3] + 18, yy + 18, 290, 34, row[3], { size: 12, color: C.muted });
  });

  panel(slide, ctx, 112, 604, 1058, 42, { fill: "#FFFDF7", stroke: "#F8D99C" });
  label(slide, ctx, 134, 616, 980, 18, "권장: MVP에서도 업로드 원본은 Object Storage로 빼고, DB에는 경로·분석 결과·점수만 저장합니다. AI task 상태는 Redis/Queue 도입 전까지는 짧게 유지합니다.", {
    size: 12,
    color: C.ink,
  });
  return slide;
}
