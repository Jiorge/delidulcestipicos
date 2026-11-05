import { useEffect, useMemo, useRef, useState } from "react";
import { Menu, X, MapPin, Clock, MessageCircle, Phone } from "lucide-react";

/* ============================================================
   1. CONFIGURACIÓN (cambia aquí tus datos reales)
   ============================================================ */
const BRAND = {
  name: "Dulcería La Herencia", // ← reemplaza por tu nombre
  whatsapp: "522410000000", // ← número con lada, sin + ni espacios
  phone: "+52 241 000 0000",
  address: "Calle Principal #00, Centro, Zacatelco, Tlaxcala",
  hours: "Lun a Sáb 9:00–19:00 · Dom 10:00–15:00",
  mapsUrl: "https://maps.google.com/?q=Zacatelco,Tlaxcala",
};

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

const COLORS = {
  dorado: "bg-amber-300",
  rosa: "bg-pink-300",
  morado: "bg-violet-400",
  azul: "bg-sky-300",
  blanco: "bg-stone-100 border border-stone-300",
};

/* ============================================================
   2. CAPA DE DATOS — punto de conexión con Odoo
   Hoy devuelve datos de ejemplo. Después sustituye el cuerpo de
   fetchProducts() por una llamada a tu backend/proxy que consulte
   Odoo (JSON-RPC o REST) y mapee cada product.template a este formato:
   { id, name, category, color, flavor, perKilo, price, unit, emoji, desc, featured }
   Nunca pongas credenciales de Odoo en el frontend: usa un proxy.
   ============================================================ */
const MOCK_PRODUCTS = [
  { id: 1, name: "Palanqueta de cacahuate", category: "palanquetas", color: "dorado", flavor: "dulce", perKilo: true, price: 180, unit: "kg", emoji: "🥜", desc: "Cacahuate tostado en miel. Crujiente de principio a fin.", featured: true },
  { id: 2, name: "Palanqueta de semilla de girasol", category: "palanquetas", color: "dorado", flavor: "dulce", perKilo: true, price: 190, unit: "kg", emoji: "🌻", desc: "Semilla dorada y miel oscura." },
  { id: 3, name: "Palanqueta de pepita", category: "palanquetas", color: "azul", flavor: "dulce", perKilo: true, price: 210, unit: "kg", emoji: "🎃", desc: "Pepita verde, tostada al punto." },
  { id: 4, name: "Palanqueta con chile y limón", category: "palanquetas", color: "rosa", flavor: "picante", perKilo: false, price: 25, unit: "pza", emoji: "🌶️", desc: "Dulce, ácida y con picor." },
  { id: 5, name: "Alegría de amaranto", category: "alegrias", color: "dorado", flavor: "dulce", perKilo: true, price: 160, unit: "kg", emoji: "🌾", desc: "Amaranto reventado y miel. Ligera, suave y tradicional.", featured: true },
  { id: 6, name: "Alegría con pasas y nuez", category: "alegrias", color: "morado", flavor: "dulce", perKilo: false, price: 30, unit: "pza", emoji: "🍇", desc: "Pasas jugosas y nuez crujiente." },
  { id: 7, name: "Alegría de chocolate", category: "alegrias", color: "morado", flavor: "dulce", perKilo: false, price: 32, unit: "pza", emoji: "🍫", desc: "Amaranto con cacao oscuro." },
  { id: 8, name: "Borrachitos", category: "tesoros", color: "rosa", flavor: "dulce", perKilo: true, price: 220, unit: "kg", emoji: "🍬", desc: "Dulce de leche con un toque de licor." },
  { id: 9, name: "Cocadas", category: "tesoros", color: "blanco", flavor: "dulce", perKilo: false, price: 18, unit: "pza", emoji: "🥥", desc: "Coco rallado, horneado dorado.", featured: true },
  { id: 10, name: "Camote poblano", category: "tesoros", color: "morado", flavor: "dulce", perKilo: false, price: 22, unit: "pza", emoji: "🍠", desc: "Camote en barra, con fruta." },
  { id: 11, name: "Ate de tejocote", category: "tesoros", color: "rosa", flavor: "ácido", perKilo: true, price: 170, unit: "kg", emoji: "🍎", desc: "Fruta en pasta, un poco ácida." },
  { id: 12, name: "Obleas con cajeta", category: "tesoros", color: "azul", flavor: "dulce", perKilo: false, price: 15, unit: "pza", emoji: "🥞", desc: "Oblea fina y cajeta cremosa." },
  { id: 13, name: "Tamarindo enchilado", category: "tesoros", color: "rosa", flavor: "picante", perKilo: true, price: 150, unit: "kg", emoji: "🌶️", desc: "Tamarindo, chile y sal. Ácido y picante." },
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

const wa = (text) => `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(text)}`;
const money = (n) => `$${n.toLocaleString("es-MX")}`;

/* ============================================================
   3. COMPONENTES
   ============================================================ */
function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap');
      .font-dulce { font-family: 'Fredoka', 'Nunito', ui-rounded, system-ui, sans-serif; }
      @keyframes flotar { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
      @keyframes entrada { from { opacity: 0; transform: translateY(14px) scale(.98) } to { opacity: 1; transform: none } }
      @keyframes marquee { to { transform: translateX(-50%) } }
      .flotar { animation: flotar 5s ease-in-out infinite; }
      .entrada { animation: entrada .6s ease-out both; }
      .marquee { animation: marquee 28s linear infinite; }
      @media (prefers-reduced-motion: reduce) {
        .flotar, .entrada, .marquee { animation: none !important; }
      }
    `}</style>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 px-3 pt-3">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full bg-white/80 px-5 py-3 shadow-lg shadow-violet-200/40 backdrop-blur">
        <a href="#inicio" className="font-dulce text-lg font-bold text-violet-700">{BRAND.name}</a>
        <ul className="hidden gap-6 md:flex">
          {NAV.map((n) => (
            <li key={n.id}><a href={`#${n.id}`} className="font-dulce text-sm font-medium text-stone-600 hover:text-pink-500">{n.label}</a></li>
          ))}
        </ul>
        <a href={wa("Hola, quiero hacer un pedido")} className="hidden rounded-full bg-pink-400 px-4 py-2 font-dulce text-sm font-semibold text-white hover:bg-pink-500 md:block">Pedir por WhatsApp</a>
        <button aria-label="Abrir menú" onClick={() => setOpen(!open)} className="rounded-full p-2 text-violet-700 md:hidden">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>
      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-3xl bg-white p-4 shadow-xl md:hidden">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 font-dulce font-medium text-stone-700 active:bg-pink-50">{n.label}</a>
          ))}
        </div>
      )}
    </header>
  );
}

/* Palanqueta ilustrada en SVG: gira siguiendo el cursor / dedo */
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
    <div
      ref={ref}
      onMouseMove={move}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setRot({ z: -8, x: 0, y: 0 }); }}
      className="flotar relative mx-auto aspect-square w-64 cursor-pointer sm:w-80"
      style={{ perspective: 800 }}
      role="img"
      aria-label="Palanqueta de cacahuate girando"
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-300 via-violet-300 to-sky-300 opacity-60 blur-2xl" />
      <svg
        viewBox="0 0 250 260"
        className="relative h-full w-full drop-shadow-2xl"
        style={{
          transform: `rotateZ(${rot.z}deg) rotateX(${rot.x}deg) rotateY(${rot.y}deg) scale(${hover ? 1.08 : 1})`,
          transition: "transform .35s cubic-bezier(.2,.8,.2,1)",
        }}
      >
        <circle cx="125" cy="130" r="112" fill="#C98B2B" />
        <circle cx="125" cy="130" r="104" fill="#F2B84B" />
        <circle cx="125" cy="130" r="92" fill="#F7CD73" opacity=".7" />
        {nuts.map(([x, y], i) => (
          <g key={i} transform={`rotate(${i * 37} ${x} ${y})`}>
            <ellipse cx={x} cy={y} rx="17" ry="11" fill="#B8742A" />
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
      <div className="absolute -left-16 top-10 h-52 w-52 rounded-full bg-pink-200/70 blur-3xl" />
      <div className="absolute -right-10 bottom-0 h-60 w-60 rounded-full bg-sky-200/80 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2">
        <div className="entrada text-center md:text-left">
          <p className="mb-3 inline-block rounded-full bg-violet-100 px-4 py-1 font-dulce text-sm font-medium text-violet-700">Hechas a mano, como siempre</p>
          <h1 className="font-dulce text-4xl font-bold leading-tight text-violet-800 sm:text-6xl">
            El crujido de la tradición, en cada bocado.
          </h1>
          <p className="mx-auto mt-4 max-w-md font-dulce text-lg text-stone-600 md:mx-0">
            Somos productores de palanquetas y alegrías de amaranto. Miel, semillas y recetas de familia. Además, una selección de los mejores dulces típicos de México.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <a href="#catalogo" className="rounded-full bg-pink-400 px-7 py-4 text-center font-dulce text-lg font-semibold text-white shadow-lg shadow-pink-300/60 active:scale-95 hover:bg-pink-500">Ver catálogo</a>
            <a href={wa("Hola, quiero cotizar un pedido para evento o mayoreo")} className="rounded-full bg-white px-7 py-4 text-center font-dulce text-lg font-semibold text-violet-700 shadow-lg shadow-violet-200/60 active:scale-95">Cotizar para mi evento</a>
          </div>
        </div>
        <SpinningCandy />
      </div>
    </section>
  );
}

function Marquee() {
  const items = ["Palanquetas", "Alegrías", "Cocadas", "Borrachitos", "Camotes", "Ate", "Obleas con cajeta", "Dulces por kilo"];
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden bg-violet-600 py-3" aria-hidden="true">
      <div className="marquee flex w-max gap-8 font-dulce text-lg font-medium text-white">
        {row.map((t, i) => (<span key={i} className="whitespace-nowrap">{t} ✦</span>))}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`whitespace-nowrap rounded-full px-4 py-2 font-dulce text-sm font-medium transition active:scale-95 ${active ? "bg-violet-600 text-white shadow-md shadow-violet-300" : "bg-white text-stone-600 shadow-sm"}`}
    >
      {children}
    </button>
  );
}

function ProductCard({ p }) {
  return (
    <article className={`group flex flex-col justify-between rounded-[2rem] bg-white p-4 shadow-xl shadow-violet-200/40 transition hover:-translate-y-1 ${p.featured ? "col-span-2" : ""}`}>
      <div className={`relative flex items-center justify-center rounded-[1.5rem] ${p.featured ? "h-40" : "h-28"} ${p.color === "dorado" ? "bg-amber-100" : p.color === "rosa" ? "bg-pink-100" : p.color === "morado" ? "bg-violet-100" : p.color === "azul" ? "bg-sky-100" : "bg-stone-100"}`}>
        <span className={`transition duration-300 group-hover:rotate-12 group-hover:scale-110 ${p.featured ? "text-6xl" : "text-5xl"}`}>{p.emoji}</span>
        {p.perKilo && <span className="absolute left-3 top-3 rounded-full bg-white px-2 py-0.5 font-dulce text-xs font-medium text-violet-700">Por kilo</span>}
      </div>
      <div className="mt-3">
        <h3 className="font-dulce text-base font-semibold leading-tight text-stone-800">{p.name}</h3>
        <p className="mt-1 text-sm text-stone-500">{p.desc}</p>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-dulce text-lg font-bold text-violet-700">{money(p.price)}<span className="text-xs font-normal text-stone-400"> /{p.unit}</span></span>
        <a href={wa(`Hola, quiero pedir: ${p.name}`)} className="rounded-full bg-pink-400 px-3 py-2 font-dulce text-sm font-semibold text-white active:scale-95">Pedir</a>
      </div>
    </article>
  );
}

function Catalog() {
  const { products, loading, error } = useProducts();
  const [cat, setCat] = useState("todas");
  const [color, setColor] = useState("todos");
  const [flavor, setFlavor] = useState("todos");
  const [onlyKilo, setOnlyKilo] = useState(false);

  const list = useMemo(
    () => products.filter((p) =>
      (cat === "todas" || p.category === cat) &&
      (color === "todos" || p.color === color) &&
      (flavor === "todos" || p.flavor === flavor) &&
      (!onlyKilo || p.perKilo)),
    [products, cat, color, flavor, onlyKilo]
  );
  const active = CATEGORIES.find((c) => c.id === cat);
  const reset = () => { setCat("todas"); setColor("todos"); setFlavor("todos"); setOnlyKilo(false); };

  return (
    <section id="catalogo" className="mx-auto max-w-6xl px-4 py-14">
      <h2 className="font-dulce text-3xl font-bold text-violet-800 sm:text-4xl">Elige tu dulce</h2>
      <p className="mt-2 font-dulce text-stone-600">{active.blurb || "Palanquetas, alegrías y tesoros de México."}</p>

      <div className="sticky top-20 z-30 -mx-4 mt-6 space-y-2 bg-[#FFF9F3]/90 px-4 py-3 backdrop-blur">
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Categoría">
          {CATEGORIES.map((c) => <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>{c.label}</Chip>)}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Buscar por color">
          <span className="self-center pr-1 font-dulce text-sm text-stone-500">Color</span>
          {["todos", ...Object.keys(COLORS)].map((c) => (
            <button key={c} onClick={() => setColor(c)} aria-pressed={color === c} aria-label={`Color ${c}`}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 font-dulce text-sm capitalize ${color === c ? "bg-violet-600 text-white" : "bg-white text-stone-600"}`}>
              {c !== "todos" && <span className={`h-3 w-3 rounded-full ${COLORS[c]}`} />}{c}
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
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-60 animate-pulse rounded-[2rem] bg-pink-100" />)}
        </div>
      ) : error ? (
        <p className="mt-8 rounded-3xl bg-white p-6 text-center font-dulce text-stone-600">No pudimos cargar el catálogo. Intenta de nuevo en un momento o <a className="font-semibold text-pink-500 underline" href={wa("Hola, quiero ver el catálogo")}>pídelo por WhatsApp</a>.</p>
      ) : list.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-white p-6 text-center font-dulce text-stone-600">
          <p>No hay dulces con esa combinación.</p>
          <button onClick={reset} className="mt-3 rounded-full bg-violet-600 px-5 py-2 font-semibold text-white">Quitar filtros</button>
        </div>
      ) : (
        <div className="mt-6 grid grid-flow-dense grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {list.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </section>
  );
}

function Story() {
  const steps = [
    { t: "La miel", d: "Cocemos el piloncillo hasta que huele a fiesta." },
    { t: "Las semillas", d: "Tostamos cacahuate, girasol y amaranto a mano." },
    { t: "El punto", d: "Mezclamos y extendemos antes de que enfríe." },
    { t: "El corte", d: "Cada pieza se corta y se empaca con cariño." },
  ];
  return (
    <section id="historia" className="bg-gradient-to-b from-pink-100 to-violet-100 px-4 py-16">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-dulce text-3xl font-bold text-violet-800 sm:text-4xl">Dulce herencia, hecha a mano.</h2>
          <p className="mt-4 max-w-lg font-dulce text-lg text-stone-700">
            Todo empezó en la cocina de la familia: una cazuela grande, miel de piloncillo y manos que sabían cuándo era el momento exacto. Hoy seguimos igual. Sin prisas, sin atajos y con el mismo crujido que recordamos de niños.
          </p>
          <p className="mt-3 max-w-lg font-dulce text-lg text-stone-700">
            Cada palanqueta y cada alegría lleva tiempo, paciencia y mucho cariño.
          </p>
        </div>
        <ol className="grid grid-cols-2 gap-3">
          {steps.map((s, i) => (
            <li key={s.t} className={`rounded-[2rem] bg-white p-5 shadow-lg shadow-violet-200/50 ${i % 2 ? "mt-6" : ""}`}>
              <h3 className="font-dulce text-lg font-semibold text-pink-500">{s.t}</h3>
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
      <div className="rounded-[2.5rem] bg-sky-100 p-8 text-center shadow-xl shadow-sky-200/50 sm:p-12">
        <h2 className="font-dulce text-3xl font-bold text-violet-800">Dulces para tu fiesta</h2>
        <p className="mx-auto mt-3 max-w-xl font-dulce text-lg text-stone-700">Bodas, bautizos, fiestas patrias y mesas de dulces. Armamos tu pedido por mayoreo, con empaque para regalo.</p>
        <a href={wa("Hola, quiero cotizar dulces para un evento")} className="mt-6 inline-block rounded-full bg-violet-600 px-7 py-4 font-dulce text-lg font-semibold text-white active:scale-95">Cotizar mi evento</a>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contacto" className="mx-auto max-w-6xl px-4 pb-16">
      <h2 className="font-dulce text-3xl font-bold text-violet-800 sm:text-4xl">Ven a probarlos</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="space-y-4 rounded-[2rem] bg-white p-6 shadow-xl shadow-violet-200/40">
          <p className="flex gap-3 font-dulce text-stone-700"><MapPin className="shrink-0 text-pink-500" />{BRAND.address}</p>
          <p className="flex gap-3 font-dulce text-stone-700"><Clock className="shrink-0 text-pink-500" />{BRAND.hours}</p>
          <p className="flex gap-3 font-dulce text-stone-700"><Phone className="shrink-0 text-pink-500" />{BRAND.phone}</p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <a href={wa("Hola, quiero hacer un pedido")} className="flex items-center justify-center gap-2 rounded-full bg-pink-400 px-6 py-3 font-dulce font-semibold text-white active:scale-95"><MessageCircle size={18} />Escríbenos</a>
            <a href={BRAND.mapsUrl} className="rounded-full bg-violet-100 px-6 py-3 text-center font-dulce font-semibold text-violet-700 active:scale-95">Cómo llegar</a>
          </div>
        </div>
        <div className="flex min-h-48 items-center justify-center rounded-[2rem] bg-gradient-to-br from-sky-200 to-violet-200 p-6 text-center font-dulce text-violet-800">
          {/* Reemplaza este bloque por un <iframe> de Google Maps */}
          Aquí va tu mapa
        </div>
      </div>
    </section>
  );
}

export default function Dulceria() {
  return (
    <div className="min-h-screen bg-[#FFF9F3] text-stone-800 antialiased" style={{ scrollBehavior: "smooth" }}>
      <Styles />
      <Header />
      <main>
        <Hero />
        <Marquee />
        <Catalog />
        <Story />
        <Events />
        <Contact />
      </main>
      <footer className="bg-violet-800 px-4 py-8 text-center font-dulce text-sm text-violet-100">
        © {new Date().getFullYear()} {BRAND.name}. Hecho en México, con amor y miel.
      </footer>
    </div>
  );
}
