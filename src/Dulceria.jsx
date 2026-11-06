import { useEffect, useMemo, useRef, useState } from "react";
import { Menu, X, MapPin, Clock, MessageCircle, Phone, ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";

/* ============================================================
   1. CONFIGURACIÓN (cambia aquí tus datos reales)
   Logo: copia logo-deli.png dentro de la carpeta /public
   ============================================================ */
const BRAND = {
  name: "Deli Dulces Típicos",
  logo: "/logo-deli.png",
  whatsapp: "522462961183", // ← número con lada, sin + ni espacios
  phone: "+52 241 000 0000",
  address: "Calle Principal #00, Centro, Zacatelco, Tlaxcala",
  hours: "Lun a Sáb 9:00–19:00 · Dom 10:00–15:00",
  mapsUrl: "https://maps.app.goo.gl/bLhdyAxGYkYFNZJLA",
};

/* Paleta tomada del logo. Clases generadas: bg-mag, tx-mag, etc. */
const PAL = {
  mag: "#BC0A7B", // magenta de la "D": acción principal
  cya: "#40CDEA", // azul turquesa de la "e": acento secundario
  ora: "#FB9140", // naranja de la "l"
  gre: "#7CD256", // verde de la "i"
  gol: "#F6C655", // dorado de la corona
  ink: "#2A1330", // ciruela oscuro: textos y contornos
  cre: "#FFF8EC", // fondo crema
  magS: "#FBE0F0", cyaS: "#DDF6FB", oraS: "#FFE6D2", greS: "#E6F7DA", golS: "#FFF1CB", creS: "#F1EADF",
};
const PAL_CSS = Object.entries(PAL).map(([k, v]) => `.bg-${k}{background:${v}}.tx-${k}{color:${v}}`).join("");

const NAV = [
  { id: "inicio", label: "Inicio" },
  { id: "catalogo", label: "Catálogo" },
  { id: "historia", label: "Nuestra historia" },
  { id: "eventos", label: "Eventos y mayoreo" },
  { id: "contacto", label: "Dónde estamos" },
];

const CATEGORIES = [
  { id: "todas", label: "Todo" },
  { id: "palanquetas", label: "Nuestras palanquetas", blurb: "Crujido de cacahuate y semilla, bañado en miel de piloncillo." },
  { id: "alegrias", label: "Alegrías de la casa", blurb: "Amaranto reventado, ligero y con miel. Dulce de siempre." },
  { id: "tesoros", label: "Tesoros de México", blurb: "Nuestra selección de dulces típicos de todo el país." },
];

// color del dulce → [color del punto, color del fondo de la tarjeta]
const COLORS = {
  dorado: ["gol", "golS"], rosa: ["mag", "magS"], naranja: ["ora", "oraS"],
  verde: ["gre", "greS"], azul: ["cya", "cyaS"], blanco: ["cre", "creS"],
};

/* ============================================================
   2. CAPA DE DATOS — punto de conexión con Odoo
   Cambia el cuerpo de fetchProducts() por tu llamada a un backend/proxy
   que consulte Odoo y devuelva este formato:
   { id, name, category, color, flavor, perKilo, price, unit, emoji, desc, featured }
   Nunca pongas credenciales de Odoo en el frontend.
   ============================================================ */
const MOCK_PRODUCTS = [
  { id: 1, name: "Palanqueta de cacahuate", category: "palanquetas", color: "dorado", flavor: "dulce", perKilo: true, price: 180, unit: "kg", emoji: "🥜", desc: "Cacahuate tostado en miel. Crujiente de principio a fin.", featured: true },
  { id: 2, name: "Palanqueta de semilla de girasol", category: "palanquetas", color: "dorado", flavor: "dulce", perKilo: true, price: 190, unit: "kg", emoji: "🌻", desc: "Semilla dorada y miel oscura." },
  { id: 3, name: "Palanqueta de pepita", category: "palanquetas", color: "verde", flavor: "dulce", perKilo: true, price: 210, unit: "kg", emoji: "🎃", desc: "Pepita verde, tostada al punto." },
  { id: 4, name: "Palanqueta con chile y limón", category: "palanquetas", color: "verde", flavor: "picante", perKilo: false, price: 25, unit: "pza", emoji: "🌶️", desc: "Dulce, ácida y con picor." },
  { id: 5, name: "Alegría de amaranto", category: "alegrias", color: "dorado", flavor: "dulce", perKilo: true, price: 160, unit: "kg", emoji: "🌾", desc: "Amaranto reventado y miel. Ligera, suave y tradicional.", featured: true },
  { id: 6, name: "Alegría con pasas y nuez", category: "alegrias", color: "naranja", flavor: "dulce", perKilo: false, price: 30, unit: "pza", emoji: "🍇", desc: "Pasas jugosas y nuez crujiente." },
  { id: 7, name: "Alegría de chocolate", category: "alegrias", color: "dorado", flavor: "dulce", perKilo: false, price: 32, unit: "pza", emoji: "🍫", desc: "Amaranto con cacao oscuro." },
  { id: 8, name: "Borrachitos", category: "tesoros", color: "rosa", flavor: "dulce", perKilo: true, price: 220, unit: "kg", emoji: "🍬", desc: "Dulce de leche con un toque de licor." },
  { id: 9, name: "Cocadas", category: "tesoros", color: "blanco", flavor: "dulce", perKilo: false, price: 18, unit: "pza", emoji: "🥥", desc: "Coco rallado, horneado dorado.", featured: true },
  { id: 10, name: "Camote poblano", category: "tesoros", color: "naranja", flavor: "dulce", perKilo: false, price: 22, unit: "pza", emoji: "🍠", desc: "Camote en barra, con fruta." },
  { id: 11, name: "Ate de tejocote", category: "tesoros", color: "rosa", flavor: "ácido", perKilo: true, price: 170, unit: "kg", emoji: "🍎", desc: "Fruta en pasta, un poco ácida." },
  { id: 12, name: "Obleas con cajeta", category: "tesoros", color: "azul", flavor: "dulce", perKilo: false, price: 15, unit: "pza", emoji: "🥞", desc: "Oblea fina y cajeta cremosa." },
  { id: 13, name: "Tamarindo enchilado", category: "tesoros", color: "naranja", flavor: "picante", perKilo: true, price: 150, unit: "kg", emoji: "🌶️", desc: "Tamarindo, chile y sal. Ácido y picante." },
];

async function fetchProducts() {
  // TODO(Odoo): const res = await fetch("/api/products"); return res.json();
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_PRODUCTS), 350));
}

function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let alive = true;
    fetchProducts()
      .then((d) => alive && setProducts(d))
      .catch(() => alive && setError(true))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);
  return { products, loading, error };
}

/* ============================================================
   3. CARRITO: { [productId]: cantidad }. Productos por kilo suben de 0.5 en 0.5
   ============================================================ */
const stepOf = (p) => (p.unit === "kg" ? 0.5 : 1);
const fmtQty = (p, q) => `${q.toLocaleString("es-MX")} ${p.unit}`;
const money = (n) => `$${n.toLocaleString("es-MX")}`;
const wa = (text) => `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(text)}`;

function useCart(products) {
  const [cart, setCart] = useState({});
  const change = (p, dir) =>
    setCart((c) => {
      const q = Math.round(((c[p.id] || 0) + dir * stepOf(p)) * 100) / 100;
      const next = { ...c };
      if (q <= 0) delete next[p.id]; else next[p.id] = q;
      return next;
    });
  const clear = () => setCart({});
  const items = products.filter((p) => cart[p.id]).map((p) => ({ p, qty: cart[p.id] }));
  const total = items.reduce((s, { p, qty }) => s + p.price * qty, 0);
  return { cart, change, clear, items, total };
}

function orderMessage(items, total, name, delivery) {
  const lines = items.map(({ p, qty }) => `• ${fmtQty(p, qty)} ${p.name} — ${money(p.price * qty)}`);
  return [
    `Hola, quiero hacer un pedido en ${BRAND.name}:`,
    "",
    ...lines,
    "",
    `Total: ${money(total)}`,
    name ? `Nombre: ${name}` : null,
    `Entrega: ${delivery}`,
    "",
    "Por favor confírmame disponibilidad, el total final y los datos para el pago.",
  ].filter((l) => l !== null).join("\n");
}

/* ============================================================
   4. COMPONENTES
   ============================================================ */
function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap');
      .font-dulce { font-family: 'Fredoka', 'Nunito', ui-rounded, system-ui, sans-serif; }
      ${PAL_CSS}
      .sh { box-shadow: 0 14px 34px -12px rgba(42,19,48,.22); }
      .pop { border: 2.5px solid ${PAL.ink}; box-shadow: 0 4px 0 ${PAL.ink}; transition: transform .1s, box-shadow .1s; }
      .pop:active { transform: translateY(3px); box-shadow: 0 1px 0 ${PAL.ink}; }
      @keyframes flotar { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
      @keyframes entrada { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }
      @keyframes subir { from { transform: translateY(100%) } to { transform: none } }
      @keyframes marquee { to { transform: translateX(-50%) } }
      .flotar { animation: flotar 5s ease-in-out infinite; }
      .entrada { animation: entrada .6s ease-out both; }
      .subir { animation: subir .3s ease-out both; }
      .marquee { animation: marquee 28s linear infinite; }
      @media (prefers-reduced-motion: reduce) { .flotar, .entrada, .subir, .marquee { animation: none !important; } }
    `}</style>
  );
}

function Header({ count, openCart }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 px-3 pt-3">
      <nav className="sh mx-auto flex max-w-6xl items-center justify-between rounded-full bg-white/95 px-4 py-1 backdrop-blur">
        <a href="#inicio" aria-label={BRAND.name}>
          <img src={BRAND.logo} alt={BRAND.name} className="h-14 w-auto sm:h-20" />
        </a>
        <ul className="hidden gap-6 lg:flex">
          {NAV.map((n) => (
            <li key={n.id}><a href={`#${n.id}`} className="font-dulce text-sm font-medium text-stone-600 hover:text-[#BC0A7B]">{n.label}</a></li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <button onClick={openCart} aria-label={`Abrir carrito, ${count} productos`} className="pop bg-gol tx-ink relative rounded-full p-3">
            <ShoppingCart size={20} />
            {count > 0 && <span className="bg-mag absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white font-dulce text-xs font-bold text-white">{count}</span>}
          </button>
          <button aria-label="Abrir menú" onClick={() => setOpen(!open)} className="tx-ink rounded-full p-2 lg:hidden">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-3xl bg-white p-4 shadow-xl lg:hidden">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 font-dulce font-medium text-stone-700 active:bg-pink-50">{n.label}</a>
          ))}
        </div>
      )}
    </header>
  );
}

/* Palanqueta en SVG: gira siguiendo el cursor / dedo */
function SpinningCandy() {
  const ref = useRef(null);
  const [rot, setRot] = useState({ z: -8, x: 0, y: 0 });
  const [hover, setHover] = useState(false);
  const move = (e) => {
    const r = ref.current.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const py = ((e.clientY - r.top) / r.height - 0.5) * 2;
    setRot({ z: px * 40, x: -py * 16, y: px * 16 });
  };
  const nuts = [[70,80],[120,60],[160,95],[95,125],[140,140],[60,150],[185,150],[110,185],[165,190],[75,200],[130,100]];
  return (
    <div ref={ref} onMouseMove={move} onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setRot({ z: -8, x: 0, y: 0 }); }}
      className="flotar relative mx-auto aspect-square w-64 cursor-pointer sm:w-80" style={{ perspective: 800 }}
      role="img" aria-label="Palanqueta de cacahuate girando">
      <div className="absolute inset-0 rounded-full opacity-70 blur-2xl" style={{ background: `conic-gradient(${PAL.mag}, ${PAL.cya}, ${PAL.gre}, ${PAL.gol}, ${PAL.mag})` }} />
      <svg viewBox="0 0 250 260" className="relative h-full w-full drop-shadow-2xl"
        style={{ transform: `rotateZ(${rot.z}deg) rotateX(${rot.x}deg) rotateY(${rot.y}deg) scale(${hover ? 1.08 : 1})`, transition: "transform .35s cubic-bezier(.2,.8,.2,1)" }}>
        <circle cx="125" cy="130" r="112" fill={PAL.ink} />
        <circle cx="125" cy="130" r="106" fill="#E39A2D" />
        <circle cx="125" cy="130" r="98" fill={PAL.gol} />
        {nuts.map(([x, y], i) => (
          <g key={i} transform={`rotate(${i * 37} ${x} ${y})`}>
            <ellipse cx={x} cy={y} rx="17" ry="11" fill="#A9631F" />
            <ellipse cx={x - 2} cy={y - 2} rx="13" ry="7" fill="#E0A55A" />
          </g>
        ))}
      </svg>
    </div>
  );
}

function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden px-4 pb-10 pt-8 sm:pt-14">
      <div className="bg-magS absolute -left-16 top-10 h-52 w-52 rounded-full blur-3xl" />
      <div className="bg-cyaS absolute -right-10 bottom-0 h-60 w-60 rounded-full blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2">
        <div className="entrada text-center md:text-left">
          <p className="bg-golS tx-ink mb-3 inline-block rounded-full px-4 py-1 font-dulce text-sm font-medium">Hechas a mano, como siempre</p>
          <h1 className="tx-ink font-dulce text-4xl font-bold leading-tight sm:text-6xl">El crujido de la tradición, en cada bocado.</h1>
          <p className="mx-auto mt-4 max-w-md font-dulce text-lg text-stone-600 md:mx-0">
            Somos productores de palanquetas y alegrías de amaranto. Miel, semillas y recetas de familia. Además, una selección de los mejores dulces típicos de México.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <a href="#catalogo" className="pop bg-mag rounded-full px-7 py-4 text-center font-dulce text-lg font-semibold text-white">Ver catálogo</a>
            <a href={wa("Hola, quiero cotizar un pedido para evento o mayoreo")} className="pop bg-cya tx-ink rounded-full px-7 py-4 text-center font-dulce text-lg font-semibold">Cotizar para mi evento</a>
          </div>
        </div>
        <SpinningCandy />
      </div>
    </section>
  );
}

function Marquee() {
  const items = ["Envío a Toda la Republica Mexicana", "Metodos de Pago Seguro", "Envíos Expres", "Descuento en Compras Mayores a $2500.00", "Atención Inmediata"];
  const dots = ["tx-gol", "tx-cya", "tx-gre", "tx-ora"];
  return (
    <div className="bg-ink overflow-hidden py-3" aria-hidden="true">
      <div className="marquee flex w-max gap-8 font-dulce text-lg font-medium text-white">
        {[...items, ...items].map((t, i) => (<span key={i} className="whitespace-nowrap">{t} <b className={dots[i % 4]}>✦</b></span>))}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick} aria-pressed={active}
      className={`whitespace-nowrap rounded-full px-4 py-2 font-dulce text-sm font-medium transition active:scale-95 ${active ? "bg-mag text-white" : "bg-white text-stone-600 shadow-sm"}`}>
      {children}
    </button>
  );
}

function ProductCard({ p, qty, change }) {
  const [dot, tint] = COLORS[p.color];
  return (
    <article className={`sh flex flex-col justify-between rounded-[2rem] bg-white p-4 ${p.featured ? "col-span-2" : ""}`}>
      <div className={`bg-${tint} relative flex items-center justify-center rounded-[1.5rem] ${p.featured ? "h-40 text-6xl" : "h-28 text-5xl"}`}>
        <span>{p.emoji}</span>
        {p.perKilo && <span className="tx-ink absolute left-3 top-3 rounded-full bg-white px-2 py-0.5 font-dulce text-xs font-medium">Por kilo</span>}
      </div>
      <div className="mt-3">
        <h3 className="font-dulce text-base font-semibold leading-tight text-stone-800">{p.name}</h3>
        <p className="mt-1 text-sm text-stone-500">{p.desc}</p>
      </div>
      <p className="tx-mag mt-3 font-dulce text-lg font-bold">{money(p.price)}<span className="text-xs font-normal text-stone-400"> /{p.unit}</span></p>
      {qty ? (
        <div className="bg-golS mt-2 flex items-center justify-between rounded-full p-1">
          <button onClick={() => change(p, -1)} aria-label={`Quitar ${p.name}`} className="rounded-full bg-white p-2 active:scale-90"><Minus size={16} /></button>
          <span className="tx-ink font-dulce text-sm font-semibold">{fmtQty(p, qty)}</span>
          <button onClick={() => change(p, 1)} aria-label={`Agregar más ${p.name}`} className="bg-mag rounded-full p-2 text-white active:scale-90"><Plus size={16} /></button>
        </div>
      ) : (
        <button onClick={() => change(p, 1)} className="pop bg-mag mt-2 flex items-center justify-center gap-2 rounded-full px-3 py-2 font-dulce text-sm font-semibold text-white">
          <ShoppingCart size={16} />Agregar al carrito
        </button>
      )}
    </article>
  );
}

function Catalog({ data, cartApi }) {
  const { products, loading, error } = data;
  const [cat, setCat] = useState("todas");
  const [color, setColor] = useState("todos");
  const [flavor, setFlavor] = useState("todos");
  const [onlyKilo, setOnlyKilo] = useState(false);
  const list = useMemo(
    () => products.filter((p) => (cat === "todas" || p.category === cat) && (color === "todos" || p.color === color) && (flavor === "todos" || p.flavor === flavor) && (!onlyKilo || p.perKilo)),
    [products, cat, color, flavor, onlyKilo]
  );
  const active = CATEGORIES.find((c) => c.id === cat);
  const reset = () => { setCat("todas"); setColor("todos"); setFlavor("todos"); setOnlyKilo(false); };

  return (
    <section id="catalogo" className="mx-auto max-w-6xl px-4 py-14">
      <h2 className="tx-ink font-dulce text-3xl font-bold sm:text-4xl">Elige tu dulce</h2>
      <p className="mt-2 font-dulce text-stone-600">{active.blurb || "Palanquetas, alegrías y tesoros de México."}</p>

      <div className="bg-cre/90 sticky top-24 z-30 -mx-4 mt-6 space-y-2 px-4 py-3 backdrop-blur md:top-28" style={{ background: "rgba(255,248,236,.92)" }}>
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Categoría">
          {CATEGORIES.map((c) => <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>{c.label}</Chip>)}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Buscar por color">
          <span className="self-center pr-1 font-dulce text-sm text-stone-500">Color</span>
          {["todos", ...Object.keys(COLORS)].map((c) => (
            <button key={c} onClick={() => setColor(c)} aria-pressed={color === c}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 font-dulce text-sm capitalize ${color === c ? "bg-mag text-white" : "bg-white text-stone-600"}`}>
              {c !== "todos" && <span className={`bg-${COLORS[c][0]} h-3 w-3 rounded-full border border-black/25`} />}{c}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Buscar por sabor">
          <span className="self-center pr-1 font-dulce text-sm text-stone-500">Sabor</span>
          {["todos", "dulce", "ácido", "picante"].map((f) => <Chip key={f} active={flavor === f} onClick={() => setFlavor(f)}><span className="capitalize">{f}</span></Chip>)}
          <Chip active={onlyKilo} onClick={() => setOnlyKilo(!onlyKilo)}>Dulces por kilo</Chip>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="bg-magS h-72 animate-pulse rounded-[2rem]" />)}
        </div>
      ) : error ? (
        <p className="mt-8 rounded-3xl bg-white p-6 text-center font-dulce text-stone-600">No pudimos cargar el catálogo. Intenta de nuevo o <a className="tx-mag font-semibold underline" href={wa("Hola, quiero ver el catálogo")}>pídelo por WhatsApp</a>.</p>
      ) : list.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-white p-6 text-center font-dulce text-stone-600">
          <p>No hay dulces con esa combinación.</p>
          <button onClick={reset} className="pop bg-mag mt-3 rounded-full px-5 py-2 font-semibold text-white">Quitar filtros</button>
        </div>
      ) : (
        <div className="mt-6 grid grid-flow-dense grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {list.map((p) => <ProductCard key={p.id} p={p} qty={cartApi.cart[p.id]} change={cartApi.change} />)}
        </div>
      )}
    </section>
  );
}

function CartDrawer({ cartApi, onClose }) {
  const { items, total, change, clear } = cartApi;
  const [name, setName] = useState("");
  const [delivery, setDelivery] = useState("Recoger en tienda");
  const link = wa(orderMessage(items, total, name.trim(), delivery));
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:justify-end sm:p-4" onClick={onClose}>
      <div role="dialog" aria-label="Tu pedido" onClick={(e) => e.stopPropagation()}
        className="subir max-h-[88vh] w-full overflow-y-auto rounded-t-[2rem] bg-white p-5 sm:max-w-md sm:rounded-[2rem]">
        <div className="flex items-center justify-between">
          <h2 className="tx-ink font-dulce text-2xl font-bold">Tu pedido</h2>
          <button onClick={onClose} aria-label="Cerrar carrito" className="rounded-full bg-stone-100 p-2"><X size={20} /></button>
        </div>

        {items.length === 0 ? (
          <div className="py-10 text-center font-dulce text-stone-600">
            <p>Tu carrito está vacío.</p>
            <a href="#catalogo" onClick={onClose} className="pop bg-mag mt-4 inline-block rounded-full px-6 py-3 font-semibold text-white">Ver catálogo</a>
          </div>
        ) : (
          <>
            <ul className="mt-4 space-y-3">
              {items.map(({ p, qty }) => (
                <li key={p.id} className="bg-creS flex items-center gap-3 rounded-2xl p-3">
                  <span className="text-3xl">{p.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-dulce text-sm font-semibold leading-tight text-stone-800">{p.name}</p>
                    <p className="tx-mag font-dulce text-sm font-bold">{money(p.price * qty)}</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-white p-1">
                    <button onClick={() => change(p, -1)} aria-label="Quitar uno" className="rounded-full p-1.5 active:scale-90"><Minus size={14} /></button>
                    <span className="min-w-12 text-center font-dulce text-xs font-semibold">{fmtQty(p, qty)}</span>
                    <button onClick={() => change(p, 1)} aria-label="Agregar uno" className="rounded-full p-1.5 active:scale-90"><Plus size={14} /></button>
                  </div>
                </li>
              ))}
            </ul>

            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre"
              className="mt-4 w-full rounded-2xl border-2 border-stone-200 px-4 py-3 font-dulce outline-none focus:border-[#BC0A7B]" />
            <div className="mt-3 flex gap-2" role="group" aria-label="Tipo de entrega">
              {["Recoger en tienda", "Envío a domicilio"].map((d) => (
                <button key={d} onClick={() => setDelivery(d)} aria-pressed={delivery === d}
                  className={`flex-1 rounded-full px-3 py-2 font-dulce text-sm font-medium ${delivery === d ? "bg-cya tx-ink pop" : "bg-stone-100 text-stone-600"}`}>{d}</button>
              ))}
            </div>
            {delivery === "Envío a domicilio" && <p className="mt-2 font-dulce text-xs text-stone-500">El costo de envío se confirma por WhatsApp.</p>}

            <div className="mt-5 flex items-center justify-between font-dulce">
              <span className="text-stone-600">Total de productos</span>
              <span className="tx-ink text-2xl font-bold">{money(total)}</span>
            </div>
            <a href={link} target="_blank" rel="noreferrer"
              className="pop bg-gre tx-ink mt-4 flex items-center justify-center gap-2 rounded-full px-6 py-4 font-dulce text-lg font-bold">
              <MessageCircle size={22} />Hacer pedido por WhatsApp
            </a>
            <p className="mt-3 text-center font-dulce text-xs text-stone-500">Te confirmamos disponibilidad y te compartimos los datos de pago por el mismo chat.</p>
            <button onClick={clear} className="mx-auto mt-3 flex items-center gap-1 font-dulce text-sm text-stone-500 underline"><Trash2 size={14} />Vaciar carrito</button>
          </>
        )}
      </div>
    </div>
  );
}

function CartBar({ count, total, onOpen }) {
  if (!count) return null;
  return (
    <div className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-md">
      <button onClick={onOpen} className="pop bg-mag flex w-full items-center justify-between rounded-full px-5 py-3 font-dulce font-semibold text-white">
        <span className="flex items-center gap-2"><ShoppingCart size={20} />Ver carrito ({count})</span>
        <span>{money(total)}</span>
      </button>
    </div>
  );
}

function Story() {
  const steps = [
    { t: "La miel", d: "Cocemos el piloncillo hasta que huele a fiesta.", c: "tx-mag" },
    { t: "Las semillas", d: "Tostamos cacahuate, girasol y amaranto a mano.", c: "tx-ora" },
    { t: "El punto", d: "Mezclamos y extendemos antes de que enfríe.", c: "tx-ink" },
    { t: "El corte", d: "Cada pieza se corta y se empaca con cariño.", c: "tx-mag" },
  ];
  return (
    <section id="historia" className="bg-golS px-4 py-16">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
        <div>
          <h2 className="tx-ink font-dulce text-3xl font-bold sm:text-4xl">Dulce herencia, hecha a mano.</h2>
          <p className="mt-4 max-w-lg font-dulce text-lg text-stone-700">
            Todo empezó en la cocina de la familia: una cazuela grande, miel de piloncillo y manos que sabían cuándo era el momento exacto. Hoy seguimos igual. Sin prisas, sin atajos y con el mismo crujido que recordamos de niños.
          </p>
          <p className="mt-3 max-w-lg font-dulce text-lg text-stone-700">Cada palanqueta y cada alegría lleva tiempo, paciencia y mucho cariño.</p>
        </div>
        <ol className="grid grid-cols-2 gap-3">
          {steps.map((s, i) => (
            <li key={s.t} className={`sh rounded-[2rem] bg-white p-5 ${i % 2 ? "mt-6" : ""}`}>
              <h3 className={`${s.c} font-dulce text-lg font-semibold`}>{s.t}</h3>
              <p className="mt-1 text-sm text-stone-600">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Events() {
  return (
    <section id="eventos" className="mx-auto max-w-6xl px-4 py-14">
      <div className="bg-cya tx-ink rounded-[2.5rem] p-8 text-center sm:p-12">
        <h2 className="font-dulce text-3xl font-bold">Dulces para tu fiesta</h2>
        <p className="mx-auto mt-3 max-w-xl font-dulce text-lg">Bodas, bautizos, fiestas patrias y mesas de dulces. Armamos tu pedido por mayoreo, con empaque para regalo.</p>
        <a href={wa("Hola, quiero cotizar dulces para un evento")} className="pop bg-mag mt-6 inline-block rounded-full px-7 py-4 font-dulce text-lg font-semibold text-white">Cotizar mi evento</a>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contacto" className="mx-auto max-w-6xl px-4 pb-24">
      <h2 className="tx-ink font-dulce text-3xl font-bold sm:text-4xl">Ven a probarlos</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="sh space-y-4 rounded-[2rem] bg-white p-6">
          <p className="flex gap-3 font-dulce text-stone-700"><MapPin className="tx-mag shrink-0" />{BRAND.address}</p>
          <p className="flex gap-3 font-dulce text-stone-700"><Clock className="tx-mag shrink-0" />{BRAND.hours}</p>
          <p className="flex gap-3 font-dulce text-stone-700"><Phone className="tx-mag shrink-0" />{BRAND.phone}</p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <a href={wa("Hola, tengo una duda")} className="pop bg-gre tx-ink flex items-center justify-center gap-2 rounded-full px-6 py-3 font-dulce font-semibold"><MessageCircle size={18} />Escríbenos</a>
            <a href={BRAND.mapsUrl} className="pop bg-cya tx-ink rounded-full px-6 py-3 text-center font-dulce font-semibold">Cómo llegar</a>
          </div>
        </div>
        <div className="bg-cyaS tx-ink flex min-h-48 items-center justify-center rounded-[2rem] p-6 text-center font-dulce">
          {/* Reemplaza este bloque por un <iframe> de Google Maps */}
          Aquí va tu mapa
        </div>
      </div>
    </section>
  );
}

export default function Dulceria() {
  const data = useProducts();
  const cartApi = useCart(data.products);
  const [cartOpen, setCartOpen] = useState(false);
  const count = cartApi.items.length;
  return (
    <div className="bg-cre tx-ink min-h-screen antialiased" style={{ scrollBehavior: "smooth" }}>
      <Styles />
      <Header count={count} openCart={() => setCartOpen(true)} />
      <main>
        <Hero />
        <Marquee />
        <Catalog data={data} cartApi={cartApi} />
        <Story />
        <Events />
        <Contact />
      </main>
      <footer className="bg-ink px-4 py-8 text-center font-dulce text-sm text-white/80">
        <img src={BRAND.logo} alt={BRAND.name} className="mx-auto mb-3 h-20 w-auto" />
        © {new Date().getFullYear()} {BRAND.name}. Hecho en México, con amor y miel.
      </footer>
      {!cartOpen && <CartBar count={count} total={cartApi.total} onOpen={() => setCartOpen(true)} />}
      {cartOpen && <CartDrawer cartApi={cartApi} onClose={() => setCartOpen(false)} />}
    </div>
  );
}
