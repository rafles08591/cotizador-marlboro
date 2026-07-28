// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Trash2, Save, RotateCcw, FolderOpen, X, Check, PlusCircle, Download, Camera } from "lucide-react";

const COLORS = {
  headerBg: "#0A0A0A",
  pageBg: "#F8F5F0",
  cardBg: "#FFFCFA",
  ink: "#1A1A1A",
  inkMuted: "#6B6B6B",
  red: "#C8102E",
  green: "#1F7A4D",
  greenDark: "#0F4C2E",
  gold: "#A5711F",
  line: "#E8E4DE",
};

const FONT_SANS = "'Inter', -apple-system, system-ui, sans-serif";
const FONT_MONO = FONT_SANS;

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

function NumField({ label, value, onChange }) {
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
        style={{
          width: "100%",
          boxSizing: "border-box",
          borderRadius: 12,
          padding: "10px 12px",
          fontSize: 15,
          backgroundColor: "#F1ECDF",
          color: COLORS.ink,
          border: `1px solid ${COLORS.line}`,
          fontFamily: FONT_MONO,
          outline: "none",
        }}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, placeholder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: COLORS.inkMuted, fontFamily: FONT_SANS }}>
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          borderRadius: 12,
          padding: "10px 12px",
          fontSize: 14,
          backgroundColor: "#F1ECDF",
          color: value ? COLORS.ink : COLORS.inkMuted,
          border: `1px solid ${COLORS.line}`,
          fontFamily: FONT_SANS,
          outline: "none",
        }}
      >
        <option value="">{placeholder}</option>
        {CATALOGO.map((c) => (
          <option key={c.id} value={c.id}>{c.nombre}</option>
        ))}
      </select>
    </div>
  );
}

function ResultLine({ label, value, bold, accent }) {
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
        fontSize: 13,
        color: accent === "green" ? COLORS.green : accent === "red" ? COLORS.red : COLORS.ink,
        fontFamily: FONT_MONO,
        fontWeight: bold ? 700 : 500,
      }}>
        {value}
      </span>
    </div>
  );
}

function cantidadTextoSimple(p) {
  const paquetes = Number(p.cantidadPaquetes) || 0;
  const cajetillas = Number(p.cantidadCajetillas) || 0;
  const partes = [];
  if (paquetes) partes.push(`${paquetes} paq`);
  if (cajetillas) partes.push(`${cajetillas} caj`);
  return partes.length ? partes.join(" + ") : "0";
}

function AddProductForm({ onAdd, sucursal, sucursalFalta }) {
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
    <div style={{ backgroundColor: COLORS.cardBg, border: `1px solid ${COLORS.line}`, borderRadius: 16, padding: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: COLORS.inkMuted, fontFamily: FONT_MONO }}>
          Agregar producto
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.ink, fontFamily: FONT_SANS }}>Producto principal</div>
          <SelectField label="Producto" value={principalId} onChange={setPrincipalId} placeholder="Selecciona un producto" />
          {principal && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "8px 12px", borderRadius: 12, backgroundColor: "#F1ECDF", color: COLORS.inkMuted, fontFamily: FONT_MONO }}>
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
          <SelectField label="Producto PLC" value={plcId} onChange={setPlcId} placeholder="Ninguno" />
          {plc && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "8px 12px", borderRadius: 12, backgroundColor: "#F1ECDF", color: COLORS.inkMuted, fontFamily: FONT_MONO }}>
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
          <div style={{ fontSize: 13, color: COLORS.red, fontFamily: FONT_MONO }}>
            Selecciona un Clo antes de agregar productos.
          </div>
        )}

        <button
          onClick={handleAdd}
          disabled={(!principalId && !plcId) || sucursalFalta}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            backgroundColor: COLORS.red,
            color: "#fff",
            border: "none",
            borderRadius: 16,
            padding: "13px 16px",
            fontSize: 15,
            fontWeight: 600,
            fontFamily: FONT_SANS,
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
  if (product.tipo === "combo") {
    const r = calcCombo(product, sucursal);
    const updatePrincipal = (field, value) => onChange({ ...product, principal: { ...product.principal, [field]: value } });
    const updatePlc = (field, value) => onChange({ ...product, plc: { ...product.plc, [field]: value } });

    return (
      <div style={{ backgroundColor: COLORS.cardBg, border: `1px solid ${COLORS.line}`, borderRadius: 16, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.ink, fontFamily: FONT_SANS }}>{product.principal.nombre}</div>
            <div style={{ fontSize: 11, color: COLORS.inkMuted, fontFamily: FONT_MONO, marginTop: 2 }}>
              Cajetillas x paquete: {product.principal.cajetillasPorPaquete} · <span style={{ color: COLORS.gold }}>+ PLC: {product.plc.nombre}</span>
            </div>
          </div>
          <button onClick={onRemove} style={{ color: COLORS.red, background: "none", border: "none", padding: 4 }}>
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
          <ResultLine label="Desglose de distribución" value={`${r.cajetillasPlc.toFixed(2)} caj × ${fmt(costoDistribucionPorClo(sucursal))} = ${fmt(r.distribucion)}`} accent="red" />
          <ResultLine label="Bonificación (PLC)" value={fmt(r.bonificacion)} accent="red" />
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
    <div style={{ backgroundColor: COLORS.cardBg, border: `1px solid ${COLORS.line}`, borderRadius: 16, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.ink, fontFamily: FONT_SANS }}>{product.nombre}</div>
          <div style={{ fontSize: 11, color: COLORS.inkMuted, fontFamily: FONT_MONO, marginTop: 2 }}>
            Cajetillas x paquete: {product.cajetillasPorPaquete}
            {isPlc && <span style={{ color: COLORS.gold }}> · PLC / sin costo</span>}
          </div>
        </div>
        <button onClick={onRemove} style={{ color: COLORS.red, background: "none", border: "none", padding: 4 }}>
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
            <ResultLine label="Bonificación (cantidad × precio de lista)" value={fmt(r.bonificacion)} bold accent="red" />
            <ResultLine label="Desglose de distribución" value={fmt(r.distribucion)} accent="red" />
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

export default function Cotizador() {
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
            <td style="padding-left:16px;color:#A5711F">↳ PLC: ${escapeHtml(p.plc.nombre)}</td>
            <td style="text-align:right">${escapeHtml(cantidadTextoSimple(p.plc))}</td>
          </tr>`;
        }
        return `<tr>
          <td>${escapeHtml(p.nombre)}${p.tipo === "plc" ? ' <span style="color:#A5711F">(PLC)</span>' : ""}</td>
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
    body { font-family: -apple-system, system-ui, sans-serif; background:#F8F5F0; padding:24px; color:#1A1A1A; }
    .ticket { max-width:420px; margin:0 auto; background:#FFFCFA; padding:24px; border-radius:16px; border:1px solid #E8E4DE; }
    h1 { text-align:center; font-size:20px; margin:0 0 8px; background:#0A0A0A; color:#fff; padding:12px; border-radius:12px; }
    .sub { text-align:center; font-size:12px; color:#6B6B6B; margin-bottom:12px; }
    .meta { display:flex; justify-content:space-between; font-size:12px; color:#6B6B6B; border-top:1px solid #E8E4DE; padding-top:8px; margin-top:8px; }
    table { width:100%; border-collapse:collapse; margin-top:16px; font-size:13px; }
    td { padding:5px 0; }
    .totales td { border-top:1px solid #E8E4DE; padding-top:8px; color:#C8102E; font-weight:600; }
    .total-final td { font-weight:800; font-size:16px; color:#1F7A4D; border-top:1px solid #E8E4DE; padding-top:8px; }
  </style>
</head>
<body>
  <div class="ticket">
    <h1>COTIZADOR</h1>
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

  return (
    <div style={{ minHeight: "100vh", width: "100%", display: "flex", justifyContent: "center", padding: "24px 12px", backgroundColor: COLORS.pageBg, fontFamily: FONT_SANS }}>
      <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 16 }}>
        
        <div>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: COLORS.inkMuted, marginBottom: 4 }}>
            Clo <span style={{ color: COLORS.red }}>*</span>
          </div>
          <select
            value={sucursal}
            onChange={(e) => setSucursal(e.target.value)}
            style={{
              borderRadius: 12,
              padding: "8px 12px",
              fontSize: 14,
              backgroundColor: COLORS.cardBg,
              color: sucursal ? COLORS.ink : COLORS.inkMuted,
              border: `1px solid ${sucursal ? COLORS.line : COLORS.red}`,
              fontFamily: FONT_SANS,
              width: "100%",
              maxWidth: 200,
            }}
          >
            <option value="" disabled>Selecciona</option>
            {SUCURSALES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.06em", color: COLORS.ink }}>COTIZADOR</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 8, borderTop: `1px solid ${COLORS.line}`, fontSize: 11, color: COLORS.inkMuted }}>
            <span>Folio N.º {folio}</span>
            <span>{today}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowSaveInput(s => !s)} disabled={!sucursal} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 12px", borderRadius: 12, backgroundColor: COLORS.cardBg, border: `1px solid ${COLORS.line}`, fontSize: 13, opacity: !sucursal ? 0.4 : 1 }}>
            <Save size={16} /> Guardar
          </button>
          <button onClick={() => setShowSavedList(s => !s)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 12px", borderRadius: 12, backgroundColor: COLORS.cardBg, border: `1px solid ${COLORS.line}`, fontSize: 13 }}>
            <FolderOpen size={16} /> Guardadas
          </button>
          <button onClick={resetQuote} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "9px 12px", borderRadius: 12, backgroundColor: COLORS.cardBg, border: `1px solid ${COLORS.line}`, color: COLORS.red }}>
            <RotateCcw size={16} />
          </button>
        </div>

        {status && (
          <div style={{ textAlign: "center", fontSize: 12, padding: 8, borderRadius: 12, backgroundColor: COLORS.cardBg, color: COLORS.green }}>
            {status}
          </div>
        )}

        {showSaveInput && (
          <div style={{ display: "flex", gap: 8, padding: 12, borderRadius: 12, backgroundColor: COLORS.cardBg, border: `1px solid ${COLORS.line}` }}>
            <input
              type="text"
              autoFocus
              placeholder={`Cotización ${folio}`}
              value={quoteName}
              onChange={(e) => setQuoteName(e.target.value)}
              style={{ flex: 1, border: "none", outline: "none", fontSize: 14, background: "transparent" }}
            />
            <button onClick={confirmSave} style={{ color: COLORS.green, background: "none", border: "none" }}><Check size={18} /></button>
            <button onClick={() => setShowSaveInput(false)} style={{ color: COLORS.inkMuted, background: "none", border: "none" }}><X size={18} /></button>
          </div>
        )}

        {showSavedList && (
          <div style={{ padding: 12, borderRadius: 12, backgroundColor: COLORS.cardBg, border: `1px solid ${COLORS.line}` }}>
            {savedQuotes.length === 0 ? (
              <div style={{ fontSize: 12, color: COLORS.inkMuted }}>Aún no hay cotizaciones guardadas.</div>
            ) : (
              savedQuotes.map((q) => (
                <div key={q.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <button onClick={() => loadQuote(q)} style={{ background: "none", border: "none", textAlign: "left", fontSize: 13, color: COLORS.ink }}>
                    {q.name} <span style={{ color: COLORS.inkMuted }}>· {q.date}</span>
                  </button>
                  <button onClick={() => deleteSavedQuote(q.id)} style={{ color: COLORS.red, background: "none", border: "none" }}><Trash2 size={14} /></button>
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
          <div style={{ backgroundColor: COLORS.cardBg, border: `1px solid ${COLORS.line}`, borderRadius: 16, padding: 16 }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: COLORS.inkMuted, marginBottom: 12 }}>
              Resumen de cotización
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
              <ResultLine label="Bonificación total" value={fmt(totals.bonificacion)} accent="red" />
              <ResultLine label="Desglose de distribución" value={fmt(totals.distribucion)} accent="red" />
              <div style={{ borderTop: `1px solid ${COLORS.line}`, marginTop: 6, paddingTop: 6 }}>
                <ResultLine label="TOTAL A COTIZAR" value={fmt(totalCotizar)} bold accent="green" />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button
                onClick={() => setShowCapture(true)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "12px",
                  borderRadius: 14,
                  backgroundColor: COLORS.cardBg,
                  border: `1px solid ${COLORS.line}`,
                  fontSize: 14,
                  fontWeight: 600,
                  color: COLORS.ink,
                  fontFamily: FONT_SANS,
                }}
              >
                <Camera size={16} /> Capturar pantalla
              </button>

              <button
                onClick={descargarResumenHtml}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "12px",
                  borderRadius: 14,
                  backgroundColor: COLORS.greenDark,
                  border: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#fff",
                  fontFamily: FONT_SANS,
                }}
              >
                <Download size={16} /> Descargar PDF
              </button>
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", fontSize: 11, color: COLORS.inkMuted, marginTop: 8, lineHeight: 1.4 }}>
          NO OLVIDES OFRECER A TODOS TUS CLIENTES MARCAS ESTRATÉGICAS COMO LA FAMILIA MIX, FAMILIA BARONET Y LA NUEVA FAMILIA FARITOS PARA COMPLEMENTAR SU PEDIDO
        </div>
      </div>

      {showCapture && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: COLORS.pageBg, overflowY: "auto", padding: "24px 12px" }}>
          <div style={{ maxWidth: 420, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <button
                onClick={() => setShowCapture(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 12,
                  backgroundColor: COLORS.cardBg,
                  border: `1px solid ${COLORS.line}`,
                  fontSize: 14,
                }}
              >
                <X size={16} /> Cerrar
              </button>
            </div>

            <div style={{ backgroundColor: COLORS.cardBg, border: `1px solid ${COLORS.line}`, borderRadius: 16, padding: 20 }}>
              <div style={{ backgroundColor: COLORS.headerBg, borderRadius: 12, padding: "12px 0", marginBottom: 16 }}>
                <div style={{ textAlign: "center", color: "#fff", fontSize: 18, fontWeight: 700, letterSpacing: "0.06em" }}>
                  COTIZADOR
                </div>
              </div>

              <div style={{ textAlign: "center", fontSize: 14, color: COLORS.inkMuted, marginBottom: 12 }}>
                Resumen de cotización
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: COLORS.inkMuted, borderBottom: `1px solid ${COLORS.line}`, paddingBottom: 8, marginBottom: 12 }}>
                <span>Folio N.º {folio}</span>
                <span>{today}</span>
              </div>

              {sucursal && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 16 }}>
                  <span style={{ color: COLORS.inkMuted }}>Clo</span>
                  <span style={{ fontWeight: 600 }}>{sucursal}</span>
                </div>
              )}

              {products.map((p) => (
                <div key={p.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
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
                <ResultLine label="Bonificación total" value={fmt(totals.bonificacion)} accent="red" />
                <ResultLine label="Desglose de distribución" value={fmt(totals.distribucion)} accent="red" />
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