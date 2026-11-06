import { useEffect, useMemo, useRef, useState } from "react";
import { ShoppingBag, Plus, Minus, X } from "lucide-react";

/* ───────────────────────────────────────────────────────────
   Deli Dulces Típicos · Landing + catálogo (mobile-first)
   Requiere: react, tailwindcss, lucide-react
   Logo: guarda el archivo en  public/logo-deli.png
   ─────────────────────────────────────────────────────────── */

const LOGO = "/logo-deli.png";
const HERO_IMG = "/hero-dulces.png"; // imagen del banner (PNG transparente); también sirve de portada del video
/* Para usar un video en el banner, pon aquí la ruta del archivo que guardaste en la carpeta public.
   Ejemplo: { mp4: "/hero.mp4", webm: "" }. Si dejas ambos vacíos, se muestra la imagen. */
const HERO_VIDEO = { mp4: "", webm: "" };
const BRAND = "Deli Dulces Típicos";
const WHATSAPP_NUMBER = "52XXXXXXXXXX"; // 52 + tu número de 10 dígitos, sin +, espacios ni guiones

/* 1 · CAPA DE DATOS ───────────────── */

const USE_MOCK = false; // true = usa los dulces de ejemplo de abajo (sin backend)
const API_URL = "/api/products";

/* Cada dulce que devuelve /api/products tiene esta forma:
   { id, name, price, soldBy: "pieza" | "kilo", color, flavor: "dulce" | "acido" | "picante",
     image: URL de la foto sin fondo (o null), emoji, featured }
   Se administran desde el panel privado:  tusitio.com/#admin */

const MOCK = [
  { id: 1, name: "Gomitas de osito", price: 180, soldBy: "kilo", color: "rosa", flavor: "dulce", emoji: "🧸", featured: true },
  { id: 2, name: "Paleta de uva", price: 18, soldBy: "pieza", color: "morado", flavor: "dulce", emoji: "🍭" },
  { id: 3, name: "Gusanos ácidos", price: 210, soldBy: "kilo", color: "verde", flavor: "acido", emoji: "🐛" },
  { id: 4, name: "Mango enchilado", price: 24, soldBy: "pieza", color: "naranja", flavor: "picante", emoji: "🥭" },
  { id: 5, name: "Nubes de vainilla", price: 160, soldBy: "kilo", color: "azul", flavor: "dulce", emoji: "☁️", featured: true },
  { id: 6, name: "Caramelo de cereza", price: 6, soldBy: "pieza", color: "rojo", flavor: "acido", emoji: "🍒" },
  { id: 7, name: "Tamarindo con chile", price: 190, soldBy: "kilo", color: "naranja", flavor: "picante", emoji: "🌶️" },
  { id: 8, name: "Cocada de coco", price: 20, soldBy: "pieza", color: "amarillo", flavor: "dulce", emoji: "🥥" },
  { id: 9, name: "Algodón de azúcar", price: 35, soldBy: "pieza", color: "rosa", flavor: "dulce", emoji: "🍥" },
  { id: 10, name: "Aros ácidos de limón", price: 200, soldBy: "kilo", color: "verde", flavor: "acido", emoji: "🍋" },
];

async function fetchProducts(signal) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600));
    return MOCK;
  }
  const res = await fetch(API_URL, { signal });
  if (!res.ok) throw new Error("No pudimos cargar el catálogo");
  return await res.json();
}

function useProducts() {
  const [state, setState] = useState({ items: [], loading: true, error: null });
  useEffect(() => {
    const ctrl = new AbortController();
    fetchProducts(ctrl.signal)
      .then((items) => setState({ items, loading: false, error: null }))
      .catch((e) => e.name !== "AbortError" && setState({ items: [], loading: false, error: e.message }));
    return () => ctrl.abort();
  }, []);
  return state;
}

/* 2 · TOKENS (colores tomados del logo) ──────────────────── */

const COLORS = {
  rosa: { label: "Rosa", hex: "#FF5FA8", tint: "#FFDDEC" },
  naranja: { label: "Naranja", hex: "#FF8A2B", tint: "#FFE6CF" },
  amarillo: { label: "Amarillo", hex: "#FFD23F", tint: "#FFF3C2" },
  verde: { label: "Verde", hex: "#73D13D", tint: "#E1F6D3" },
  azul: { label: "Azul", hex: "#4CC9F0", tint: "#D6F2FC" },
  morado: { label: "Morado", hex: "#9B5DE5", tint: "#EADDFB" },
  rojo: { label: "Rojo", hex: "#FF5A5F", tint: "#FFDFE0" },
};
const FLAVORS = [
  { id: "dulce", label: "Dulce" },
  { id: "acido", label: "Ácido" },
  { id: "picante", label: "Picante" },
];
const money = (n) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Comfortaa:wght@600;700&display=swap');
.dn{--bg:#FFFBF5;--ink:#2A1038;--soft:#6B5A78;--brand:#C2188F;--orange:#FF8A2B;--green:#73D13D;--yellow:#FFD23F;--sky:#4CC9F0;
  font-family:'Quicksand',system-ui,sans-serif;background:var(--bg);color:var(--ink)}
.dn .display{font-family:'Comfortaa','Quicksand',sans-serif;letter-spacing:-.02em}
.dn ::-webkit-scrollbar{display:none}
@keyframes dn-float{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-14px) rotate(3deg)}}
@keyframes dn-pop{0%{transform:scale(.6)}60%{transform:scale(1.15)}100%{transform:scale(1)}}
@keyframes dn-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes dn-shimmer{to{background-position:-200% 0}}
.dn .float{animation:dn-float 6s ease-in-out infinite}
.dn .pop{animation:dn-pop .35s ease-out}
.dn .rise{animation:dn-rise .7s cubic-bezier(.2,.8,.2,1) both}
.dn .skeleton{background:linear-gradient(90deg,#fde6f3 25%,#fff 50%,#fde6f3 75%);background-size:200% 100%;animation:dn-shimmer 1.4s linear infinite}
@media (prefers-reduced-motion:reduce){.dn *{animation:none!important;transition:none!important}}
`;

/* 3 · UI BASE (estilo shadcn) ────────────────────────────── */

const Btn = ({ className = "", variant = "primary", ...p }) => (
  <button
    {...p}
    className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-bold transition active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] ${
      variant === "primary"
        ? "bg-[var(--orange)] text-[var(--ink)] shadow-[0_10px_24px_-8px_rgba(255,138,43,.8)] hover:brightness-105"
        : "bg-white text-[var(--brand)] shadow-[0_6px_18px_-8px_rgba(194,24,143,.45)] hover:bg-[#FFF0F8]"
    } ${className}`}
  />
);

const Chip = ({ active, children, className = "", ...p }) => (
  <button
    {...p}
    aria-pressed={active}
    className={`shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--brand)] ${
      active ? "bg-[var(--brand)] text-white shadow-md" : "bg-white text-[var(--ink)] shadow-sm hover:bg-[#FFF0F8]"
    } ${className}`}
  >
    {children}
  </button>
);

const Badge = ({ children, tone = "#FFE3F3" }) => (
  <span className="rounded-full px-2.5 py-1 text-xs font-bold text-[var(--ink)]" style={{ background: tone }}>
    {children}
  </span>
);

/* 4 · HERO: imagen que gira con el cursor ─────────────────── */

function HeroVideo() {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true; // en iPhone el video solo arranca solo si está silenciado
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) v.pause();
    else v.play().catch(() => {});
  }, []);
  return (
    <video
      ref={ref}
      poster={HERO_IMG}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      aria-label="Video de nuestros dulces típicos"
      className="pointer-events-none h-full w-full rounded-[3rem] object-cover"
    >
      {HERO_VIDEO.webm && <source src={HERO_VIDEO.webm} type="video/webm" />}
      {HERO_VIDEO.mp4 && <source src={HERO_VIDEO.mp4} type="video/mp4" />}
    </video>
  );
}

function Hero({ onKilo }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [spin, setSpin] = useState(0);
  const ref = useRef(null);
  const hasVideo = !!(HERO_VIDEO.mp4 || HERO_VIDEO.webm);

  const move = (e) => {
    const r = ref.current.getBoundingClientRect();
    setTilt({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
  };

  /* Confeti como el del logo */
  const confetti = [
    { c: "#FFD23F", w: 44, h: 18, p: "top-[8%] left-[8%]", r: -25, d: "0s", k: 40 },
    { c: "#4CC9F0", w: 22, h: 34, p: "top-[62%] left-[6%]", r: 20, d: "1.2s", k: -30 },
    { c: "#73D13D", w: 40, h: 16, p: "top-[10%] right-[10%]", r: 30, d: ".6s", k: -50 },
    { c: "#FF5FA8", w: 20, h: 38, p: "bottom-[9%] right-[12%]", r: -15, d: "1.8s", k: 30 },
    { c: "#9B5DE5", w: 34, h: 14, p: "bottom-[14%] left-[24%]", r: 12, d: ".9s", k: -24 },
  ];

  return (
    <section className="relative mx-auto grid max-w-6xl items-center gap-4 px-5 pb-10 pt-6 md:grid-cols-2 md:gap-10 md:pt-14">
      <div className="rise order-2 md:order-1">
        <h1 className="display text-[2.6rem] font-bold leading-[1.05] md:text-6xl">
          Hoy toca algo dulce, ácido o con chile.
        </h1>
        <p className="mt-4 max-w-md text-lg text-[var(--soft)]">
          Dulces típicos por pieza o por kilo. Eliges desde tu celular y te lo preparamos.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Btn onClick={() => document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" })}>Ver dulces</Btn>
          <Btn variant="soft" onClick={onKilo}>Armar mi kilo</Btn>
        </div>
      </div>

      <div
        ref={ref}
        onPointerMove={move}
        onPointerLeave={() => setTilt({ x: 0, y: 0 })}
        className="order-1 relative mx-auto aspect-square w-full max-w-md touch-pan-y select-none rounded-[3rem] bg-gradient-to-br from-[#FFF0B8] via-[#FFD6EC] to-[#CFF1FF] md:order-2"
        style={{ perspective: 900 }}
      >
        {confetti.map((m, i) => (
          <span
            key={i}
            className={`float absolute rounded-md ${m.p}`}
            style={{
              width: m.w,
              height: m.h,
              background: m.c,
              rotate: `${m.r}deg`,
              animationDelay: m.d,
              translate: `${tilt.x * m.k}px ${tilt.y * m.k}px`,
              transition: "translate .25s ease-out",
            }}
          />
        ))}
        <button
          onClick={() => setSpin((s) => s + 360)}
          aria-label="Girar la imagen"
          className={`absolute inset-0 m-auto cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--brand)] ${hasVideo ? "h-full w-full rounded-[3rem]" : "h-fit w-[94%] rounded-3xl"}`}
          style={{
            transform: `rotateY(${tilt.x * 40 + spin}deg) rotateX(${-tilt.y * 32}deg) rotateZ(${tilt.x * 10 - 6}deg)`,
            transition: "transform .6s cubic-bezier(.2,.8,.2,1)",
            transformStyle: "preserve-3d",
          }}
        >
          {hasVideo ? (
            <HeroVideo />
          ) : (
            <img
              src={HERO_IMG}
              alt="Palanqueta en barra y tortilla de cacahuate"
              draggable={false}
              className="float w-full drop-shadow-[0_24px_24px_rgba(42,16,56,.28)]"
            />
          )}
        </button>
      </div>
    </section>
  );
}

/* 5 · FILTROS ────────────────────────────────────────────── */

function Filters({ f, set, count }) {
  const toggle = (k, v) => set({ ...f, [k]: f[k] === v ? null : v });
  return (
    <div className="sticky top-0 z-20 -mx-5 bg-[var(--bg)]/85 px-5 pb-3 pt-3 backdrop-blur-md md:mx-0 md:rounded-[2rem] md:px-6">
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5" role="group" aria-label="Buscar por color">
          <span className="shrink-0 pr-1 text-sm font-bold text-[var(--soft)]">Color</span>
          {Object.entries(COLORS).map(([k, c]) => (
            <Chip key={k} active={f.color === k} onClick={() => toggle("color", k)}>
              <span className="h-3.5 w-3.5 rounded-full ring-2 ring-white" style={{ background: c.hex }} />
              {c.label}
            </Chip>
          ))}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5" role="group" aria-label="Buscar por sabor">
          <span className="shrink-0 pr-1 text-sm font-bold text-[var(--soft)]">Sabor</span>
          {FLAVORS.map((x) => (
            <Chip key={x.id} active={f.flavor === x.id} onClick={() => toggle("flavor", x.id)}>{x.label}</Chip>
          ))}
          <span className="mx-1 h-5 w-px shrink-0 bg-[#F2D6E8]" />
          <Chip active={f.kilo} onClick={() => set({ ...f, kilo: !f.kilo })}>Dulces por kilo</Chip>
        </div>
      </div>
      <p className="mt-2 text-sm text-[var(--soft)]" aria-live="polite">{count} {count === 1 ? "dulce" : "dulces"}</p>
    </div>
  );
}

/* 6 · TARJETAS BENTO ─────────────────────────────────────── */

function ProductCard({ p, qty, onChange }) {
  const c = COLORS[p.color] ?? COLORS.rosa;
  const step = p.soldBy === "kilo" ? 0.25 : 1;
  const unit = p.soldBy === "kilo" ? "/kg" : " c/u";
  const label = p.soldBy === "kilo" ? `${qty} kg` : `${qty}`;
  const [bump, setBump] = useState(0);
  const change = (d) => { onChange(p.id, d * step); setBump((b) => b + 1); };

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-[2rem] bg-white p-3 shadow-[0_14px_34px_-16px_rgba(194,24,143,.4)] transition hover:-translate-y-1 hover:shadow-[0_22px_40px_-16px_rgba(194,24,143,.5)] ${
        p.featured ? "col-span-2 sm:flex-row sm:items-stretch" : ""
      }`}
    >
      <div
        className={`relative grid place-items-center rounded-[1.5rem] ${p.featured ? "aspect-[2/1] sm:aspect-auto sm:w-1/2" : "aspect-square"}`}
        style={{ background: `linear-gradient(135deg, ${c.tint}, #fff)` }}
      >
        {p.image ? (
          <img src={p.image} alt={p.name} loading="lazy" className="h-4/5 w-4/5 object-contain transition group-hover:scale-110 group-hover:rotate-6" />
        ) : (
          <span className="text-6xl transition duration-300 group-hover:scale-125 group-hover:-rotate-12 md:text-7xl" aria-hidden="true">{p.emoji}</span>
        )}
        <span className="absolute left-3 top-3"><Badge tone={c.tint}>{FLAVORS.find((x) => x.id === p.flavor)?.label}</Badge></span>
      </div>

      <div className={`flex flex-1 flex-col justify-between gap-3 px-2 pb-1 pt-3 ${p.featured ? "sm:p-5" : ""}`}>
        <div>
          <h3 className="display text-base font-bold leading-snug md:text-lg">{p.name}</h3>
          <p className="mt-0.5 text-sm text-[var(--soft)]">{p.soldBy === "kilo" ? "Se vende por kilo" : "Se vende por pieza"}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-lg font-bold">{money(p.price)}<span className="text-sm font-medium text-[var(--soft)]">{unit}</span></span>
          {qty > 0 ? (
            <div key={bump} className="pop flex items-center gap-1 rounded-full bg-[#FFF0F8] p-1">
              <button aria-label="Quitar" onClick={() => change(-1)} className="grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--brand)]"><Minus size={16} /></button>
              <span className="min-w-[3.2rem] text-center text-sm font-bold">{label}</span>
              <button aria-label="Agregar más" onClick={() => change(1)} className="grid h-8 w-8 place-items-center rounded-full bg-[var(--orange)] text-[var(--ink)]"><Plus size={16} /></button>
            </div>
          ) : (
            <button
              aria-label={`Agregar ${p.name}`}
              onClick={() => change(1)}
              className="grid h-11 w-11 place-items-center rounded-full bg-[var(--orange)] text-[var(--ink)] shadow-[0_8px_18px_-6px_rgba(255,138,43,.85)] transition active:scale-90"
            ><Plus size={20} /></button>
          )}
        </div>
      </div>
    </article>
  );
}

const Skeletons = () => (
  <>{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton aspect-[4/5] rounded-[2rem]" />)}</>
);

/* 7 · PEDIDO POR WHATSAPP ────────────────────────────────── */

function buildMessage(f, detail, total) {
  const rows = detail.map((d) => `• ${d.name}: ${d.qtyLabel} × ${money(d.price)}${d.unit} = ${money(d.subtotal)}`);
  return [
    `¡Hola! Quiero hacer un pedido en ${BRAND} 🍬`,
    "",
    `Nombre: ${f.name.trim()}`,
    "",
    ...rows,
    "",
    `Total: ${money(total)}`,
    f.delivery === "domicilio" ? `Entrega: a domicilio (${f.address.trim()})` : "Entrega: recoger en tienda",
    `Forma de pago: ${f.pay === "transferencia" ? "transferencia" : "efectivo"}`,
    f.notes.trim() ? `Notas: ${f.notes.trim()}` : null,
    "",
    f.pay === "transferencia"
      ? "¿Me compartes los datos para hacer la transferencia?"
      : "Quedo atento a tu confirmación.",
  ].filter((l) => l !== null).join("\n");
}

const inputCls =
  "w-full rounded-2xl border border-[#F2D6E8] bg-white px-4 py-3 text-base outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20";

function OrderSheet({ detail, total, onClose }) {
  const [f, setF] = useState({ name: "", delivery: "recoger", address: "", pay: "transferencia", notes: "" });
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const ready = f.name.trim() && (f.delivery === "recoger" || f.address.trim());

  const send = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage(f, detail, total))}`;
    window.open(url, "_blank", "noopener");
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-[#2A1038]/50 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Confirmar pedido"
        onClick={(e) => e.stopPropagation()}
        className="rise max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-[2rem] bg-[var(--bg)] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-[2rem]"
      >
        <div className="flex items-center justify-between">
          <h2 className="display text-xl font-bold">Confirma tu pedido</h2>
          <button onClick={onClose} aria-label="Cerrar" className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm"><X size={18} /></button>
        </div>

        <ul className="mt-4 space-y-1.5 rounded-2xl bg-white p-4 text-sm">
          {detail.map((d) => (
            <li key={d.id} className="flex justify-between gap-3">
              <span>{d.name} <span className="text-[var(--soft)]">· {d.qtyLabel}</span></span>
              <span className="font-bold">{money(d.subtotal)}</span>
            </li>
          ))}
          <li className="flex justify-between border-t border-[#F2D6E8] pt-2 text-base font-bold"><span>Total</span><span>{money(total)}</span></li>
        </ul>

        <div className="mt-4 space-y-3">
          <input className={inputCls} placeholder="Tu nombre" value={f.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />
          <div className="flex gap-2" role="group" aria-label="Entrega">
            <Chip active={f.delivery === "recoger"} onClick={() => set("delivery", "recoger")}>Recoger en tienda</Chip>
            <Chip active={f.delivery === "domicilio"} onClick={() => set("delivery", "domicilio")}>A domicilio</Chip>
          </div>
          {f.delivery === "domicilio" && (
            <input className={inputCls} placeholder="Dirección de entrega" value={f.address} onChange={(e) => set("address", e.target.value)} autoComplete="street-address" />
          )}
          <div className="flex gap-2" role="group" aria-label="Forma de pago">
            <Chip active={f.pay === "transferencia"} onClick={() => set("pay", "transferencia")}>Transferencia</Chip>
            <Chip active={f.pay === "efectivo"} onClick={() => set("pay", "efectivo")}>Efectivo</Chip>
          </div>
          <input className={inputCls} placeholder="Notas (opcional)" value={f.notes} onChange={(e) => set("notes", e.target.value)} />
        </div>

        <Btn className="mt-5 w-full disabled:opacity-50" disabled={!ready} onClick={send}>Enviar pedido por WhatsApp</Btn>
        <p className="mt-3 text-center text-sm text-[var(--soft)]">
          {f.pay === "transferencia"
            ? "Te responderemos por WhatsApp con los datos para pagar."
            : "Pagas al recibir tu pedido."}
        </p>
      </div>
    </div>
  );
}

/* 8 · PÁGINA ─────────────────────────────────────────────── */

export default function Dulcenube() {
  const { items, loading, error } = useProducts();
  const [filters, setFilters] = useState({ color: null, flavor: null, kilo: false });
  const [cart, setCart] = useState({}); // { [id]: cantidad }
  const [sheet, setSheet] = useState(false);

  const visible = useMemo(
    () => items.filter((p) =>
      (!filters.color || p.color === filters.color) &&
      (!filters.flavor || p.flavor === filters.flavor) &&
      (!filters.kilo || p.soldBy === "kilo")),
    [items, filters]
  );

  const change = (id, d) =>
    setCart((c) => {
      const next = Math.max(0, +((c[id] ?? 0) + d).toFixed(2));
      const { [id]: _, ...rest } = c;
      return next ? { ...rest, [id]: next } : rest;
    });

  const { total, lines, detail } = useMemo(() => {
    const detail = [];
    for (const [id, q] of Object.entries(cart)) {
      const p = items.find((x) => x.id === +id);
      if (!p) continue;
      detail.push({
        id: p.id,
        name: p.name,
        price: p.price,
        unit: p.soldBy === "kilo" ? "/kg" : " c/u",
        qtyLabel: p.soldBy === "kilo" ? `${q} kg` : `${q} pza`,
        subtotal: p.price * q,
      });
    }
    return { total: detail.reduce((a, d) => a + d.subtotal, 0), lines: detail.length, detail };
  }, [cart, items]);

  const goKilo = () => {
    setFilters({ color: null, flavor: null, kilo: true });
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="dn min-h-screen pb-28">
      <style>{CSS}</style>

      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <a href="#" className="flex items-center gap-3" aria-label={BRAND}>
          <img src={LOGO} alt={BRAND} className="h-20 w-auto drop-shadow-[0_6px_10px_rgba(42,16,56,.18)] sm:h-24" />
        </a>
        <span className="relative grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm" aria-label={`Carrito: ${lines} productos`}>
          <ShoppingBag size={20} />
          {lines > 0 && <span key={lines} className="pop absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--brand)] px-1 text-xs font-bold text-white">{lines}</span>}
        </span>
      </header>

      <Hero onKilo={goKilo} />

      <main id="catalogo" className="mx-auto max-w-6xl scroll-mt-2 px-5">
        <Filters f={filters} set={setFilters} count={visible.length} />

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {loading && <Skeletons />}
          {error && (
            <p className="col-span-full rounded-3xl bg-white p-6 text-center">{error}. Recarga la página para intentar de nuevo.</p>
          )}
          {!loading && !error && visible.map((p) => <ProductCard key={p.id} p={p} qty={cart[p.id] ?? 0} onChange={change} />)}
          {!loading && !error && visible.length === 0 && (
            <div className="col-span-full grid place-items-center gap-3 rounded-[2rem] bg-white p-10 text-center">
              <p className="display text-lg font-bold">No hay dulces con esa mezcla.</p>
              <p className="text-[var(--soft)]">Quita un filtro para ver más opciones.</p>
              <Btn variant="soft" onClick={() => setFilters({ color: null, flavor: null, kilo: false })}><X size={16} /> Limpiar filtros</Btn>
            </div>
          )}
        </div>
      </main>

      <footer className="mx-auto mt-14 flex max-w-6xl flex-col items-center gap-3 px-5 text-center">
        <img src={LOGO} alt={BRAND} className="h-40 w-auto drop-shadow-[0_8px_12px_rgba(42,16,56,.18)] sm:h-48" />
        <p className="text-sm text-[var(--soft)]">{BRAND} · dulces por pieza y por kilo</p>
      </footer>

      {sheet && lines > 0 && <OrderSheet detail={detail} total={total} onClose={() => setSheet(false)} />}

      {lines > 0 && (
        <div className="pop fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-md items-center justify-between rounded-full bg-[var(--brand)] py-2 pl-6 pr-2 text-white shadow-[0_18px_40px_-10px_rgba(194,24,143,.8)]">
            <span className="font-bold">{lines} {lines === 1 ? "producto" : "productos"} · {money(total)}</span>
            <Btn className="py-2.5" onClick={() => setSheet(true)}>Hacer pedido</Btn>
          </div>
        </div>
      )}
    </div>
  );
}
