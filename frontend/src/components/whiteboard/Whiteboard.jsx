import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { Eraser, Trash2, Pen, Minus, Plus, Undo2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const DARK_BG = "#020817";
const LIGHT_BG = "#f8fafc";

const DARK_COLORS = [
  "#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#94a3b8"
];

const LIGHT_COLORS = [
  "#0f172a", "#dc2626", "#ea580c", "#ca8a04", "#16a34a",
  "#2563eb", "#7c3aed", "#db2777", "#0d9488", "#475569"
];

const STROKE_WIDTHS = [2, 4, 6, 10];

export default function Whiteboard({ socket, roomId }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const bgColor = isDark ? DARK_BG : LIGHT_BG;

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef(null);
  const strokesRef = useRef([]);
  const bgColorRef = useRef(bgColor);
  bgColorRef.current = bgColor;

  const colors = useMemo(() => isDark ? DARK_COLORS : LIGHT_COLORS, [isDark]);

  const [color, setColor] = useState(colors[0]);
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [tool, setTool] = useState("pen"); // pen | eraser

  useEffect(() => {
    setColor(colors[0]);
    redrawAll();
  }, [isDark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      redrawAll();
    };
    resize();
    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  }, []);

  const redrawAll = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const canvas = canvasRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const stroke of strokesRef.current) {
      drawStroke(ctx, stroke);
    }
  }, []);

  const getStrokeColor = (stroke) => {
    return stroke.eraser ? bgColorRef.current : stroke.color;
  };

  const drawStroke = (ctx, stroke) => {
    if (stroke.points.length < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = getStrokeColor(stroke);
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
  };

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    isDrawing.current = true;
    const pos = getPos(e);
    lastPoint.current = pos;
    const isEraser = tool === "eraser";
    const stroke = {
      color: isEraser ? bgColor : color,
      eraser: isEraser,
      width: isEraser ? strokeWidth * 3 : strokeWidth,
      points: [pos],
    };
    strokesRef.current.push(stroke);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const pos = getPos(e);
    const stroke = strokesRef.current[strokesRef.current.length - 1];
    stroke.points.push(pos);

    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.strokeStyle = getStrokeColor(stroke);
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPoint.current = pos;
  };

  const endDraw = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const lastStroke = strokesRef.current[strokesRef.current.length - 1];
    if (lastStroke) {
      socket?.emit("whiteboard:draw", { roomId, stroke: lastStroke });
    }
  };

  const clearCanvas = () => {
    strokesRef.current = [];
    const ctx = ctxRef.current;
    if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    socket?.emit("whiteboard:clear", { roomId });
  };

  const undo = () => {
    strokesRef.current.pop();
    redrawAll();
  };

  useEffect(() => {
    if (!socket) return;
    const handleDraw = (data) => {
      strokesRef.current.push(data.stroke);
      const ctx = ctxRef.current;
      if (ctx) drawStroke(ctx, data.stroke);
    };
    const handleClear = () => {
      strokesRef.current = [];
      const ctx = ctxRef.current;
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };
    socket.on("whiteboard:draw", handleDraw);
    socket.on("whiteboard:clear", handleClear);
    return () => {
      socket.off("whiteboard:draw", handleDraw);
      socket.off("whiteboard:clear", handleClear);
    };
  }, [socket]);

  return (
    <div className="flex flex-col h-full bg-[var(--editor-bg)]">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] bg-[var(--header)] shrink-0 flex-wrap">
        <button
          onClick={() => setTool("pen")}
          className={`p-1.5 rounded-md transition-all ${tool === "pen" ? "bg-emerald-500/20 text-emerald-400" : "text-[var(--text-secondary)] hover:text-[var(--text)]"}`}
          title="Pen"
        >
          <Pen size={16} />
        </button>
        <button
          onClick={() => setTool("eraser")}
          className={`p-1.5 rounded-md transition-all ${tool === "eraser" ? "bg-emerald-500/20 text-emerald-400" : "text-[var(--text-secondary)] hover:text-[var(--text)]"}`}
          title="Eraser"
        >
          <Eraser size={16} />
        </button>

        <div className="w-px h-5 bg-[var(--border)] mx-1" />

        {colors.map((c) => (
          <button
            key={c}
            onClick={() => { setColor(c); setTool("pen"); }}
            className={`w-5 h-5 rounded-full border-2 transition-all ${color === c ? "border-emerald-400 scale-110" : "border-transparent"}`}
            style={{ backgroundColor: c }}
          />
        ))}

        <div className="w-px h-5 bg-[var(--border)] mx-1" />

        {STROKE_WIDTHS.map((w) => (
          <button
            key={w}
            onClick={() => setStrokeWidth(w)}
            className={`p-1.5 rounded-md transition-all ${strokeWidth === w ? "bg-emerald-500/20 text-emerald-400" : "text-[var(--text-secondary)] hover:text-[var(--text)]"}`}
            title={`${w}px`}
          >
            <div className="rounded-full bg-current mx-auto" style={{ width: Math.min(w + 4, 14), height: Math.min(w + 4, 14) }} />
          </button>
        ))}

        <div className="w-px h-5 bg-[var(--border)] mx-1" />

        <button
          onClick={undo}
          className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text)] transition-all"
          title="Undo"
        >
          <Undo2 size={16} />
        </button>
        <button
          onClick={clearCanvas}
          className="p-1.5 rounded-md text-red-400 hover:text-red-300 transition-all"
          title="Clear All"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
          className="absolute inset-0 cursor-crosshair touch-none"
          style={{ background: bgColor }}
        />
        {strokesRef.current.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest">
              Draw architecture diagrams & explain code live
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
