export const C = {
  bg: "#F7F8F5",
  paper: "#FFFFFF",
  ink: "#1F2933",
  muted: "#64748B",
  faint: "#E6EAF0",
  blue: "#16A3D8",
  blueSoft: "#E4F5FB",
  mint: "#2CB67D",
  mintSoft: "#E8F7F0",
  amber: "#F59E0B",
  amberSoft: "#FFF3D8",
  red: "#E11D48",
  redSoft: "#FDE8EE",
  slateSoft: "#EEF2F6",
  dark: "#111827",
};

export const FONT = "Malgun Gothic";

export function base(slide, ctx, meta = {}) {
  ctx.addShape(slide, { x: 0, y: 0, w: ctx.W, h: ctx.H, fill: C.bg, line: ctx.line() });
  if (meta.kicker) addKicker(slide, ctx, meta.kicker, meta.index);
  if (meta.title) {
    ctx.addText(slide, {
      x: 58,
      y: 58,
      w: 1040,
      h: 64,
      text: meta.title,
      fontSize: meta.titleSize || 27,
      bold: true,
      color: C.ink,
      typeface: FONT,
      insets: { left: 0, right: 0, top: 0, bottom: 0 },
    });
  }
  if (meta.note) {
    ctx.addText(slide, {
      x: 58,
      y: 126,
      w: 960,
      h: 30,
      text: meta.note,
      fontSize: 13.5,
      color: C.muted,
      typeface: FONT,
      insets: { left: 0, right: 0, top: 0, bottom: 0 },
    });
  }
  footer(slide, ctx, meta.index);
}

export function addKicker(slide, ctx, text, index = 1) {
  const y = 31;
  ctx.addShape(slide, {
    x: 58,
    y,
    w: 8,
    h: 8,
    fill: C.blue,
    line: ctx.line(),
    name: `kicker-${String(index).padStart(2, "0")}-marker`,
  });
  ctx.addText(slide, {
    x: 74,
    y: y - 5,
    w: 260,
    h: 18,
    text,
    fontSize: 10,
    bold: true,
    color: C.blue,
    typeface: "Arial",
    valign: "middle",
    name: `kicker-${String(index).padStart(2, "0")}-label`,
  });
}

export function footer(slide, ctx, index = 1) {
  ctx.addText(slide, {
    x: 58,
    y: 686,
    w: 620,
    h: 18,
    text: "Sunsu Care cloud architecture draft | classroom architecture extended",
    fontSize: 9,
    color: "#94A3B8",
    typeface: "Arial",
  });
  ctx.addText(slide, {
    x: 1178,
    y: 686,
    w: 44,
    h: 18,
    text: String(index).padStart(2, "0"),
    fontSize: 9,
    color: "#94A3B8",
    align: "right",
    typeface: "Arial",
  });
}

export function label(slide, ctx, x, y, w, h, text, opts = {}) {
  return ctx.addText(slide, {
    x,
    y,
    w,
    h,
    text,
    fontSize: opts.size || 14,
    bold: Boolean(opts.bold),
    color: opts.color || C.ink,
    typeface: opts.face || FONT,
    align: opts.align || "left",
    valign: opts.valign || "top",
    fill: opts.fill || "#00000000",
    line: opts.line || ctx.line(),
    insets: opts.insets || { left: 0, right: 0, top: 0, bottom: 0 },
    name: opts.name,
  });
}

export function panel(slide, ctx, x, y, w, h, opts = {}) {
  return ctx.addShape(slide, {
    x,
    y,
    w,
    h,
    fill: opts.fill || C.paper,
    line: opts.line || { style: "solid", fill: opts.stroke || C.faint, width: opts.width || 1 },
    name: opts.name,
  });
}

export function lane(slide, ctx, x, y, w, h, title, opts = {}) {
  panel(slide, ctx, x, y, w, h, {
    fill: opts.fill || "#FFFFFFAA",
    stroke: opts.stroke || C.faint,
    width: opts.width || 1,
    name: opts.name,
  });
  label(slide, ctx, x + 14, y + 12, w - 28, 22, title, {
    size: 12,
    bold: true,
    color: opts.color || C.muted,
    face: "Arial",
  });
}

export async function icon(slide, ctx, name, x, y, size = 24, color = C.ink) {
  try {
    await ctx.addLucideIcon(slide, {
      icon: name,
      x,
      y,
      w: size,
      h: size,
      color,
      strokeWidth: 2,
      fit: "contain",
    });
  } catch {
    label(slide, ctx, x, y, size, size, name.slice(0, 1), {
      size: Math.max(9, size * 0.45),
      bold: true,
      color,
      align: "center",
      valign: "middle",
      fill: "#00000000",
    });
  }
}

export async function node(slide, ctx, cfg) {
  const {
    x,
    y,
    w,
    h,
    title,
    sub = "",
    iconName = "Server",
    fill = C.paper,
    stroke = C.faint,
    accent = C.blue,
    dark = false,
    small = false,
  } = cfg;
  panel(slide, ctx, x, y, w, h, { fill, stroke, width: 1 });
  ctx.addShape(slide, { x, y, w: 5, h, fill: accent, line: ctx.line() });
  await icon(slide, ctx, iconName, x + 16, y + 18, small ? 22 : 28, dark ? C.paper : accent);
  label(slide, ctx, x + 54, y + 15, w - 66, 24, title, {
    size: small ? 13 : 15,
    bold: true,
    color: dark ? C.paper : C.ink,
  });
  if (sub) {
    label(slide, ctx, x + 54, y + 42, w - 66, h - 48, sub, {
      size: small ? 10.5 : 11.5,
      color: dark ? "#D1D5DB" : C.muted,
    });
  }
}

export function hFlow(slide, ctx, x1, y, x2, opts = {}) {
  const color = opts.color || C.blue;
  const left = Math.min(x1, x2);
  const width = Math.abs(x2 - x1);
  ctx.addShape(slide, { x: left, y, w: width, h: opts.thick || 2, fill: color, line: ctx.line() });
  label(slide, ctx, x2 - 8, y - 11, 18, 20, x2 >= x1 ? ">" : "<", {
    size: 13,
    bold: true,
    color,
    align: "center",
    valign: "middle",
  });
  if (opts.text) {
    label(slide, ctx, left + width * 0.18, y - 25, width * 0.64, 20, opts.text, {
      size: opts.size || 10,
      color: opts.labelColor || C.muted,
      align: "center",
      face: opts.face || FONT,
    });
  }
}

export function vFlow(slide, ctx, x, y1, y2, opts = {}) {
  const color = opts.color || C.blue;
  const top = Math.min(y1, y2);
  const height = Math.abs(y2 - y1);
  ctx.addShape(slide, { x, y: top, w: opts.thick || 2, h: height, fill: color, line: ctx.line() });
  label(slide, ctx, x - 8, y2 - 8, 18, 20, y2 >= y1 ? "v" : "^", {
    size: 13,
    bold: true,
    color,
    align: "center",
    valign: "middle",
  });
  if (opts.text) {
    label(slide, ctx, x + 8, top + height * 0.32, opts.w || 120, 32, opts.text, {
      size: opts.size || 10,
      color: opts.labelColor || C.muted,
      face: opts.face || FONT,
    });
  }
}

export function badge(slide, ctx, x, y, text, color = C.blue) {
  ctx.addShape(slide, { x, y, w: 24, h: 24, fill: color, line: ctx.line() });
  label(slide, ctx, x, y + 1, 24, 22, text, {
    size: 11,
    bold: true,
    color: C.paper,
    align: "center",
    valign: "middle",
    face: "Arial",
  });
}

export function bullet(slide, ctx, x, y, text, opts = {}) {
  ctx.addShape(slide, { x, y: y + 7, w: 5, h: 5, fill: opts.color || C.blue, line: ctx.line() });
  label(slide, ctx, x + 14, y, opts.w || 280, opts.h || 36, text, {
    size: opts.size || 12,
    color: opts.textColor || C.ink,
  });
}
