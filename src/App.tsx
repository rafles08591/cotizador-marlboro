// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo, useContext, createContext } from "react";
import { Trash2, Save, RotateCcw, FolderOpen, X, Check, PlusCircle, Download, Camera, Search, ChevronDown, Sun, Moon, Building2 } from "lucide-react";

/* =====================================================================
   COTIZADOR — recibo corporativo JMD
   ---------------------------------------------------------------------
   Dirección visual "invoice corporativo": navy / carbón, acentos cian
   discretos, casi sin rojo (solo un ámbar suave para avisos), botón
   primario en degradado morado→azul, y un encabezado tipo membrete con
   espacio reservado para logo + folio/fecha a la derecha.

   Dos temas (oscuro / claro) intercambiables desde el botón sol/luna,
   con preferencia guardada en window.storage ("theme-preference"). La
   lógica de cálculo, guardado y exportación no cambió respecto a antes.

   El buscador dinámico (SearchableSelect) conserva el punto de color
   por marca y la barra de precio relativo dentro de cada opción, y el
   bug de contraste en filas resaltadas sigue corregido (el texto usa
   "onAccent" cuando la fila trae fondo sólido de acento).
===================================================================== */

const DARK_THEME = {
  name: "dark",
  pageBg: "#0D1420",
  headerBg: "#0B1119",
  cardBg: "rgba(21,30,46,0.68)",
  cardSolid: "#141C2B",
  panelBg: "rgba(12,18,28,0.97)",
  inputBg: "rgba(8,13,21,0.55)",
  ink: "#E7ECF3",
  inkMuted: "#8793A6",
  line: "rgba(160,178,200,0.14)",
  lineBright: "rgba(160,178,200,0.26)",
  cyan: "#4CC3D9",
  purple: "#7C6FF0",
  blue: "#3E82F7",
  gold: "#D9A55C",
  red: "#C97B87",
  green: "#4CB98A",
  onAccent: "#FFFFFF",
  trackBg: "rgba(255,255,255,0.08)",
  logoBoxBg: "#FFFFFF",
  logoBoxText: "#9AA5B4",
};

const LIGHT_THEME = {
  name: "light",
  pageBg: "#F1F4F9",
  headerBg: "#FFFFFF",
  cardBg: "rgba(255,255,255,0.82)",
  cardSolid: "#FFFFFF",
  panelBg: "rgba(255,255,255,0.98)",
  inputBg: "rgba(255,255,255,0.92)",
  ink: "#141B29",
  inkMuted: "#5C6779",
  line: "rgba(20,27,41,0.10)",
  lineBright: "rgba(20,27,41,0.20)",
  cyan: "#0E8FA8",
  purple: "#6558D3",
  blue: "#2E6FE0",
  gold: "#B3792E",
  red: "#B85662",
  green: "#2E9A6C",
  onAccent: "#FFFFFF",
  trackBg: "rgba(20,27,41,0.08)",
  logoBoxBg: "#FFFFFF",
  logoBoxText: "#9AA5B4",
};

const ThemeContext = createContext(DARK_THEME);
const ThemeToggleContext = createContext(() => {});

const LOGO_URL = "https://jxyosutthiuzbrmdznoa.supabase.co/storage/v1/object/public/promociones/b14e8554-c82a-4a60-9e1b-4ccd17fa9ef2.jpeg";

const FONT_SANS = "'Inter', -apple-system, system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, 'SF Mono', monospace";

const fmt = (n) =>
  "$" + (Number.isFinite(n) ? n : 0).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const SUCURSALES = [
  "Vallarta", "Lo Zapopan", "Aguascalientes", "Tepic", "Álamo", "Tepatitlan", "Tala",
  "Mérida", "Cancún", "Colli", "Colima", "Manzanillo", "Villahermosa",
  "Irapuato", "Celaya", "Leon",
];

const normalizeClo = (s) =>
  (s || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const COSTOS_DISTRIBUCION = {
  VALLARTA: 2.78,
  CANCUN: 2.78,
  ALAMO: 2.78,
  COLLI: 2.32,
  COLIMA: 3.36,
  MANZANILLO: 3.36,
  TEPIC: 3.36,
  AGUASCALIENTES: 2.78,
  VILLAHERMOSA: 2.78,
  MERIDA: 2.78,
  CELAYA: 2.32,
  "LO ZAPOPAN": 2.32,
  TALA: 2.78,
  IRAPUATO: 3.36,
  LEON: 3.36,
  TEPATITLAN: 3.36,
};

const costoDistribucionPorClo = (sucursal) => COSTOS_DISTRIBUCION[normalizeClo(sucursal)] || 0;

const CATALOGO = [
  { id: "c01", nombre: "MARLBORO RED 20s CD", cajetillas: 10, precio: 973.39 },
  { id: "c02", nombre: "MARLBORO GOLD 20s CD", cajetillas: 10, precio: 973.39 },
  { id: "c03", nombre: "MARLBORO RED 20s CS", cajetillas: 10, precio: 889.96 },
  { id: "c04", nombre: "MARLBORO GOLD 20s CS", cajetillas: 10, precio: 889.96 },
  { id: "c05", nombre: "MARLBORO RED 14s", cajetillas: 10, precio: 713.79 },
  { id: "c06", nombre: "MARLBORO GOLD 14s", cajetillas: 10, precio: 713.79 },
  { id: "c07", nombre: "MARLBORO KRETEK", cajetillas: 10, precio: 990.06 },
  { id: "c08", nombre: "MARLBORO 100s CAPS RED 20s", cajetillas: 10, precio: 960.83 },
  { id: "c09", nombre: "MARLBORO 100s CAPS GOLD 20s", cajetillas: 10, precio: 960.83 },
  { id: "c10", nombre: "MARLBORO RUBY 20S", cajetillas: 10, precio: 960.83 },
  { id: "c11", nombre: "MARLBORO VELVET 20S", cajetillas: 10, precio: 960.83 },
  { id: "c12", nombre: "MARLBORO ICE XPRESS 20S", cajetillas: 10, precio: 960.83 },
  { id: "c13", nombre: "MARLBORO 100s CAPS RED 14s", cajetillas: 10, precio: 704.53 },
  { id: "c14", nombre: "MARLBORO 100s CAPS GOLD 14s", cajetillas: 10, precio: 704.53 },
  { id: "c15", nombre: "MARLBORO RUBY 14S", cajetillas: 10, precio: 704.53 },
  { id: "c16", nombre: "MARLBORO ICE XPRESS 14S", cajetillas: 10, precio: 704.53 },
  { id: "c17", nombre: "BENSON & HEDGES 100s 20s GOLD", cajetillas: 10, precio: 1008.66 },
  { id: "c18", nombre: "BENSON & HEDGES 100s 20s MENTHOL", cajetillas: 10, precio: 1008.66 },
  { id: "c19", nombre: "BENSON HEDGES CRYSTAL VIOLET", cajetillas: 10, precio: 918.03 },
  { id: "c20", nombre: "BENSON HEDGES CRYSTAL BLUE", cajetillas: 10, precio: 918.03 },
  { id: "c21", nombre: "MLB CRAFTED 25S", cajetillas: 8, precio: 677.14 },
  { id: "c22", nombre: "MLB CRAFTED 15S", cajetillas: 8, precio: 458.31 },
  { id: "c23", nombre: "MLB CRAFTED RED 20S", cajetillas: 10, precio: 760.86 },
  { id: "c24", nombre: "MLB CRAFTED GOLD 20S", cajetillas: 10, precio: 760.86 },
  { id: "c25", nombre: "MLB CRAFTED MIX 20S ICE", cajetillas: 10, precio: 657.43 },
  { id: "c26", nombre: "MLB CRAFTED MIX 20S SUMMER", cajetillas: 10, precio: 657.43 },
  { id: "c27", nombre: "MLB CRAFTED MIX 20S BLOSS", cajetillas: 10, precio: 657.43 },
  { id: "c28", nombre: "MLB CRAFTED MIX 20S RUBY", cajetillas: 10, precio: 657.43 },
  { id: "c29", nombre: "FAROS LS BOX 14", cajetillas: 10, precio: 441.13 },
  { id: "c30", nombre: "FAROS LS BOX 20", cajetillas: 10, precio: 622.83 },
  { id: "c31", nombre: "FAROS KS BOB 25", cajetillas: 8, precio: 567.43 },
  { id: "c32", nombre: "L&M RED LABEL KS BOB 25", cajetillas: 8, precio: 608.98 },
  { id: "c33", nombre: "L&M RED KS BOX 20", cajetillas: 10, precio: 673.73 },
  { id: "c34", nombre: "L&M RED LABEL LS BOX 14", cajetillas: 10, precio: 472.46 },
  { id: "c35", nombre: "DELICADOS OVALADOS NF RS SOF 18P10", cajetillas: 10, precio: 821.93 },
  { id: "c36", nombre: "BARONET 25S CD", cajetillas: 8, precio: 454.90 },
  { id: "c37", nombre: "BARONET 20S CD", cajetillas: 10, precio: 491.06 },
  { id: "c38", nombre: "FARITOS 25S CD", cajetillas: 8, precio: 454.90 },
  { id: "c39", nombre: "FARITOS 20S CD", cajetillas: 10, precio: 491.06 },
  { id: "c40", nombre: "BENSON & HEDGES 100s 20s GOLD PERLA", cajetillas: 10, precio: 1008.66 },
  { id: "c41", nombre: "BENSON & HEDGES 100s 20s MINT PERLA", cajetillas: 10, precio: 1008.66 },
  { id: "c42", nombre: "MARLBORO VISTA SUMMER 20 CD", cajetillas: 10, precio: 862.33 },
  { id: "c43", nombre: "MARLBORO VISTA GARDEN 20 CD", cajetillas: 10, precio: 862.33 },
  { id: "c44", nombre: "MARLBORO VISTA ARTIC 20 CD", cajetillas: 10, precio: 862.33 },
  { id: "c45", nombre: "MARLBORO VISTA BLOSSOM 20 CD", cajetillas: 10, precio: 862.33 },
  { id: "c46", nombre: "MARLBORO CARIBEAN 20 CD", cajetillas: 10, precio: 862.33 },
];

const findCatalogo = (id) => CATALOGO.find((c) => c.id === id);
const costoPorCajetilla = (cajetillasPorPaquete, precioPaquete) =>
  cajetillasPorPaquete > 0 ? precioPaquete / cajetillasPorPaquete : 0;

const paquetesEquivalentes = (p) => {
  const paquetes = Number(p.cantidadPaquetes) || 0;
  const cajetillas = Number(p.cantidadCajetillas) || 0;
  return paquetes + cajetillas / (p.cajetillasPorPaquete || 1);
};

const cajetillasTotales = (p) => {
  const paquetes = Number(p.cantidadPaquetes) || 0;
  const cajetillas = Number(p.cantidadCajetillas) || 0;
  return paquetes * (p.cajetillasPorPaquete || 0) + cajetillas;
};

function calcPrincipal(p) {
  const costoCajetilla = costoPorCajetilla(p.cajetillasPorPaquete, p.precioPaquete);
  const paquetes = Number(p.cantidadPaquetes) || 0;
  const cajetillas = Number(p.cantidadCajetillas) || 0;
  const costoTotal = paquetes * p.precioPaquete + cajetillas * costoCajetilla;
  const paquetesLinea = paquetesEquivalentes(p);
  return { costoCajetilla, costoTotal, paquetesLinea };
}

function calcPlc(p, sucursal) {
  const paquetesLinea = paquetesEquivalentes(p);
  const cajetillasLinea = cajetillasTotales(p);
  const bonificacion = paquetesLinea * (Number(p.precioListaReferencia) || 0);
  const distribucion = cajetillasLinea * costoDistribucionPorClo(sucursal);
  return { paquetesLinea, cajetillasLinea, bonificacion, distribucion };
}

function calcCombo(entry, sucursal) {
  const principal = entry.principal;
  const plc = entry.plc;
  const costoCajetilla = costoPorCajetilla(principal.cajetillasPorPaquete, principal.precioPaquete);
  const paquetes = Number(principal.cantidadPaquetes) || 0;
  const cajetillas = Number(principal.cantidadCajetillas) || 0;
  const costoLinea = paquetes * principal.precioPaquete + cajetillas * costoCajetilla;
  const paquetesLinea = paquetesEquivalentes(principal);
  const paquetesPlc = paquetesEquivalentes(plc);
  const cajetillasPlc = cajetillasTotales(plc);
  const bonificacion = paquetesPlc * (Number(plc.precioListaReferencia) || 0);
  const distribucion = cajetillasPlc * costoDistribucionPorClo(sucursal);
  const costoPorPaqueteConPlc = paquetesLinea > 0 ? (costoLinea + distribucion - bonificacion) / paquetesLinea : 0;
  const margenGanancia = principal.precioPaquete > 0 ? ((principal.precioPaquete - costoPorPaqueteConPlc) / principal.precioPaquete) * 100 : 0;
  return { costoCajetilla, costoLinea, paquetesLinea, paquetesPlc, cajetillasPlc, bonificacion, distribucion, costoPorPaqueteConPlc, margenGanancia };
}

function cantidadTextoSimple(p) {
  const paquetes = Number(p.cantidadPaquetes) || 0;
  const cajetillas = Number(p.cantidadCajetillas) || 0;
  const partes = [];
  if (paquetes) partes.push(`${paquetes} paq`);
  if (cajetillas) partes.push(`${cajetillas} caj`);
  return partes.length ? partes.join(" + ") : "0";
}

/* --------------------------- Marcas / catálogo --------------------------- */
const MARCAS = [
  { key: "MARLBORO", label: "Marlboro", color: "#C97B87" },
  { key: "BENSON", label: "Benson & Hedges", color: "#7C6FF0" },
  { key: "MLB CRAFTED", label: "MLB Crafted", color: "#D9A55C" },
  { key: "FAROS", label: "Faros", color: "#4CB98A" },
  { key: "L&M", label: "L&M", color: "#3E82F7" },
  { key: "DELICADOS", label: "Delicados", color: "#9B8CF2" },
  { key: "BARONET", label: "Baronet", color: "#4CC3D9" },
  { key: "FARITOS", label: "Faritos", color: "#7FB88A" },
];
const marcaDe = (nombre) => MARCAS.find((m) => nombre.startsWith(m.key)) || { key: "OTRO", label: "Otro", color: "#8793A6" };

const catalogoOptions = CATALOGO.map((c) => {
  const marca = marcaDe(c.nombre);
  return {
    value: c.id,
    label: c.nombre,
    meta: fmt(c.precio),
    dotColor: marca.color,
    marcaLabel: marca.label,
  };
});
const sucursalOptions = SUCURSALES.map((s) => ({ value: s, label: s }));

/* ---------------------------------------------------------------------
   Estilos globales compartidos (foco accesible, scrollbar)
--------------------------------------------------------------------- */
function GlobalStyle() {
  const COLORS = useContext(ThemeContext);
  return (
    <style>{`
      .ct-input:focus, .ct-trigger:focus-within {
        outline: none !important;
        border-color: ${COLORS.cyan} !important;
        box-shadow: 0 0 0 3px ${COLORS.cyan}22 !important;
      }
      .ct-btn-ghost:hover { border-color: ${COLORS.cyan}55 !important; color: ${COLORS.cyan} !important; }
      .ct-btn-primary:hover, .ct-btn-accent:hover { filter: brightness(1.06); }
      .ct-row:hover { background: ${COLORS.cyan}14 !important; }
      .ct-scroll::-webkit-scrollbar { width: 6px; }
      .ct-scroll::-webkit-scrollbar-thumb { background: ${COLORS.cyan}55; border-radius: 4px; }
      .ct-scroll::-webkit-scrollbar-track { background: transparent; }
      input[type="number"]::-webkit-outer-spin-button, input[type="number"]::-webkit-inner-spin-button { opacity: 0.5; }
    `}</style>
  );
}

/* ---------------------------------------------------------------------
   Buscador dinámico (combobox): reemplaza el <select> plano.
   Escribe para filtrar en vivo; también funciona como select clásico
   (click para abrir, flechas + Enter para navegar, Esc para cerrar).
--------------------------------------------------------------------- */
function SearchableSelect({ label, value, options, onChange, placeholder = "Selecciona…", required, accent }) {
  const COLORS = useContext(ThemeContext);
  const accentColor = accent || COLORS.cyan;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hi, setHi] = useState(0);
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  const selected = options.find((o) => o.value === value) || null;

  useEffect(() => {
    function onDocClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const norm = (s) =>
    (s || "").toString().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = norm(query);
    return options.filter((o) => norm(o.label).includes(q));
  }, [options, query]);

  useEffect(() => { setHi(0); }, [query, open]);

  const commit = (opt) => {
    onChange(opt ? opt.value : "");
    setOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (filtered[hi]) commit(filtered[hi]); }
    else if (e.key === "Escape") { setOpen(false); setQuery(""); }
  };

  // isHi: la fila trae fondo sólido de acento, así que el texto (incluida
  // la parte resaltada de la búsqueda) debe usar "onAccent", nunca el
  // propio color de acento — de lo contrario se pierde contra su fondo.
  const renderLabel = (lbl, isHi) => {
    if (!query.trim()) return lbl;
    const idx = norm(lbl).indexOf(norm(query));
    if (idx === -1) return lbl;
    if (isHi) return lbl;
    return (
      <>
        {lbl.slice(0, idx)}
        <span style={{ color: accentColor, fontWeight: 800 }}>{lbl.slice(idx, idx + query.length)}</span>
        {lbl.slice(idx + query.length)}
      </>
    );
  };

  return (
    <div ref={rootRef} style={{ position: "relative", display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      {label && (
        <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: COLORS.inkMuted, fontFamily: FONT_SANS }}>
          {label} {required && <span style={{ color: COLORS.gold }}>*</span>}
        </span>
      )}
      <div
        className="ct-trigger"
        onClick={() => { setOpen(true); requestAnimationFrame(() => inputRef.current?.focus()); }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          boxSizing: "border-box",
          borderRadius: 12,
          padding: "10px 12px",
          background: COLORS.inputBg,
          border: `1px solid ${open ? accentColor : required && !value ? COLORS.gold : COLORS.line}`,
          boxShadow: open ? `0 0 0 3px ${accentColor}22` : "none",
          transition: "border-color .15s ease, box-shadow .15s ease",
          cursor: "text",
        }}
      >
        <Search size={14} color={open ? accentColor : COLORS.inkMuted} style={{ flexShrink: 0 }} />
        <input
          ref={inputRef}
          value={open ? query : selected ? selected.label : ""}
          onChange={(e) => { setQuery(e.target.value); if (!open) setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={open ? "Buscar…" : selected ? selected.label : placeholder}
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            outline: "none",
            background: "transparent",
            color: COLORS.ink,
            fontSize: 14,
            fontFamily: FONT_SANS,
          }}
        />
        {selected && !open && (
          <button
            onClick={(e) => { e.stopPropagation(); commit(null); }}
            style={{ background: "none", border: "none", color: COLORS.inkMuted, padding: 2, display: "flex", cursor: "pointer" }}
            aria-label="Limpiar"
          >
            <X size={13} />
          </button>
        )}
        <ChevronDown size={14} color={COLORS.inkMuted} style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform .15s ease" }} />
      </div>

      {open && (
        <div
          className="ct-scroll"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 6,
            zIndex: 40,
            background: COLORS.panelBg,
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: `1px solid ${COLORS.line}`,
            borderRadius: 12,
            maxHeight: 300,
            overflowY: "auto",
            boxShadow: "0 14px 34px rgba(8,13,21,0.28)",
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: "16px 12px", fontSize: 12.5, color: COLORS.inkMuted, textAlign: "center", fontFamily: FONT_MONO }}>
              Sin coincidencias para "{query}"
            </div>
          ) : (
            filtered.map((opt, i) => {
              const isHi = i === hi;
              const textColor = isHi ? COLORS.onAccent : COLORS.ink;
              const mutedColor = isHi ? COLORS.onAccent : COLORS.inkMuted;
              return (
                <div
                  key={opt.value}
                  className="ct-row"
                  onMouseDown={(e) => { e.preventDefault(); commit(opt); }}
                  onMouseEnter={() => setHi(i)}
                  style={{
                    padding: "9px 12px",
                    cursor: "pointer",
                    background: isHi ? accentColor : "transparent",
                    transition: "background .1s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, lineHeight: 1.3, color: textColor, minWidth: 0 }}>
                      {opt.dotColor && (
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: opt.dotColor, flexShrink: 0 }} />
                      )}
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{renderLabel(opt.label, isHi)}</span>
                    </span>
                    {opt.meta && (
                      <span style={{ fontSize: 11, fontFamily: FONT_MONO, whiteSpace: "nowrap", color: textColor, fontWeight: isHi ? 700 : 600, flexShrink: 0 }}>
                        {opt.meta}
                      </span>
                    )}
                  </div>
                  {opt.marcaLabel && (
                    <div style={{ marginTop: 3 }}>
                      <span style={{ fontSize: 9.5, fontFamily: FONT_MONO, color: mutedColor, whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        {opt.marcaLabel}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function NumField({ label, value, onChange }) {
  const COLORS = useContext(ThemeContext);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: COLORS.inkMuted, fontFamily: FONT_SANS }}>
        {label}
      </span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => e.target.select()}
        className="ct-input"
        style={{
          width: "100%",
          boxSizing: "border-box",
          borderRadius: 12,
          padding: "10px 12px",
          fontSize: 15,
          backgroundColor: COLORS.inputBg,
          color: COLORS.ink,
          border: `1px solid ${COLORS.line}`,
          fontFamily: FONT_MONO,
          outline: "none",
        }}
      />
    </div>
  );
}

function ResultLine({ label, value, bold, accent }) {
  const COLORS = useContext(ThemeContext);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, padding: "3px 0" }}>
      <span style={{
        fontSize: 13,
        color: accent === "red" ? COLORS.red : bold ? COLORS.ink : COLORS.inkMuted,
        fontFamily: FONT_MONO,
        fontWeight: bold || accent === "red" ? 700 : 400,
      }}>
        {label}
      </span>
      <span style={{
        fontSize: bold ? 15 : 13,
        color: accent === "green" ? COLORS.green : accent === "red" ? COLORS.red : COLORS.ink,
        fontFamily: FONT_MONO,
        fontWeight: bold ? 800 : 500,
      }}>
        {value}
      </span>
    </div>
  );
}

function AddProductForm({ onAdd, sucursal, sucursalFalta }) {
  const COLORS = useContext(ThemeContext);
  const [principalId, setPrincipalId] = useState("");
  const [paquetesPrincipal, setPaquetesPrincipal] = useState(1);
  const [cajetillasPrincipal, setCajetillasPrincipal] = useState(0);
  const [plcId, setPlcId] = useState("");
  const [paquetesPlc, setPaquetesPlc] = useState(0);
  const [cajetillasPlc, setCajetillasPlc] = useState(0);

  const principal = findCatalogo(principalId);
  const plc = findCatalogo(plcId);
  const costoCajetillaPrincipal = principal ? costoPorCajetilla(principal.cajetillas, principal.precio) : 0;
  const tarifaDistribucion = costoDistribucionPorClo(sucursal);

  const handleAdd = () => {
    if (!principalId && !plcId) return;
    const entries = [];

    if (principal && plc) {
      entries.push({
        id: `p_${Date.now()}_combo`,
        tipo: "combo",
        principal: {
          nombre: principal.nombre,
          cajetillasPorPaquete: principal.cajetillas,
          precioPaquete: principal.precio,
          cantidadPaquetes: Number(paquetesPrincipal) || 0,
          cantidadCajetillas: Number(cajetillasPrincipal) || 0,
        },
        plc: {
          nombre: plc.nombre,
          cajetillasPorPaquete: plc.cajetillas,
          precioListaReferencia: plc.precio,
          cantidadPaquetes: Number(paquetesPlc) || 0,
          cantidadCajetillas: Number(cajetillasPlc) || 0,
        },
      });
    } else if (principal) {
      entries.push({
        id: `p_${Date.now()}_a`,
        tipo: "principal",
        nombre: principal.nombre,
        cajetillasPorPaquete: principal.cajetillas,
        precioPaquete: principal.precio,
        cantidadPaquetes: Number(paquetesPrincipal) || 0,
        cantidadCajetillas: Number(cajetillasPrincipal) || 0,
      });
    } else if (plc) {
      entries.push({
        id: `p_${Date.now()}_b`,
        tipo: "plc",
        nombre: plc.nombre,
        cajetillasPorPaquete: plc.cajetillas,
        precioPaquete: 0,
        precioListaReferencia: plc.precio,
        cantidadPaquetes: Number(paquetesPlc) || 0,
        cantidadCajetillas: Number(cajetillasPlc) || 0,
      });
    }

    onAdd(entries);
    setPrincipalId("");
    setPlcId("");
    setPaquetesPrincipal(1);
    setCajetillasPrincipal(0);
    setPaquetesPlc(0);
    setCajetillasPlc(0);
  };

  return (
    <div style={{ backgroundColor: COLORS.cardBg, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: `1px solid ${COLORS.line}`, borderRadius: 16, padding: 16, boxShadow: "0 8px 24px rgba(8,13,21,0.16)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: COLORS.inkMuted, fontFamily: FONT_MONO, fontWeight: 700 }}>
          Agregar producto
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.ink, fontFamily: FONT_SANS }}>Producto principal</div>
          <SearchableSelect label="Producto" value={principalId} onChange={setPrincipalId} options={catalogoOptions} placeholder="Busca un producto…" accent={COLORS.cyan} />
          {principal && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "8px 12px", borderRadius: 12, backgroundColor: `${COLORS.cyan}12`, border: `1px solid ${COLORS.cyan}30`, color: COLORS.inkMuted, fontFamily: FONT_MONO }}>
              <span>Cajetillas x paquete: {principal.cajetillas}</span>
              <span>{fmt(principal.precio)}/paq · {fmt(costoCajetillaPrincipal)}/caj</span>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <NumField label="Paquetes" value={paquetesPrincipal} onChange={setPaquetesPrincipal} />
            <NumField label="Cajetillas" value={cajetillasPrincipal} onChange={setCajetillasPrincipal} />
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${COLORS.line}` }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.gold, fontFamily: FONT_SANS }}>Producto PLC (cortesía, sin costo)</div>
          <SearchableSelect label="Producto PLC" value={plcId} onChange={setPlcId} options={catalogoOptions} placeholder="Ninguno" accent={COLORS.gold} />
          {plc && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "8px 12px", borderRadius: 12, backgroundColor: `${COLORS.gold}12`, border: `1px solid ${COLORS.gold}30`, color: COLORS.inkMuted, fontFamily: FONT_MONO }}>
              <span>Cajetillas x paquete: {plc.cajetillas}</span>
              <span>Costo: $0.00</span>
            </div>
          )}
          {plcId && (
            <div style={{ fontSize: 11, color: COLORS.inkMuted, fontFamily: FONT_MONO }}>
              Distribución del Clo: {fmt(tarifaDistribucion)} / cajetilla
            </div>
          )}
          {plcId && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <NumField label="Paquetes" value={paquetesPlc} onChange={setPaquetesPlc} />
              <NumField label="Cajetillas" value={cajetillasPlc} onChange={setCajetillasPlc} />
            </div>
          )}
        </div>

        {sucursalFalta && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: COLORS.gold, fontFamily: FONT_SANS, backgroundColor: `${COLORS.gold}14`, border: `1px solid ${COLORS.gold}33`, borderRadius: 10, padding: "9px 12px" }}>
            Selecciona un Clo antes de agregar productos.
          </div>
        )}

        <button
          onClick={handleAdd}
          disabled={(!principalId && !plcId) || sucursalFalta}
          className="ct-btn-primary"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.blue})`,
            color: COLORS.onAccent,
            border: "none",
            borderRadius: 14,
            padding: "13px 16px",
            fontSize: 15,
            fontWeight: 700,
            fontFamily: FONT_SANS,
            letterSpacing: "0.01em",
            boxShadow: `0 6px 18px ${COLORS.blue}2e`,
            opacity: ((!principalId && !plcId) || sucursalFalta) ? 0.4 : 1,
            cursor: ((!principalId && !plcId) || sucursalFalta) ? "not-allowed" : "pointer",
          }}
        >
          Agregar a la cotización <PlusCircle size={18} />
        </button>
      </div>
    </div>
  );
}

function ProductTicket({ product, onChange, onRemove, sucursal }) {
  const COLORS = useContext(ThemeContext);
  const cardStyle = { backgroundColor: COLORS.cardBg, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: `1px solid ${COLORS.line}`, borderRadius: 16, padding: 16, boxShadow: "0 8px 24px rgba(8,13,21,0.12)" };

  if (product.tipo === "combo") {
    const r = calcCombo(product, sucursal);
    const updatePrincipal = (field, value) => onChange({ ...product, principal: { ...product.principal, [field]: value } });
    const updatePlc = (field, value) => onChange({ ...product, plc: { ...product.plc, [field]: value } });

    return (
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.ink, fontFamily: FONT_SANS }}>{product.principal.nombre}</div>
            <div style={{ fontSize: 11, color: COLORS.inkMuted, fontFamily: FONT_MONO, marginTop: 2 }}>
              Cajetillas x paquete: {product.principal.cajetillasPorPaquete} · <span style={{ color: COLORS.gold }}>+ PLC: {product.plc.nombre}</span>
            </div>
          </div>
          <button onClick={onRemove} style={{ color: COLORS.red, background: "none", border: "none", padding: 4, cursor: "pointer" }}>
            <Trash2 size={16} />
          </button>
        </div>

        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.ink, marginTop: 14, marginBottom: 8 }}>Producto de línea</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <NumField label="Paquetes" value={product.principal.cantidadPaquetes} onChange={(v) => updatePrincipal("cantidadPaquetes", v)} />
          <NumField label="Cajetillas" value={product.principal.cantidadCajetillas} onChange={(v) => updatePrincipal("cantidadCajetillas", v)} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontSize: 13, color: COLORS.inkMuted }}>Costo</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.green }}>{fmt(r.costoLinea)}</span>
        </div>

        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.gold, marginTop: 18, marginBottom: 8 }}>
          Producto PLC — {product.plc.nombre}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <NumField label="Paquetes" value={product.plc.cantidadPaquetes} onChange={(v) => updatePlc("cantidadPaquetes", v)} />
          <NumField label="Cajetillas" value={product.plc.cantidadCajetillas} onChange={(v) => updatePlc("cantidadCajetillas", v)} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontSize: 13, color: COLORS.inkMuted }}>Costo</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{fmt(0)}</span>
        </div>

        <div style={{ borderTop: `1px solid ${COLORS.line}`, marginTop: 14, paddingTop: 10 }}>
          <ResultLine label="Desglose de distribución" value={`${r.cajetillasPlc.toFixed(2)} caj × ${fmt(costoDistribucionPorClo(sucursal))} = ${fmt(r.distribucion)}`} />
          <ResultLine label="Bonificación (PLC)" value={fmt(r.bonificacion)} />
          <div style={{ borderTop: `1px solid ${COLORS.line}`, marginTop: 6, paddingTop: 6 }}>
            <ResultLine label="Precio descontando PLC" value={fmt(r.costoPorPaqueteConPlc)} bold accent="green" />
            <ResultLine label="Margen de ganancia" value={`${r.margenGanancia.toFixed(2)}%`} bold />
          </div>
        </div>
      </div>
    );
  }

  const isPlc = product.tipo === "plc";
  const r = !isPlc ? calcPrincipal(product) : calcPlc(product, sucursal);

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.ink, fontFamily: FONT_SANS }}>{product.nombre}</div>
          <div style={{ fontSize: 11, color: COLORS.inkMuted, fontFamily: FONT_MONO, marginTop: 2 }}>
            Cajetillas x paquete: {product.cajetillasPorPaquete}
            {isPlc && <span style={{ color: COLORS.gold }}> · PLC / sin costo</span>}
          </div>
        </div>
        <button onClick={onRemove} style={{ color: COLORS.red, background: "none", border: "none", padding: 4, cursor: "pointer" }}>
          <Trash2 size={16} />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 10 }}>
        <NumField label="Paquetes" value={product.cantidadPaquetes} onChange={(v) => onChange({ ...product, cantidadPaquetes: v })} />
        <NumField label="Cajetillas" value={product.cantidadCajetillas} onChange={(v) => onChange({ ...product, cantidadCajetillas: v })} />
      </div>

      <div style={{ borderTop: `1px solid ${COLORS.line}`, marginTop: 14, paddingTop: 10 }}>
        {isPlc ? (
          <>
            <ResultLine label="Costo (cortesía)" value={fmt(0)} />
            <ResultLine label="Precio de lista (referencia)" value={fmt(product.precioListaReferencia)} />
            <ResultLine label="Bonificación (cantidad × precio de lista)" value={fmt(r.bonificacion)} bold />
            <ResultLine label="Desglose de distribución" value={fmt(r.distribucion)} />
          </>
        ) : (
          <>
            <ResultLine label="Costo x paquete (lista)" value={fmt(product.precioPaquete)} />
            <ResultLine label="Costo total de línea" value={fmt(r.costoTotal)} bold accent="green" />
          </>
        )}
      </div>
    </div>
  );
}

function ThemeToggleButton() {
  const COLORS = useContext(ThemeContext);
  const toggle = useContext(ThemeToggleContext);
  const isDark = COLORS.name === "dark";
  return (
    <button
      onClick={toggle}
      aria-label="Cambiar tema"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: 999,
        background: COLORS.inputBg,
        border: `1px solid ${COLORS.line}`,
        color: COLORS.inkMuted,
        fontSize: 10.5,
        fontFamily: FONT_MONO,
        fontWeight: 700,
        cursor: "pointer",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        flexShrink: 0,
      }}
    >
      {isDark ? <Sun size={12} /> : <Moon size={12} />}
      {isDark ? "Claro" : "Oscuro"}
    </button>
  );
}

/* ---------------------------------------------------------------------
   Encabezado tipo membrete: espacio para logo a la izquierda, nombre
   del sistema y folio/fecha a la derecha — como el encabezado de una
   factura formal.
--------------------------------------------------------------------- */
function InvoiceHeader({ folio, today }) {
  const COLORS = useContext(ThemeContext);
  return (
    <div style={{ backgroundColor: COLORS.cardSolid, border: `1px solid ${COLORS.line}`, borderRadius: 16, padding: 16, display: "flex", alignItems: "center", gap: 14, boxShadow: "0 8px 24px rgba(8,13,21,0.14)" }}>
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: 10,
          background: COLORS.logoBoxBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          border: `1px solid ${COLORS.line}`,
          overflow: "hidden",
        }}
      >
        <img
          src={LOGO_URL}
          alt="Logo"
          style={{ width: "100%", height: "100%", objectFit: "contain", padding: 6, boxSizing: "border-box" }}
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.nextSibling.style.display = "flex";
          }}
        />
        <div style={{ display: "none", flexDirection: "column", alignItems: "center", gap: 2, color: COLORS.logoBoxText }}>
          <Building2 size={14} />
          <span style={{ fontSize: 6, fontFamily: FONT_MONO, letterSpacing: "0.04em", textAlign: "center", lineHeight: 1.2 }}>
            ESPACIO<br />PARA LOGO
          </span>
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ThemeToggleButton />
          <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: "0.08em", color: COLORS.ink, fontFamily: FONT_SANS }}>COTIZADOR</span>
        </div>
        <span style={{ fontSize: 11, color: COLORS.inkMuted, fontFamily: FONT_MONO }}>FOLIO N.º {folio}</span>
        <span style={{ fontSize: 11, color: COLORS.inkMuted, fontFamily: FONT_MONO }}>{today}</span>
      </div>
    </div>
  );
}

function CotizadorInner() {
  const COLORS = useContext(ThemeContext);
  const [products, setProducts] = useState([]);
  const [sucursal, setSucursal] = useState("");
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [showSavedList, setShowSavedList] = useState(false);
  const [showCapture, setShowCapture] = useState(false);
  const [quoteName, setQuoteName] = useState("");
  const [status, setStatus] = useState("");
  const saveTimer = useRef(null);
  const folio = useMemo(() => Math.floor(1000 + Math.random() * 9000), []);
  const today = useMemo(() => new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }), []);

  useEffect(() => {
    (async () => {
      try {
        const current = await window.storage.get("current-quote");
        if (current?.value) {
          const parsed = JSON.parse(current.value);
          if (Array.isArray(parsed)) setProducts(parsed);
        }
      } catch (e) {}
      try {
        const saved = await window.storage.get("saved-quotes");
        if (saved?.value) {
          const parsed = JSON.parse(saved.value);
          if (Array.isArray(parsed)) setSavedQuotes(parsed);
        }
      } catch (e) {}
    })();
  }, []);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await window.storage.set("current-quote", JSON.stringify(products));
      } catch (e) {}
    }, 600);
    return () => clearTimeout(saveTimer.current);
  }, [products]);

  const addEntries = (entries) => setProducts((prev) => [...prev, ...entries]);
  const updateProduct = (id, updated) => setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
  const removeProduct = (id) => setProducts((prev) => prev.filter((p) => p.id !== id));

  const resetQuote = () => {
    setProducts([]);
    setSucursal("");
    setStatus("Nueva cotización iniciada");
    setTimeout(() => setStatus(""), 2000);
  };

  const persistSavedQuotes = async (list) => {
    try {
      await window.storage.set("saved-quotes", JSON.stringify(list));
    } catch (e) {
      setStatus("No se pudo guardar.");
    }
  };

  const confirmSave = async () => {
    const name = quoteName.trim() || `Cotización ${folio}`;
    const entry = { id: `q_${Date.now()}`, name, date: today, products, sucursal };
    const list = [entry, ...savedQuotes].slice(0, 30);
    setSavedQuotes(list);
    await persistSavedQuotes(list);
    setShowSaveInput(false);
    setQuoteName("");
    setStatus("Cotización guardada");
    setTimeout(() => setStatus(""), 2000);
  };

  const loadQuote = (q) => {
    setProducts(q.products);
    if (q.sucursal) setSucursal(q.sucursal);
    setShowSavedList(false);
    setStatus(`Cargada: ${q.name}`);
    setTimeout(() => setStatus(""), 2000);
  };

  const deleteSavedQuote = async (id) => {
    const list = savedQuotes.filter((q) => q.id !== id);
    setSavedQuotes(list);
    await persistSavedQuotes(list);
  };

  const totals = useMemo(() => {
    return products.reduce((acc, p) => {
      if (p.tipo === "plc") {
        const rp = calcPlc(p, sucursal);
        acc.paquetesPlc += rp.paquetesLinea;
        acc.bonificacion += rp.bonificacion;
        acc.distribucion += rp.distribucion;
      } else if (p.tipo === "combo") {
        const rc = calcCombo(p, sucursal);
        acc.costo += rc.costoLinea;
        acc.paquetesLinea += rc.paquetesLinea;
        acc.paquetesPlc += rc.paquetesPlc;
        acc.bonificacion += rc.bonificacion;
        acc.distribucion += rc.distribucion;
      } else {
        const r = calcPrincipal(p);
        acc.costo += r.costoTotal;
        acc.paquetesLinea += r.paquetesLinea;
      }
      return acc;
    }, { costo: 0, distribucion: 0, bonificacion: 0, paquetesLinea: 0, paquetesPlc: 0 });
  }, [products, sucursal]);

  const totalCotizar = totals.costo + totals.distribucion;

  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const descargarResumenHtml = () => {
    const filas = products
      .map((p) => {
        if (p.tipo === "combo") {
          return `<tr>
            <td>${escapeHtml(p.principal.nombre)}</td>
            <td style="text-align:right">${escapeHtml(cantidadTextoSimple(p.principal))}</td>
          </tr>
          <tr>
            <td style="padding-left:16px;color:#B3792E">↳ PLC: ${escapeHtml(p.plc.nombre)}</td>
            <td style="text-align:right">${escapeHtml(cantidadTextoSimple(p.plc))}</td>
          </tr>`;
        }
        return `<tr>
          <td>${escapeHtml(p.nombre)}${p.tipo === "plc" ? ' <span style="color:#B3792E">(PLC)</span>' : ""}</td>
          <td style="text-align:right">${escapeHtml(cantidadTextoSimple(p))}</td>
        </tr>`;
      })
      .join("");

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Cotización ${folio}</title>
  <style>
    body { font-family: -apple-system, system-ui, sans-serif; background:#F1F4F9; padding:24px; color:#141B29; }
    .ticket { max-width:420px; margin:0 auto; background:#FFFFFF; padding:24px; border-radius:16px; border:1px solid rgba(20,27,41,0.10); box-shadow:0 20px 50px rgba(20,27,41,0.10); }
    .letterhead { display:flex; align-items:center; gap:14px; margin-bottom:16px; }
    .logo-box { width:52px; height:52px; border-radius:10px; border:1px solid rgba(20,27,41,0.14); display:flex; align-items:center; justify-content:center; overflow:hidden; flex-shrink:0; }
    .logo-box img { width:100%; height:100%; object-fit:contain; padding:5px; box-sizing:border-box; }
    h1 { text-align:right; flex:1; font-size:19px; margin:0; letter-spacing:0.06em; color:#141B29; }
    .sub { text-align:center; font-size:12px; color:#5C6779; margin-bottom:12px; }
    .meta { display:flex; justify-content:space-between; font-size:12px; color:#5C6779; border-top:1px solid rgba(20,27,41,0.10); padding-top:8px; margin-top:8px; font-family:'JetBrains Mono',ui-monospace,monospace; }
    table { width:100%; border-collapse:collapse; margin-top:16px; font-size:13px; }
    td { padding:5px 0; }
    .totales td { border-top:1px solid rgba(20,27,41,0.10); padding-top:8px; color:#141B29; font-weight:600; }
    .total-final td { font-weight:800; font-size:16px; color:#2E9A6C; border-top:1px solid rgba(20,27,41,0.10); padding-top:8px; }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="letterhead">
      <div class="logo-box"><img src="${LOGO_URL}" alt="Logo" /></div>
      <h1>COTIZADOR</h1>
    </div>
    <p class="sub">Resumen de cotización</p>
    <div class="meta"><span>Folio N.º ${folio}</span><span>${escapeHtml(today)}</span></div>
    ${sucursal ? `<div class="meta"><span>Clo</span><span>${escapeHtml(sucursal)}</span></div>` : ""}
    <table>${filas}</table>
    <table class="totales">
      <tr><td>Paquetes PLC entregados</td><td style="text-align:right">${totals.paquetesPlc.toFixed(2)}</td></tr>
      <tr><td>Bonificación total</td><td style="text-align:right">${fmt(totals.bonificacion)}</td></tr>
      <tr><td>Desglose de distribución</td><td style="text-align:right">${fmt(totals.distribucion)}</td></tr>
      <tr class="total-final"><td>TOTAL A COTIZAR</td><td style="text-align:right">${fmt(totalCotizar)}</td></tr>
    </table>
  </div>
  <script>window.onload = function(){ window.print(); }</script>
</body>
</html>`;

    try {
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cotizacion-${folio}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setStatus("Resumen descargado. Ábrelo para imprimir o guardar como PDF.");
    } catch (e) {
      setStatus("No se pudo descargar el resumen.");
    }
    setTimeout(() => setStatus(""), 4000);
  };

  const cardBase = { backgroundColor: COLORS.cardBg, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: `1px solid ${COLORS.line}`, borderRadius: 16, boxShadow: "0 8px 24px rgba(8,13,21,0.12)" };
  const ghostBtn = { display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 12px", borderRadius: 12, backgroundColor: COLORS.inputBg, border: `1px solid ${COLORS.line}`, fontSize: 13, color: COLORS.ink, fontFamily: FONT_SANS, cursor: "pointer", transition: "border-color .15s ease, color .15s ease" };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "24px 12px",
        backgroundColor: COLORS.pageBg,
        fontFamily: FONT_SANS,
      }}
    >
      <GlobalStyle />

      <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 16 }}>

        <InvoiceHeader folio={folio} today={today} />

        <div>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: COLORS.inkMuted, marginBottom: 4 }}>
            Clo <span style={{ color: COLORS.gold }}>*</span>
          </div>
          <div style={{ maxWidth: 220 }}>
            <SearchableSelect value={sucursal} onChange={setSucursal} options={sucursalOptions} placeholder="Selecciona un Clo" required accent={COLORS.cyan} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="ct-btn-ghost" onClick={() => setShowSaveInput(s => !s)} disabled={!sucursal} style={{ ...ghostBtn, flex: 1, opacity: !sucursal ? 0.4 : 1 }}>
            <Save size={16} /> Guardar
          </button>
          <button className="ct-btn-ghost" onClick={() => setShowSavedList(s => !s)} style={ghostBtn}>
            <FolderOpen size={16} /> Guardadas
          </button>
          <button className="ct-btn-ghost" onClick={resetQuote} style={{ ...ghostBtn, color: COLORS.inkMuted }}>
            <RotateCcw size={16} />
          </button>
        </div>

        {status && (
          <div style={{ textAlign: "center", fontSize: 12, padding: 8, borderRadius: 12, backgroundColor: `${COLORS.green}12`, border: `1px solid ${COLORS.green}30`, color: COLORS.green, fontFamily: FONT_MONO }}>
            {status}
          </div>
        )}

        {showSaveInput && (
          <div style={{ display: "flex", gap: 8, padding: 12, borderRadius: 12, ...cardBase }}>
            <input
              type="text"
              autoFocus
              placeholder={`Cotización ${folio}`}
              value={quoteName}
              onChange={(e) => setQuoteName(e.target.value)}
              className="ct-input"
              style={{ flex: 1, border: "none", outline: "none", fontSize: 14, background: "transparent", color: COLORS.ink, fontFamily: FONT_SANS }}
            />
            <button onClick={confirmSave} style={{ color: COLORS.green, background: "none", border: "none", cursor: "pointer" }}><Check size={18} /></button>
            <button onClick={() => setShowSaveInput(false)} style={{ color: COLORS.inkMuted, background: "none", border: "none", cursor: "pointer" }}><X size={18} /></button>
          </div>
        )}

        {showSavedList && (
          <div style={{ padding: 12, ...cardBase }}>
            {savedQuotes.length === 0 ? (
              <div style={{ fontSize: 12, color: COLORS.inkMuted }}>Aún no hay cotizaciones guardadas.</div>
            ) : (
              savedQuotes.map((q) => (
                <div key={q.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <button onClick={() => loadQuote(q)} style={{ background: "none", border: "none", textAlign: "left", fontSize: 13, color: COLORS.ink, cursor: "pointer" }}>
                    {q.name} <span style={{ color: COLORS.inkMuted }}>· {q.date}</span>
                  </button>
                  <button onClick={() => deleteSavedQuote(q.id)} style={{ color: COLORS.red, background: "none", border: "none", cursor: "pointer" }}><Trash2 size={14} /></button>
                </div>
              ))
            )}
          </div>
        )}

        <AddProductForm onAdd={addEntries} sucursal={sucursal} sucursalFalta={!sucursal} />

        {products.length === 0 ? (
          <div style={{ textAlign: "center", fontSize: 13, color: COLORS.inkMuted, padding: 16 }}>
            Aún no agregas productos a esta cotización.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {products.map((p) => (
              <ProductTicket key={p.id} product={p} sucursal={sucursal} onChange={(u) => updateProduct(p.id, u)} onRemove={() => removeProduct(p.id)} />
            ))}
          </div>
        )}

        {products.length > 0 && (
          <div style={{ ...cardBase, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: COLORS.logoBoxBg, border: `1px solid ${COLORS.line}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                <img
                  src={LOGO_URL}
                  alt="Logo"
                  style={{ width: "100%", height: "100%", objectFit: "contain", padding: 3, boxSizing: "border-box" }}
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              </div>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: COLORS.inkMuted }}>
                Resumen de cotización
              </div>
            </div>

            {products.map((p) => (
              <div key={p.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span>{p.tipo === "combo" ? p.principal.nombre : p.nombre}{p.tipo === "plc" && <span style={{ color: COLORS.gold }}> (PLC)</span>}</span>
                  <span style={{ color: COLORS.inkMuted }}>{p.tipo === "combo" ? cantidadTextoSimple(p.principal) : cantidadTextoSimple(p)}</span>
                </div>
                {p.tipo === "combo" && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, paddingLeft: 12, color: COLORS.gold, marginTop: 2 }}>
                    <span>↳ PLC: {p.plc.nombre}</span>
                    <span style={{ color: COLORS.inkMuted }}>{cantidadTextoSimple(p.plc)}</span>
                  </div>
                )}
              </div>
            ))}

            <div style={{ borderTop: `1px solid ${COLORS.line}`, marginTop: 10, paddingTop: 10 }}>
              <ResultLine label="Paquetes PLC entregados" value={totals.paquetesPlc.toFixed(2)} />
              <ResultLine label="Bonificación total" value={fmt(totals.bonificacion)} />
              <ResultLine label="Desglose de distribución" value={fmt(totals.distribucion)} />
              <div style={{ borderTop: `1px solid ${COLORS.line}`, marginTop: 6, paddingTop: 6 }}>
                <ResultLine label="TOTAL A COTIZAR" value={fmt(totalCotizar)} bold accent="green" />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button
                onClick={() => setShowCapture(true)}
                className="ct-btn-ghost"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "12px",
                  borderRadius: 14,
                  backgroundColor: COLORS.inputBg,
                  border: `1px solid ${COLORS.line}`,
                  fontSize: 14,
                  fontWeight: 600,
                  color: COLORS.ink,
                  fontFamily: FONT_SANS,
                  cursor: "pointer",
                }}
              >
                <Camera size={16} /> Capturar pantalla
              </button>

              <button
                onClick={descargarResumenHtml}
                className="ct-btn-accent"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "12px",
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${COLORS.cyan}, ${COLORS.green})`,
                  border: "none",
                  fontSize: 14,
                  fontWeight: 700,
                  color: COLORS.onAccent,
                  fontFamily: FONT_SANS,
                  boxShadow: `0 6px 18px ${COLORS.cyan}2e`,
                  cursor: "pointer",
                }}
              >
                <Download size={16} /> Descargar PDF
              </button>
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", fontSize: 10.5, color: COLORS.inkMuted, marginTop: 8, lineHeight: 1.5, fontFamily: FONT_SANS }}>
          No olvides ofrecer a todos tus clientes marcas estratégicas como la familia Mix, familia Baronet y la nueva familia Faritos para complementar su pedido.
        </div>
      </div>

      {showCapture && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: COLORS.pageBg, overflowY: "auto", padding: "24px 12px" }}>
          <div style={{ maxWidth: 420, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <button
                onClick={() => setShowCapture(false)}
                className="ct-btn-ghost"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 12,
                  backgroundColor: COLORS.inputBg,
                  border: `1px solid ${COLORS.line}`,
                  fontSize: 14,
                  color: COLORS.ink,
                  cursor: "pointer",
                }}
              >
                <X size={16} /> Cerrar
              </button>
            </div>

            <div style={{ ...cardBase, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: COLORS.logoBoxBg, border: `1px solid ${COLORS.line}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                  <img
                    src={LOGO_URL}
                    alt="Logo"
                    style={{ width: "100%", height: "100%", objectFit: "contain", padding: 5, boxSizing: "border-box" }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextSibling.style.display = "flex";
                    }}
                  />
                  <div style={{ display: "none", flexDirection: "column", alignItems: "center", gap: 1, color: COLORS.logoBoxText }}>
                    <Building2 size={12} />
                    <span style={{ fontSize: 5.5, fontFamily: FONT_MONO, textAlign: "center", lineHeight: 1.1 }}>ESPACIO<br />LOGO</span>
                  </div>
                </div>
                <div style={{ flex: 1, textAlign: "right", fontSize: 18, fontWeight: 800, letterSpacing: "0.08em", color: COLORS.ink }}>
                  COTIZADOR
                </div>
              </div>

              <div style={{ textAlign: "center", fontSize: 14, color: COLORS.inkMuted, marginBottom: 12 }}>
                Resumen de cotización
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: COLORS.inkMuted, borderBottom: `1px solid ${COLORS.line}`, paddingBottom: 8, marginBottom: 12, fontFamily: FONT_MONO }}>
                <span>Folio N.º {folio}</span>
                <span>{today}</span>
              </div>

              {sucursal && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 16 }}>
                  <span style={{ color: COLORS.inkMuted }}>Clo</span>
                  <span style={{ fontWeight: 600, color: COLORS.ink }}>{sucursal}</span>
                </div>
              )}

              {products.map((p) => (
                <div key={p.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: COLORS.ink }}>
                    <span>{p.tipo === "combo" ? p.principal.nombre : p.nombre}{p.tipo === "plc" && <span style={{ color: COLORS.gold }}> (PLC)</span>}</span>
                    <span>{p.tipo === "combo" ? cantidadTextoSimple(p.principal) : cantidadTextoSimple(p)}</span>
                  </div>
                  {p.tipo === "combo" && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, paddingLeft: 12, color: COLORS.gold }}>
                      <span>↳ PLC: {p.plc.nombre}</span>
                      <span style={{ color: COLORS.inkMuted }}>{cantidadTextoSimple(p.plc)}</span>
                    </div>
                  )}
                </div>
              ))}

              <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 12, marginTop: 8 }}>
                <ResultLine label="Paquetes PLC entregados" value={totals.paquetesPlc.toFixed(2)} />
                <ResultLine label="Bonificación total" value={fmt(totals.bonificacion)} />
                <ResultLine label="Desglose de distribución" value={fmt(totals.distribucion)} />
                <div style={{ borderTop: `1px solid ${COLORS.line}`, marginTop: 6, paddingTop: 6 }}>
                  <ResultLine label="TOTAL A COTIZAR" value={fmt(totalCotizar)} bold accent="green" />
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center", fontSize: 12, color: COLORS.inkMuted, marginTop: 16 }}>
              Toma la captura de pantalla de tu celular para guardar esta cotización.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Cotizador() {
  const [themeName, setThemeName] = useState("dark");

  useEffect(() => {
    (async () => {
      try {
        const pref = await window.storage.get("theme-preference");
        if (pref?.value === "light" || pref?.value === "dark") setThemeName(pref.value);
      } catch (e) {}
    })();
  }, []);

  const toggleTheme = () => {
    setThemeName((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      window.storage.set("theme-preference", next).catch(() => {});
      return next;
    });
  };

  const theme = themeName === "light" ? LIGHT_THEME : DARK_THEME;

  return (
    <ThemeContext.Provider value={theme}>
      <ThemeToggleContext.Provider value={toggleTheme}>
        <CotizadorInner />
      </ThemeToggleContext.Provider>
    </ThemeContext.Provider>
  );
}
