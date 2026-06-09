"use client";

import { useState } from "react";
import {
  startOfMonth, endOfMonth, eachDayOfInterval, getDay,
  addMonths, subMonths, isSameDay, isBefore, startOfDay,
  format, isToday,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  ChevronLeft, ChevronRight, CalendarDays, Video, Phone,
  MapPin, CheckCircle2, X, Clock,
} from "lucide-react";
import { useAppointmentsStore, Appointment } from "@/stores/appointments";

// ─── Fake occupied slots (deterministic from day-of-month) ─────────────────
function getOccupiedSlots(date: Date): string[] {
  const d = date.getDate();
  const baseSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];
  // occupy roughly 40–60% of slots based on day number
  return baseSlots.filter((_, i) => (i + d) % 3 !== 0);
}

const ALL_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00",
];

const MEETING_TYPES: { value: Appointment["type"]; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: "presencial",   label: "Presencial",    icon: <MapPin size={14} />,   desc: "En las oficinas del proveedor" },
  { value: "videollamada", label: "Videollamada",  icon: <Video size={14} />,    desc: "Por Zoom, Meet o WhatsApp" },
  { value: "llamada",      label: "Llamada",       icon: <Phone size={14} />,    desc: "Coordinación telefónica" },
];

interface Props {
  providerId: string;
  providerName: string;
}

type Step = "calendar" | "form" | "confirmed";

export default function BookingCalendar({ providerId, providerName }: Props) {
  const today = startOfDay(new Date());
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("calendar");
  const [meetingType, setMeetingType] = useState<Appointment["type"]>("presencial");

  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  const { addAppointment, appointments } = useAppointmentsStore();

  // Already-booked slots for selected date from real store
  const bookedForDay = selectedDate
    ? appointments
        .filter((a) => a.providerId === providerId && a.date === format(selectedDate, "yyyy-MM-dd") && a.status !== "cancelada")
        .map((a) => a.time)
    : [];

  // Calendar grid
  const firstDay = startOfMonth(month);
  const lastDay = endOfMonth(month);
  const days = eachDayOfInterval({ start: firstDay, end: lastDay });
  const startPad = getDay(firstDay); // 0 = Sunday

  // Available slots for selected date
  const occupied = selectedDate ? [...getOccupiedSlots(selectedDate), ...bookedForDay] : [];
  const available = ALL_SLOTS.filter((s) => !occupied.includes(s));

  function handleDayClick(day: Date) {
    if (isBefore(day, today)) return;
    if (getDay(day) === 0) return; // no Sundays
    setSelectedDate(day);
    setSelectedTime(null);
    setStep("calendar");
  }

  function handleContinue() {
    if (!selectedDate || !selectedTime) return;
    setStep("form");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !name.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800)); // simulate API call
    const id = addAppointment({
      providerId,
      providerName,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: selectedTime,
      type: meetingType,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      notes: notes.trim(),
    });
    setConfirmedId(id);
    setLoading(false);
    setStep("confirmed");
  }

  function resetBooking() {
    setStep("calendar");
    setSelectedDate(null);
    setSelectedTime(null);
    setName(""); setPhone(""); setEmail(""); setNotes("");
    setMeetingType("videollamada");
    setConfirmedId(null);
  }

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <div className="bg-white border border-border rounded-[var(--radius-card)] overflow-hidden">
      {/* Header */}
      <div className="bg-primary/5 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-primary" />
          <div>
            <h2 className="font-bold text-primary text-sm" style={{ fontFamily: "var(--font-display)" }}>
              Agendar cita
            </h2>
            <p className="text-xs text-muted">Reserva una reunión con {providerName}</p>
          </div>
        </div>
      </div>

      <div className="p-5">

        {/* ── STEP: CONFIRMED ─────────────────────────────────── */}
        {step === "confirmed" && selectedDate && selectedTime && (
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
              <CheckCircle2 size={28} className="text-secondary" />
            </div>
            <div>
              <p className="font-bold text-primary text-base mb-1" style={{ fontFamily: "var(--font-display)" }}>
                ¡Cita agendada!
              </p>
              <p className="text-sm text-muted leading-relaxed">
                Tu solicitud fue enviada a <strong className="text-primary">{providerName}</strong>.
                Te contactarán para confirmar.
              </p>
            </div>
            <div className="bg-primary/5 rounded-xl px-5 py-3 text-sm w-full text-left flex flex-col gap-1">
              <div className="flex items-center gap-2 font-semibold text-primary">
                <CalendarDays size={14} />
                {format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}
              </div>
              <div className="flex items-center gap-2 text-muted">
                <Clock size={14} />
                {selectedTime} hrs · {MEETING_TYPES.find(m => m.value === meetingType)?.label}
              </div>
              <div className="flex items-center gap-2 text-muted">
                {MEETING_TYPES.find(m => m.value === meetingType)?.icon}
                {MEETING_TYPES.find(m => m.value === meetingType)?.desc}
              </div>
            </div>
            <p className="text-xs text-muted">
              Referencia: <span className="font-mono text-primary">{confirmedId}</span>
            </p>
            <button
              onClick={resetBooking}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Agendar otra cita
            </button>
          </div>
        )}

        {/* ── STEP: FORM ─────────────────────────────────────── */}
        {step === "form" && selectedDate && selectedTime && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Summary bar */}
            <div className="bg-primary/5 rounded-xl px-4 py-3 flex items-start justify-between gap-2">
              <div className="text-xs">
                <p className="font-bold text-primary capitalize">
                  {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                </p>
                <p className="text-muted">{selectedTime} hrs</p>
              </div>
              <button
                type="button"
                onClick={() => setStep("calendar")}
                className="text-muted hover:text-primary transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Meeting type */}
            <div>
              <p className="text-xs font-semibold text-primary mb-2">Tipo de reunión</p>
              <div className="grid grid-cols-3 gap-2">
                {MEETING_TYPES.map((mt) => (
                  <button
                    key={mt.value}
                    type="button"
                    onClick={() => setMeetingType(mt.value)}
                    className={[
                      "flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border-2 text-center transition-all",
                      meetingType === mt.value
                        ? "border-primary bg-primary/8 text-primary"
                        : "border-border text-muted hover:border-primary/40",
                    ].join(" ")}
                  >
                    {mt.icon}
                    <span className="text-[10px] font-semibold leading-tight">{mt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Contact fields */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-primary block mb-1">Nombre completo *</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. María García"
                  className="w-full text-sm border border-border rounded-[var(--radius-btn)] px-3 py-2 focus:outline-none focus:border-primary bg-white text-primary placeholder:text-muted/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-primary block mb-1">Teléfono</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+51 9XX XXX XXX"
                    className="w-full text-sm border border-border rounded-[var(--radius-btn)] px-3 py-2 focus:outline-none focus:border-primary bg-white text-primary placeholder:text-muted/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-primary block mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full text-sm border border-border rounded-[var(--radius-btn)] px-3 py-2 focus:outline-none focus:border-primary bg-white text-primary placeholder:text-muted/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-primary block mb-1">¿Qué quieres consultar?</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Cuéntale al proveedor el motivo de la cita, tipo de evento, número de invitados..."
                  className="w-full text-sm border border-border rounded-[var(--radius-btn)] px-3 py-2 focus:outline-none focus:border-primary bg-white text-primary placeholder:text-muted/50 resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 rounded-[var(--radius-btn)] hover:bg-primary/90 disabled:opacity-50 transition-all text-sm"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <><CalendarDays size={15} /> Confirmar cita</>
              )}
            </button>
            <p className="text-[10px] text-muted text-center">
              El proveedor confirmará disponibilidad. Sin costo ni compromiso.
            </p>
          </form>
        )}

        {/* ── STEP: CALENDAR ─────────────────────────────────── */}
        {step === "calendar" && (
          <>
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setMonth(subMonths(month, 1))}
                disabled={month <= new Date(today.getFullYear(), today.getMonth(), 1)}
                className="p-1.5 rounded-full hover:bg-border disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} className="text-primary" />
              </button>
              <p className="text-sm font-bold text-primary capitalize" style={{ fontFamily: "var(--font-display)" }}>
                {format(month, "MMMM yyyy", { locale: es })}
              </p>
              <button
                onClick={() => setMonth(addMonths(month, 1))}
                className="p-1.5 rounded-full hover:bg-border transition-colors"
              >
                <ChevronRight size={16} className="text-primary" />
              </button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 mb-1">
              {dayNames.map((d) => (
                <div key={d} className="text-center text-[10px] font-semibold text-muted py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-y-1 mb-5">
              {Array.from({ length: startPad }).map((_, i) => (
                <div key={`pad-${i}`} />
              ))}
              {days.map((day) => {
                const isPast = isBefore(day, today);
                const isSun = getDay(day) === 0;
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                const isTodayDay = isToday(day);
                const disabled = isPast || isSun;

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDayClick(day)}
                    disabled={disabled}
                    className={[
                      "w-full aspect-square flex items-center justify-center rounded-full text-xs font-semibold transition-all",
                      isSelected
                        ? "bg-primary text-white shadow-md"
                        : isTodayDay && !disabled
                        ? "bg-accent/20 text-secondary font-bold hover:bg-primary hover:text-white"
                        : disabled
                        ? "text-muted/30 cursor-not-allowed"
                        : "text-primary hover:bg-primary/10 cursor-pointer",
                    ].join(" ")}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div className="border-t border-border pt-4">
                <p className="text-xs font-bold text-primary mb-3 capitalize">
                  {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                </p>
                {available.length === 0 ? (
                  <p className="text-xs text-muted text-center py-3">
                    Sin horarios disponibles este día. Elige otra fecha.
                  </p>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5 mb-4">
                    {ALL_SLOTS.map((slot) => {
                      const isOccupied = occupied.includes(slot);
                      const isChosen = selectedTime === slot;
                      return (
                        <button
                          key={slot}
                          disabled={isOccupied}
                          onClick={() => setSelectedTime(isChosen ? null : slot)}
                          className={[
                            "py-1.5 rounded-lg text-[11px] font-semibold border transition-all",
                            isChosen
                              ? "bg-primary text-white border-primary"
                              : isOccupied
                              ? "bg-border/40 text-muted/40 border-border/30 cursor-not-allowed line-through"
                              : "bg-white text-primary border-border hover:border-primary hover:bg-primary/5",
                          ].join(" ")}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedTime && (
                  <button
                    onClick={handleContinue}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white text-sm font-semibold py-2.5 rounded-[var(--radius-btn)] hover:bg-primary/90 transition-colors"
                  >
                    <CalendarDays size={15} />
                    Continuar con {selectedTime}
                  </button>
                )}
              </div>
            )}

            {!selectedDate && (
              <p className="text-xs text-muted text-center py-2">
                Selecciona una fecha para ver los horarios disponibles
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
