import { C, base, label, panel, lane, node, hFlow, vFlow } from "./common.mjs";

export async function slide03(presentation, ctx) {
  const slide = presentation.slides.add();
  base(slide, ctx, {
    index: 3,
    kicker: "TARGET CLOUD ARCHITECTURE",
    title: "Public 진입점은 작게, API·AI·데이터 계층은 Private으로 둡니다.",
    note: "Naver Cloud 기준으로 표현한 권장 배포 구조입니다. MVP는 Docker Server로 시작하고, 트래픽 증가 시 NKS로 이전할 수 있습니다.",
  });

  label(slide, ctx, 60, 162, 98, 30, "Users", { size: 13, bold: true, align: "center" });
  await node(slide, ctx, { x: 50, y: 196, w: 122, h: 76, title: "Mobile Web", sub: "React SPA", iconName: "Smartphone", accent: C.blue, fill: C.blueSoft, small: true });
  await node(slide, ctx, { x: 50, y: 320, w: 122, h: 76, title: "GitHub", sub: "Actions\nCI/CD", iconName: "Github", accent: C.ink, fill: C.paper, small: true });

  panel(slide, ctx, 212, 148, 724, 444, { fill: "#FFFFFF66", stroke: C.blue, width: 2, name: "vpc-boundary" });
  label(slide, ctx, 232, 162, 160, 24, "VPC", { size: 13, bold: true, color: C.blue, face: "Arial" });

  lane(slide, ctx, 242, 196, 190, 326, "Public Subnet", { color: C.blue, stroke: "#B7E3F3", fill: "#F7FCFE" });
  await node(slide, ctx, { x: 266, y: 248, w: 142, h: 76, title: "Load Balancer", sub: "HTTPS\n/api routing", iconName: "Network", accent: C.blue, fill: C.paper, small: true });
  await node(slide, ctx, { x: 266, y: 386, w: 142, h: 76, title: "NAT Gateway", sub: "Private egress\nOCR / LLM", iconName: "Route", accent: C.amber, fill: C.amberSoft, small: true });

  lane(slide, ctx, 462, 196, 218, 326, "Private App Subnet", { color: C.mint, stroke: "#BEEBD8", fill: "#F8FEFB" });
  await node(slide, ctx, { x: 490, y: 248, w: 162, h: 82, title: "Express API", sub: "auth / profile\nupload / callback", iconName: "Server", accent: C.mint, fill: C.mintSoft, small: true });
  await node(slide, ctx, { x: 490, y: 392, w: 162, h: 82, title: "Container Runtime", sub: "Docker Server\nor NKS service", iconName: "Boxes", accent: C.ink, fill: C.paper, small: true });

  lane(slide, ctx, 710, 196, 198, 326, "Private AI Subnet", { color: C.amber, stroke: "#F8D99C", fill: "#FFFCF5" });
  await node(slide, ctx, { x: 738, y: 248, w: 142, h: 82, title: "FastAPI AI", sub: "YOLOv8\nIngredient matcher", iconName: "Cpu", accent: C.amber, fill: C.amberSoft, small: true });
  await node(slide, ctx, { x: 738, y: 392, w: 142, h: 82, title: "Model Files", sub: "best.pt\nseed data", iconName: "Package", accent: C.ink, fill: C.paper, small: true });

  panel(slide, ctx, 974, 196, 238, 326, { fill: C.paper, stroke: "#D7DEE7" });
  label(slide, ctx, 998, 215, 180, 22, "Managed Data / External", { size: 13, bold: true, color: C.muted, face: "Arial" });
  await node(slide, ctx, { x: 998, y: 258, w: 170, h: 66, title: "Object Storage", sub: "scan images\nproduct images", iconName: "HardDrive", accent: C.blue, fill: C.blueSoft, small: true });
  await node(slide, ctx, { x: 998, y: 350, w: 170, h: 66, title: "Cloud DB MySQL", sub: "profile / analysis\nproduct catalog", iconName: "Database", accent: C.ink, fill: C.paper, small: true });
  await node(slide, ctx, { x: 998, y: 442, w: 170, h: 66, title: "CLOVA / Gemini", sub: "OCR + reason text\nvia NAT egress", iconName: "Bot", accent: C.amber, fill: C.amberSoft, small: true });

  hFlow(slide, ctx, 172, 286, 266, { color: C.blue, text: "HTTPS" });
  hFlow(slide, ctx, 408, 286, 490, { color: C.mint, text: "REST /api" });
  hFlow(slide, ctx, 652, 288, 738, { color: C.amber, text: "internal token" });
  hFlow(slide, ctx, 880, 288, 998, { color: C.blue, text: "image/object" });
  hFlow(slide, ctx, 738, 330, 652, { color: C.mint, text: "callback" });
  hFlow(slide, ctx, 652, 430, 738, { color: C.ink, text: "model mount" });
  hFlow(slide, ctx, 880, 384, 998, { color: C.ink, text: "SQL" });
  hFlow(slide, ctx, 408, 424, 490, { color: C.amber, text: "egress" });
  hFlow(slide, ctx, 408, 356, 266, { color: C.amber, text: "NAT" });
  vFlow(slide, ctx, 337, 324, 386, { color: C.amber, text: "external API" });
  hFlow(slide, ctx, 172, 358, 490, { color: C.ink, text: "deploy / image pull" });
  vFlow(slide, ctx, 490, 358, 430, { color: C.ink });

  return slide;
}
