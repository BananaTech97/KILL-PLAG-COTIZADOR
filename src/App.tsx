import React, { useState, useEffect } from 'react';
import { jsPDF } from "jspdf";

const SERVICIOS = [
  { id: 'cuc', codigo: 'KP-01', nombre: 'Control de Cucaracha Germánica/Americana', icono: '🪳' },
  { id: 'chi', codigo: 'KP-02', nombre: 'Tratamiento contra Chinche de Cama', icono: '🛏️' },
  { id: 'ter', codigo: 'KP-03', nombre: 'Barrera Química contra Termita Subterránea', icono: '🛡️' },
  { id: 'roe', codigo: 'KP-04', nombre: 'Control y Reubicación de Roedores', icono: '🐀' },
  { id: 'san', codigo: 'KP-05', nombre: 'Sanitización y Desinfección de Alto Nivel', icono: '🧪' },
  { id: 'fum', codigo: 'KP-06', nombre: 'Fumigación Preventiva Residencial/Comercial', icono: '💨' },
  { id: 'ara', codigo: 'KP-07', nombre: 'Control de Arácnidos y Escorpiones', icono: '🦂' },
  { id: 'urg', codigo: 'KP-08', nombre: 'Servicio de Urgencia / Horario Especial', icono: '⚡' },
];

const fmt = (n) => new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

function useAnimatedNumber(target) {
  const [display, setDisplay] = useState(target);
  useEffect(() => {
    const start = display;
    const diff = target - start;
    if (diff === 0) return;
    const steps = 18;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplay(start + diff * (i / steps));
      if (i >= steps) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [target]);
  return display;
}

export default function App() {
  const [cliente, setCliente] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [items, setItems] = useState({});
  const [scanLine, setScanLine] = useState(false);
  const [logoB64, setLogoB64] = useState(null);

  // Carga el logo, recorta esquinas redondeadas y lo convierte a base64 para el PDF
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/logo-kill-plag.png'; // coloca el PNG en /public de tu proyecto Vite/CRA
    img.onload = () => {
      const size = Math.max(img.naturalWidth, img.naturalHeight);
      const radius = size * 0.12; // 12% de radio — ajusta a gusto
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      const w = img.naturalWidth, h = img.naturalHeight;
      // Trazamos un rectángulo redondeado como máscara de recorte
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(w - radius, 0);
      ctx.quadraticCurveTo(w, 0, w, radius);
      ctx.lineTo(w, h - radius);
      ctx.quadraticCurveTo(w, h, w - radius, h);
      ctx.lineTo(radius, h);
      ctx.quadraticCurveTo(0, h, 0, h - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 0, 0);
      setLogoB64(canvas.toDataURL('image/png'));
    };
  }, []);

  const toggleItem = (id) => {
    setItems(prev => {
      const next = { ...prev };
      if (next[id] !== undefined) delete next[id];
      else next[id] = '';
      return next;
    });
  };

  const setPrice = (id, val) => setItems(prev => ({ ...prev, [id]: val }));

  const selectedServicios = SERVICIOS.filter(s => items[s.id] !== undefined);
  const subtotal = selectedServicios.reduce((a, s) => a + Number(items[s.id] || 0), 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;
  const animTotal = useAnimatedNumber(total);

  const generarPDF = () => {
    setScanLine(true);
    setTimeout(() => setScanLine(false), 900);

    // Colores corporativos Kill Plag (azul marino del logo)
    const AZUL_MARINO = [10, 40, 90];   // #0a285a — el azul más oscuro del escudo
    const AZUL_MEDIO = [30, 80, 160];   // #1e50a0 — azul medio del logo
    const AZUL_CLARO = [220, 232, 248];  // #dce8f8 — fondo de filas alternas
    const BLANCO = [255, 255, 255];
    const GRIS_TEXTO = [50, 50, 50];
    const GRIS_LINEA = [200, 210, 225];

    const doc = new jsPDF();
    const folio = `KP-${Date.now().toString().slice(-6)}`;
    const fecha = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });

    // ── HEADER: fondo azul marino completo ──
    doc.setFillColor(...AZUL_MARINO);
    doc.rect(0, 0, 210, 48, 'F');

    // Franja acento azul medio en la base del header
    doc.setFillColor(...AZUL_MEDIO);
    doc.rect(0, 46, 210, 2, 'F');

    // Logo embebido en base64
    if (logoB64) {
      try { doc.addImage(logoB64, 'PNG', 8, 4, 38, 38); } catch (_) { }
    }

    // Nombre y eslogan a la derecha del logo
    doc.setTextColor(...BLANCO);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("KILL PLAG", 52, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(180, 205, 240);
    doc.text("FUMIGACIONES — MANEJO INTEGRAL DE PLAGAS Y SANITIZACIÓN", 52, 27);
    doc.text("Licencia Sanitaria No. 23 AP 09 015 0001", 52, 33);

    // Folio y fecha alineados a la derecha
    doc.setTextColor(160, 195, 235);
    doc.setFontSize(7.5);
    doc.text(`FOLIO: ${folio}`, 155, 38, { align: 'right' });
    doc.text(`FECHA: ${fecha}`, 200, 38, { align: 'right' });

    // ── TÍTULO DE DOCUMENTO ──
    doc.setFillColor(...AZUL_CLARO);
    doc.rect(0, 48, 210, 12, 'F');
    doc.setTextColor(...AZUL_MARINO);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("PROPUESTA DE SERVICIOS / COTIZACIÓN", 105, 57, { align: 'center' });

    // ── BLOQUE CLIENTE ──
    let y = 68;
    doc.setDrawColor(...GRIS_LINEA);
    doc.setLineWidth(0.3);
    doc.rect(15, y, 180, 20, 'S');

    doc.setFillColor(...AZUL_MARINO);
    doc.rect(15, y, 30, 20, 'F');
    doc.setTextColor(...BLANCO);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("CLIENTE", 30, y + 8, { align: 'center' });
    doc.text("UBICACIÓN", 30, y + 15, { align: 'center' });

    doc.setTextColor(...GRIS_TEXTO);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(cliente.toUpperCase() || "—", 50, y + 9);
    doc.setFontSize(8.5);
    doc.text(ubicacion || "—", 50, y + 16);

    // ── TABLA DE SERVICIOS ──
    y += 28;

    // Encabezado de tabla
    doc.setFillColor(...AZUL_MARINO);
    doc.rect(15, y, 180, 9, 'F');
    doc.setTextColor(...BLANCO);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("CÓD.", 20, y + 6);
    doc.text("DESCRIPCIÓN DEL SERVICIO", 38, y + 6);
    doc.text("IMPORTE (MXN)", 168, y + 6);
    y += 12;

    // Filas de servicios
    doc.setFont("helvetica", "normal");
    selectedServicios.forEach((s, idx) => {
      const rowH = 9;
      // Fila alterna
      if (idx % 2 === 0) {
        doc.setFillColor(...AZUL_CLARO);
        doc.rect(15, y - 6, 180, rowH, 'F');
      }
      // Línea divisora
      doc.setDrawColor(...GRIS_LINEA);
      doc.setLineWidth(0.2);
      doc.line(15, y + 3, 195, y + 3);

      doc.setFontSize(7.5);
      doc.setTextColor(...AZUL_MEDIO);
      doc.text(s.codigo, 20, y);

      doc.setTextColor(...GRIS_TEXTO);
      const txt = doc.splitTextToSize(s.nombre, 118);
      doc.text(txt, 38, y);

      doc.setFont("helvetica", "bold");
      doc.text(`$${fmt(items[s.id] || 0)}`, 192, y, { align: 'right' });
      doc.setFont("helvetica", "normal");

      y += txt.length > 1 ? 11 : rowH;
    });

    // ── BLOQUE TOTALES ──
    y += 6;
    doc.setDrawColor(...GRIS_LINEA);
    doc.setLineWidth(0.3);
    doc.line(120, y, 195, y);
    y += 7;

    doc.setFontSize(9);
    doc.setTextColor(...GRIS_TEXTO);
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", 135, y);
    doc.text(`$${fmt(subtotal)}`, 192, y, { align: 'right' });

    doc.text("IVA (16%):", 135, y + 8);
    doc.text(`$${fmt(iva)}`, 192, y + 8, { align: 'right' });

    // Caja total destacada
    doc.setFillColor(...AZUL_MARINO);
    doc.rect(120, y + 13, 75, 13, 'F');
    doc.setTextColor(...BLANCO);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("TOTAL NETO:", 135, y + 22);
    doc.text(`$${fmt(total)} MXN`, 192, y + 22, { align: 'right' });

    // ── NOTAS Y GARANTÍA ──
    y += 38;
    doc.setFillColor(...AZUL_CLARO);
    doc.rect(15, y, 180, 32, 'F');
    doc.setDrawColor(...AZUL_MEDIO);
    doc.setLineWidth(0.5);
    doc.line(15, y, 15, y + 32); // borde izquierdo acento

    doc.setTextColor(...AZUL_MARINO);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("CONDICIONES Y GARANTÍA", 22, y + 7);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRIS_TEXTO);
    doc.setFontSize(7.5);
    doc.text("• Resultados tangibles en los primeros tres meses de servicio continuo.", 22, y + 14);
    doc.text("• Mínimo impacto en áreas verdes, fauna benéfica y estructura del inmueble.", 22, y + 20);
    doc.text("• Propuesta válida por 30 días naturales a partir de la fecha de emisión.", 22, y + 26);

    // ── FOOTER DEL PDF ──
    doc.setFillColor(...AZUL_MARINO);
    doc.rect(0, 282, 210, 15, 'F');
    doc.setTextColor(160, 195, 235);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("Kill Plag Fumigaciones  ·  Licencia Sanitaria No. 23 AP 09 015 0001", 105, 289, { align: 'center' });
    doc.text("Generado con Banana-Tech Systems © 2026", 105, 294, { align: 'center' });

    doc.save(`KillPlag_Cotizacion_${cliente || 'Cliente'}_${folio}.pdf`);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow+Condensed:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #080d14; --surface: #0e1520; --border: #1a2a1a;
          --green: #4ade80; --green-dim: #22543d; --green-glow: rgba(74,222,128,0.15);
          --text: #d1fae5; --muted: #4b7a5a;
          --mono: 'Share Tech Mono', monospace; --display: 'Barlow Condensed', sans-serif;
        }
        body { background: var(--bg); color: var(--text); }
        .app-wrap {
          min-height: 100vh; background: var(--bg);
          background-image:
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(74,222,128,0.07) 0%, transparent 60%),
            repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(74,222,128,0.025) 39px, rgba(74,222,128,0.025) 40px),
            repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(74,222,128,0.015) 39px, rgba(74,222,128,0.015) 40px);
          font-family: var(--display); padding: 2rem 1rem 4rem;
        }
        .card {
          max-width: 760px; margin: 0 auto; background: var(--surface);
          border: 1px solid var(--border); border-radius: 4px; overflow: hidden;
          box-shadow: 0 0 60px rgba(74,222,128,0.05), 0 0 0 1px rgba(74,222,128,0.03);
        }
        .header {
          background: linear-gradient(135deg,#050a0a 0%,#0a1a10 100%);
          padding: 2.5rem 2.5rem 2rem; border-bottom: 1px solid var(--border);
          position: relative; overflow: hidden;
        }
        .header::after {
          content:''; position:absolute; bottom:0; left:0; right:0; height:2px;
          background: linear-gradient(90deg,transparent,var(--green),transparent);
        }
        .header-badge {
          font-family:var(--mono); font-size:0.63rem; color:var(--muted);
          letter-spacing:0.1em; margin-bottom:1rem; display:flex; align-items:center; gap:0.5rem;
        }
        .header-badge::before {
          content:''; display:inline-block; width:6px; height:6px;
          background:var(--green); border-radius:50%; box-shadow:0 0 6px var(--green);
          animation: blink 2s infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
        .header h1 {
          font-family:var(--display); font-size:3.2rem; font-weight:800;
          letter-spacing:0.05em; color:var(--green); line-height:1;
          text-shadow:0 0 30px rgba(74,222,128,0.4);
        }
        .header-sub { font-family:var(--mono); font-size:0.68rem; color:var(--muted); margin-top:0.4rem; letter-spacing:0.07em; }
        .header-deco { position:absolute; right:2rem; top:50%; transform:translateY(-50%); font-size:5rem; opacity:0.05; user-select:none; pointer-events:none; }
        .body { padding:2rem 2.5rem; display:flex; flex-direction:column; gap:2.5rem; }
        .section-label { display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem; }
        .section-num {
          font-family:var(--mono); font-size:0.63rem; color:var(--green);
          background:var(--green-dim); border:1px solid rgba(74,222,128,0.2);
          width:1.6rem; height:1.6rem; border-radius:2px;
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
        }
        .section-label h2 {
          font-family:var(--display); font-size:1rem; font-weight:700;
          letter-spacing:0.12em; text-transform:uppercase; color:var(--text);
        }
        .inputs-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
        @media(max-width:540px){ .inputs-grid{grid-template-columns:1fr;} }
        .field-wrap { display:flex; flex-direction:column; gap:0.35rem; }
        .field-label { font-family:var(--mono); font-size:0.6rem; color:var(--muted); letter-spacing:0.1em; }
        .field-input {
          background:var(--bg); border:1px solid var(--border); border-radius:2px;
          color:var(--text); font-family:var(--mono); font-size:0.85rem;
          padding:0.75rem 1rem; outline:none; transition:border-color .2s, box-shadow .2s; width:100%;
        }
        .field-input::placeholder { color:var(--muted); }
        .field-input:focus { border-color:var(--green); box-shadow:0 0 0 3px var(--green-glow); }
        .list-container { border:1px solid var(--border); border-radius:2px; overflow:hidden; }
.service-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background .15s;
  flex-wrap: wrap;  /* ← añade esto */
}

.svc-name {
  flex: 1;
  font-family: var(--display);
  font-size: 0.92rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #6b9e7a;
  transition: color .15s;
  line-height: 1.3;
  min-width: 0;  /* ← añade esto */
}

.svc-price-wrap {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  overflow: hidden;
  max-width: 0;
  opacity: 0;
  transition: max-width .25s ease, opacity .2s ease;
  width: 100%;        /* ← añade esto */
  padding-left: 2.5rem; /* ← sangría para alinear bajo el nombre */
}

.service-row.active .svc-price-wrap {
  max-width: 100%;   /* ← cambia de 140px a 100% */
  opacity: 1;
}

.svc-price-input {
  background: var(--bg);
  border: 1px solid var(--green-dim);
  border-radius: 2px;
  color: var(--green);
  font-family: var(--mono);
  font-size: 0.85rem;
  padding: 0.4rem 0.5rem;
  width: 140px;      /* ← ancho fijo cómodo */
  outline: none;
  text-align: right;
  transition: border-color .2s, box-shadow .2s;
}
        .svc-price-input:focus { border-color:var(--green); box-shadow:0 0 0 2px var(--green-glow); }
        .svc-price-input::-webkit-inner-spin-button, .svc-price-input::-webkit-outer-spin-button { -webkit-appearance:none; }
        .totals-panel {
          background:var(--bg); border:1px solid var(--border); border-radius:2px;
          padding:1.25rem 1.5rem; display:flex; flex-direction:column; gap:0.5rem;
        }
        .totals-row { display:flex; justify-content:space-between; align-items:center; }
        .totals-label { font-family:var(--mono); font-size:0.7rem; color:var(--muted); letter-spacing:0.08em; text-transform:uppercase; }
        .totals-val { font-family:var(--mono); font-size:0.85rem; color:#a3e4b8; }
        .totals-divider { height:1px; background:var(--border); margin:0.4rem 0; }
        .totals-total-label { font-family:var(--display); font-size:1rem; font-weight:700; letter-spacing:0.1em; color:var(--green); text-transform:uppercase; }
        .totals-total-val { font-family:var(--mono); font-size:1.3rem; color:var(--green); text-shadow:0 0 12px rgba(74,222,128,0.5); }
        .btn-generate {
          width:100%; background:var(--green); color:#050a0a; border:none; border-radius:2px;
          padding:1.1rem 2rem; font-family:var(--display); font-size:1.1rem; font-weight:800;
          letter-spacing:0.15em; text-transform:uppercase; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:0.75rem; transition:all .2s;
        }
        .btn-generate:hover { background:#86efac; box-shadow:0 0 30px rgba(74,222,128,0.3); transform:translateY(-1px); }
        .btn-generate:active { transform:scale(0.98); }
        .scan-overlay { position:fixed; inset:0; pointer-events:none; z-index:9999; overflow:hidden; }
        .scan-line {
          position:absolute; left:0; right:0; height:3px;
          background:linear-gradient(90deg,transparent,var(--green),transparent);
          box-shadow:0 0 20px var(--green); animation:scan .9s ease-in-out forwards;
        }
        @keyframes scan { 0%{top:0%;opacity:1} 90%{top:100%;opacity:1} 100%{top:100%;opacity:0} }
        .footer { text-align:center; padding:2rem 1rem; font-family:var(--mono); font-size:0.6rem; color:var(--muted); letter-spacing:0.1em; }
        .hint { font-family:var(--mono); font-size:0.6rem; color:var(--muted); text-align:center; margin-top:0.75rem; letter-spacing:0.08em; }
      `}</style>

      {scanLine && <div className="scan-overlay"><div className="scan-line" /></div>}

      <div className="app-wrap">
        <div className="card">

          <div className="header">
            <div className="header-badge">SISTEMA DE COTIZACIÓN // KILL PLAG // v2.0</div>
            <h1>KILL PLAG</h1>
            <p className="header-sub">MANEJO INTEGRAL DE PLAGAS Y SANITIZACIÓN · LIC. 23 AP 09 015 0001</p>
            <div className="header-deco">🛡️</div>
          </div>

          <div className="body">

            <section>
              <div className="section-label">
                <span className="section-num">01</span>
                <h2>Identificación del Cliente</h2>
              </div>
              <div className="inputs-grid">
                <div className="field-wrap">
                  <label className="field-label">// nombre o empresa</label>
                  <input className="field-input" placeholder="Ej. Restaurante El Nogal"
                    value={cliente} onChange={e => setCliente(e.target.value)} />
                </div>
                <div className="field-wrap">
                  <label className="field-label">// dirección / ubicación</label>
                  <input className="field-input" placeholder="Ej. Av. Morelos 214, Col. Centro"
                    value={ubicacion} onChange={e => setUbicacion(e.target.value)} />
                </div>
              </div>
            </section>

            <section>
              <div className="section-label">
                <span className="section-num">02</span>
                <h2>Selección de Tratamientos</h2>
              </div>
              <div className="list-container">
                {SERVICIOS.map(s => {
                  const active = items[s.id] !== undefined;
                  return (
                    <div key={s.id} className={`service-row${active ? ' active' : ''}`}
                      onClick={() => toggleItem(s.id)}>
                      <div className="svc-check">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="#050a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="svc-code">{s.codigo}</span>
                      <span className="svc-icon">{s.icono}</span>
                      <span className="svc-name">{s.nombre}</span>
                      <div className="svc-price-wrap" onClick={e => e.stopPropagation()}>
                        <span className="svc-price-sym">$</span>
                        <input type="number" className="svc-price-input" placeholder="0.00"
                          value={items[s.id] || ''} onChange={e => setPrice(s.id, e.target.value)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="section-label">
                <span className="section-num">03</span>
                <h2>Resumen Económico</h2>
              </div>
              <div className="totals-panel">
                <div className="totals-row">
                  <span className="totals-label">Subtotal</span>
                  <span className="totals-val">${fmt(subtotal)} MXN</span>
                </div>
                <div className="totals-row">
                  <span className="totals-label">IVA (16%)</span>
                  <span className="totals-val">${fmt(iva)} MXN</span>
                </div>
                <div className="totals-divider" />
                <div className="totals-row">
                  <span className="totals-total-label">Total Neto</span>
                  <span className="totals-total-val">${fmt(animTotal)} MXN</span>
                </div>
              </div>
            </section>

            <div>
              <button className="btn-generate" onClick={generarPDF}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="9" y1="13" x2="15" y2="13" />
                  <line x1="9" y1="17" x2="15" y2="17" />
                </svg>
                Emitir Propuesta Profesional
              </button>
              <p className="hint">IVA INCLUIDO · MONEDA: PESO MEXICANO (MXN) · VÁLIDO 30 DÍAS</p>
            </div>

          </div>
        </div>

        <div className="footer">© 2026 BANANA-TECH SYSTEMS · DESARROLLADO PARA KILL PLAG FUMIGACIONES</div>
      </div>
    </>
  );
}