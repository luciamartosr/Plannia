"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft, Plus, Upload, Trash2, Pencil, Check, X,
  Users, UserCheck, UserX, Search,
} from "lucide-react";
import Header from "@/components/ui/Header";
import { useGuestStore, Guest, GuestType, RSVPStatus, Companion } from "@/stores/guests";

const RSVP_LABELS: Record<RSVPStatus, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  no_asiste: "No asiste",
};

const RSVP_COLORS: Record<RSVPStatus, string> = {
  pendiente: "bg-border text-muted",
  confirmado: "bg-accent/20 text-secondary",
  no_asiste: "bg-red-100 text-red-600",
};

// ─── CSV parser ───────────────────────────────────────────────
function parseCSV(text: string): Omit<Guest, "id">[] {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  // Skip header row
  return lines.slice(1).map((line, i) => {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const [firstName = "", lastName = "", typeRaw = "adulto", companionsRaw = "0", rsvpRaw = "pendiente"] = cols;
    const type: GuestType = typeRaw.toLowerCase().includes("niño") ? "niño" : "adulto";
    const companionCount = Math.max(0, parseInt(companionsRaw) || 0);
    const rsvp: RSVPStatus = ["confirmado", "no_asiste"].includes(rsvpRaw.toLowerCase())
      ? (rsvpRaw.toLowerCase() as RSVPStatus)
      : "pendiente";
    const companions: Companion[] = Array.from({ length: companionCount }, (_, ci) => ({
      id: `c-${i}-${ci}`,
      name: `Acompañante ${ci + 1}`,
      type: "adulto",
    }));
    return { firstName, lastName, type, companions, rsvp, notes: "" };
  }).filter((g) => g.firstName || g.lastName);
}

// ─────────────────────────────────────────────────────────────
export default function InvitadosPage() {
  const { guests, addGuest, updateGuest, removeGuest, setRSVP, importGuests } = useGuestStore();
  const [search, setSearch] = useState("");
  const [filterRSVP, setFilterRSVP] = useState<RSVPStatus | "todos">("todos");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Stats
  const totalPersons = guests.reduce((a, g) => a + 1 + g.companions.length, 0);
  const confirmedPersons = guests.filter((g) => g.rsvp === "confirmado")
    .reduce((a, g) => a + 1 + g.companions.length, 0);
  const noAsiste = guests.filter((g) => g.rsvp === "no_asiste")
    .reduce((a, g) => a + 1 + g.companions.length, 0);
  const adults = guests.filter((g) => g.type === "adulto").length
    + guests.flatMap((g) => g.companions).filter((c) => c.type === "adulto").length;
  const children = guests.filter((g) => g.type === "niño").length
    + guests.flatMap((g) => g.companions).filter((c) => c.type === "niño").length;

  // Filter
  const filtered = guests.filter((g) => {
    const name = `${g.firstName} ${g.lastName}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase());
    const matchRSVP = filterRSVP === "todos" || g.rsvp === filterRSVP;
    return matchSearch && matchRSVP;
  });

  // CSV import
  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    setImportError(""); setImportSuccess("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      setImportError("Solo se admiten archivos .csv. Exporta tu lista desde Excel como CSV.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        setImportError("No se encontraron invitados válidos. Asegúrate de usar el formato correcto.");
        return;
      }
      importGuests(parsed);
      setImportSuccess(`${parsed.length} invitado${parsed.length !== 1 ? "s" : ""} importado${parsed.length !== 1 ? "s" : ""} correctamente.`);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="flex-1 px-4 md:px-8 py-6 max-w-5xl mx-auto w-full">
        {/* Back */}
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors mb-5">
          <ArrowLeft size={16} /> Volver al panel
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
              Lista de invitados
            </h1>
            <p className="text-sm text-muted mt-0.5">{guests.length} invitados · {totalPersons} personas en total</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 text-xs font-semibold border-2 border-primary text-primary px-3 py-2.5 rounded-xl hover:bg-primary/5 transition-colors"
            >
              <Upload size={13} /> Importar CSV
            </button>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileImport} />
            <button
              onClick={() => { setShowAddForm(true); setEditId(null); }}
              className="flex items-center gap-1.5 text-xs font-semibold bg-primary text-white px-3 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
            >
              <Plus size={13} /> Agregar invitado
            </button>
          </div>
        </div>

        {/* Import feedback */}
        {importError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-4 py-3 flex items-center justify-between">
            {importError}
            <button onClick={() => setImportError("")}><X size={13} /></button>
          </div>
        )}
        {importSuccess && (
          <div className="mb-4 bg-accent/10 border border-accent/30 text-secondary text-xs rounded-xl px-4 py-3 flex items-center justify-between">
            ✅ {importSuccess}
            <button onClick={() => setImportSuccess("")}><X size={13} /></button>
          </div>
        )}

        {/* CSV format hint */}
        <div className="mb-4 bg-white border border-border rounded-xl px-4 py-3">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Formato CSV esperado</p>
          <p className="text-xs text-muted font-mono">nombre, apellido, tipo (adulto/niño), acompañantes (#), rsvp (pendiente/confirmado/no_asiste)</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { icon: <Users size={14} />, label: "Total personas", value: totalPersons, color: "text-primary" },
            { icon: <UserCheck size={14} />, label: "Confirmados", value: confirmedPersons, color: "text-secondary" },
            { icon: <UserX size={14} />, label: "No asiste", value: noAsiste, color: "text-red-500" },
            { icon: <Users size={14} />, label: "Adultos / Niños", value: `${adults} / ${children}`, color: "text-primary" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-border rounded-[var(--radius-card)] px-4 py-3">
              <div className="flex items-center gap-1 text-muted mb-1">{s.icon}<p className="text-[10px] font-bold uppercase tracking-wider">{s.label}</p></div>
              <p className={`text-xl font-extrabold ${s.color}`} style={{ fontFamily: "var(--font-display)" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text" placeholder="Buscar por nombre..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors bg-white"
            />
          </div>
          <div className="flex gap-1.5">
            {(["todos", "pendiente", "confirmado", "no_asiste"] as const).map((v) => (
              <button key={v} onClick={() => setFilterRSVP(v)}
                className={["px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all whitespace-nowrap",
                  filterRSVP === v ? "border-primary bg-primary text-white" : "border-border text-muted bg-white hover:border-primary/40",
                ].join(" ")}>
                {v === "todos" ? "Todos" : v === "no_asiste" ? "No asiste" : RSVP_LABELS[v]}
              </button>
            ))}
          </div>
        </div>

        {/* Add / Edit form */}
        {(showAddForm || editId) && (
          <GuestForm
            initial={editId ? guests.find((g) => g.id === editId) : undefined}
            onSave={(g) => {
              if (editId) { updateGuest(editId, g); setEditId(null); }
              else { addGuest(g); setShowAddForm(false); }
            }}
            onCancel={() => { setShowAddForm(false); setEditId(null); }}
          />
        )}

        {/* Table */}
        {guests.length === 0 ? (
          <div className="bg-white border border-border rounded-[var(--radius-card)] p-10 text-center">
            <Users size={36} className="text-muted mx-auto mb-3" />
            <p className="text-sm font-semibold text-primary mb-1">Aún no tienes invitados</p>
            <p className="text-xs text-muted mb-4">Agrégalos manualmente o importa una lista en formato CSV.</p>
            <button onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors">
              <Plus size={13} /> Agregar primer invitado
            </button>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-[var(--radius-card)] overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-2.5 bg-border/30 text-[10px] font-bold text-muted uppercase tracking-wider border-b border-border">
              <span>Invitado</span>
              <span className="text-center">Asistencia</span>
              <span />
            </div>

            <div className="divide-y divide-border">
              {filtered.map((guest) => (
                <GuestRow
                  key={guest.id}
                  guest={guest}
                  onEdit={() => { setEditId(guest.id); setShowAddForm(false); }}
                  onDelete={() => removeGuest(guest.id)}
                  onRSVP={(status) => setRSVP(guest.id, status)}
                />
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-sm text-muted text-center py-8">No hay invitados que coincidan.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Guest row
// ─────────────────────────────────────────────────────────────
function GuestRow({ guest, onEdit, onDelete, onRSVP }: {
  guest: Guest;
  onEdit: () => void;
  onDelete: () => void;
  onRSVP: (s: RSVPStatus) => void;
}) {
  const total = 1 + guest.companions.length;
  const adults = (guest.type === "adulto" ? 1 : 0) + guest.companions.filter((c) => c.type === "adulto").length;
  const children = (guest.type === "niño" ? 1 : 0) + guest.companions.filter((c) => c.type === "niño").length;

  function toggle(next: RSVPStatus) {
    // clicking the active state resets to pendiente
    onRSVP(guest.rsvp === next ? "pendiente" : next);
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-primary">{guest.firstName} {guest.lastName}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${guest.type === "niño" ? "bg-blue-50 text-blue-600" : "bg-border text-muted"}`}>
            {guest.type === "niño" ? "Niño" : "Adulto"}
          </span>
          <span className="text-[10px] text-muted">
            {total} persona{total !== 1 ? "s" : ""}
            {(adults > 0 || children > 0) && ` · ${adults > 0 ? `${adults} ad.` : ""}${adults > 0 && children > 0 ? " " : ""}${children > 0 ? `${children} niño${children !== 1 ? "s" : ""}` : ""}`}
          </span>
          {guest.notes && <span className="text-[10px] text-muted italic truncate max-w-[140px]">{guest.notes}</span>}
        </div>
      </div>

      {/* RSVP toggle buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => toggle("confirmado")}
          className={[
            "flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border-2 transition-all",
            guest.rsvp === "confirmado"
              ? "bg-accent/20 border-accent/40 text-secondary"
              : "bg-white border-border text-muted hover:border-accent/50 hover:text-secondary",
          ].join(" ")}
        >
          <Check size={12} />
          <span className="hidden sm:inline">Asiste</span>
        </button>
        <button
          onClick={() => toggle("no_asiste")}
          className={[
            "flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border-2 transition-all",
            guest.rsvp === "no_asiste"
              ? "bg-red-50 border-red-200 text-red-600"
              : "bg-white border-border text-muted hover:border-red-200 hover:text-red-500",
          ].join(" ")}
        >
          <X size={12} />
          <span className="hidden sm:inline">No asiste</span>
        </button>
      </div>

      {/* Edit / Delete */}
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onEdit} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-border/50 text-muted hover:text-primary transition-colors">
          <Pencil size={13} />
        </button>
        <button onClick={onDelete} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-muted hover:text-red-500 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Add / Edit form
// ─────────────────────────────────────────────────────────────
function GuestForm({ initial, onSave, onCancel }: {
  initial?: Guest;
  onSave: (g: Omit<Guest, "id">) => void;
  onCancel: () => void;
}) {
  const [firstName, setFirstName] = useState(initial?.firstName ?? "");
  const [lastName, setLastName] = useState(initial?.lastName ?? "");
  const [type, setType] = useState<GuestType>(initial?.type ?? "adulto");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [companions, setCompanions] = useState<Companion[]>(initial?.companions ?? []);
  const [rsvp, setRSVP] = useState<RSVPStatus>(initial?.rsvp ?? "pendiente");

  function addCompanion() {
    setCompanions((prev) => [...prev, { id: `c-${Date.now()}`, name: "", type: "adulto" }]);
  }

  function updateCompanion(id: string, patch: Partial<Companion>) {
    setCompanions((prev) => prev.map((c) => c.id === id ? { ...c, ...patch } : c));
  }

  function removeCompanion(id: string) {
    setCompanions((prev) => prev.filter((c) => c.id !== id));
  }

  function handleSave() {
    if (!firstName.trim() && !lastName.trim()) return;
    onSave({ firstName: firstName.trim(), lastName: lastName.trim(), type, companions, rsvp, notes });
  }

  return (
    <div className="bg-white border-2 border-primary/30 rounded-[var(--radius-card)] p-5 mb-5">
      <h3 className="text-sm font-extrabold text-primary mb-4" style={{ fontFamily: "var(--font-display)" }}>
        {initial ? "Editar invitado" : "Agregar invitado"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Nombre *</label>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Nombre"
            className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Apellido *</label>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Apellido"
            className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Tipo de invitado</label>
          <div className="flex gap-2">
            {(["adulto", "niño"] as GuestType[]).map((t) => (
              <button key={t} onClick={() => setType(t)}
                className={["flex-1 py-2 rounded-xl text-xs font-bold border-2 capitalize transition-all",
                  type === t ? "border-primary bg-primary text-white" : "border-border text-muted hover:border-primary/40",
                ].join(" ")}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">RSVP</label>
          <select value={rsvp} onChange={(e) => setRSVP(e.target.value as RSVPStatus)}
            className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors bg-white">
            <option value="pendiente">Pendiente</option>
            <option value="confirmado">Confirmado</option>
            <option value="no_asiste">No asiste</option>
          </select>
        </div>
      </div>

      <div className="mb-3">
        <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Notas (opcional)</label>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej: alergia a mariscos, vegetariano..."
          className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
      </div>

      {/* Companions */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-bold text-muted uppercase tracking-wider">
            Acompañantes ({companions.length})
          </label>
          <button onClick={addCompanion}
            className="flex items-center gap-1 text-[10px] font-bold text-primary border border-primary/30 px-2 py-1 rounded-lg hover:bg-primary/5 transition-colors">
            <Plus size={10} /> Agregar
          </button>
        </div>
        {companions.length > 0 && (
          <div className="flex flex-col gap-2">
            {companions.map((c) => (
              <div key={c.id} className="flex items-center gap-2 bg-border/20 rounded-xl px-3 py-2">
                <input value={c.name} onChange={(e) => updateCompanion(c.id, { name: e.target.value })}
                  placeholder={`Nombre del acompañante`}
                  className="flex-1 bg-transparent text-sm focus:outline-none text-primary placeholder:text-muted" />
                <div className="flex gap-1 shrink-0">
                  {(["adulto", "niño"] as GuestType[]).map((t) => (
                    <button key={t} onClick={() => updateCompanion(c.id, { type: t })}
                      className={["text-[9px] font-bold px-2 py-0.5 rounded-full border transition-all capitalize",
                        c.type === t ? "border-primary bg-primary text-white" : "border-border text-muted",
                      ].join(" ")}>
                      {t}
                    </button>
                  ))}
                </div>
                <button onClick={() => removeCompanion(c.id)} className="text-muted hover:text-red-500 transition-colors shrink-0">
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={handleSave} disabled={!firstName.trim() && !lastName.trim()}
          className="flex-1 bg-primary text-white text-sm font-bold py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50">
          {initial ? "Guardar cambios" : "Agregar invitado"}
        </button>
        <button onClick={onCancel}
          className="px-5 text-sm font-semibold text-muted border border-border rounded-xl hover:bg-border/40 transition-colors">
          Cancelar
        </button>
      </div>
    </div>
  );
}
