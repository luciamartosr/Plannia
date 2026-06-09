export interface Recommendation {
  type: "positive" | "warning" | "tip";
  title: string;
  body: string;
}

// Rainy season months by region (1 = January)
const RAINY_MONTHS: Record<string, number[]> = {
  lima:       [1, 2, 3],           // verano limeño — húmedo y nublado
  arequipa:   [12, 1, 2, 3, 4],   // temporada de lluvias del sur
  cusco:      [11, 12, 1, 2, 3, 4],
  puno:       [11, 12, 1, 2, 3, 4],
  trujillo:   [1, 2, 3],
  piura:      [12, 1, 2, 3, 4],
  chiclayo:   [1, 2, 3],
  iquitos:    [1, 2, 3, 11, 12],  // Amazonía — siempre húmedo
  tarapoto:   [1, 2, 3, 11, 12],
};

// Dry / best season months
const DRY_MONTHS: Record<string, number[]> = {
  lima:       [6, 7, 8, 9],
  arequipa:   [5, 6, 7, 8, 9, 10],
  cusco:      [5, 6, 7, 8, 9, 10],
  puno:       [5, 6, 7, 8, 9],
  trujillo:   [5, 6, 7, 8, 9, 10],
  piura:      [6, 7, 8, 9, 10],
  chiclayo:   [5, 6, 7, 8, 9, 10],
};

function normalizeCity(city: string): string {
  return city
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(",")[0]
    .trim();
}

export function getRecommendations(
  city: string,
  dateStr: string | null,
  eventType: string | null
): Recommendation[] {
  if (!dateStr || !city) return [];

  const date = new Date(dateStr + "T12:00:00");
  const month = date.getMonth() + 1; // 1-12
  const key = normalizeCity(city);

  const recs: Recommendation[] = [];
  const isOutdoor = eventType === "boda" || eventType === "quinceañero";
  const isRainy = RAINY_MONTHS[key]?.includes(month);
  const isDry = DRY_MONTHS[key]?.includes(month);

  // ---- CLIMA ----
  if (isRainy) {
    recs.push({
      type: "warning",
      title: `Temporada de lluvias en ${city}`,
      body: `Los meses de ${getMonthName(month)} suelen tener lluvias frecuentes en esta zona. Si tu evento es al aire libre, considera tener toldos o carpas de respaldo y un plan B de locación techada.`,
    });
  } else if (isDry) {
    recs.push({
      type: "positive",
      title: `Clima ideal para tu evento`,
      body: `¡Buena elección de fecha! ${getMonthName(month)} es temporada seca en ${city} — cielos despejados, temperaturas agradables y perfectas condiciones para eventos al aire libre.`,
    });
  }

  // ---- CUSCO específico ----
  if (key === "cusco") {
    recs.push({
      type: "tip",
      title: "Altitud en Cusco (3,400 m.s.n.m.)",
      body: "Algunos invitados pueden sentir el soroche (mal de altura). Recomiéndales aclimatarse un día antes y ten a mano agua de muña o coca. Informa esto en la invitación.",
    });
    if (month >= 6 && month <= 8) {
      recs.push({
        type: "positive",
        title: "Temporada alta de turismo en Cusco",
        body: "Junio a agosto es la mejor época climática, pero también la más concurrida. Reserva hoteles y local con al menos 6 meses de anticipación.",
      });
    }
  }

  // ---- BODAS al aire libre ----
  if (eventType === "boda") {
    if (isDry) {
      recs.push({
        type: "positive",
        title: "Perfecta para una boda de día al aire libre",
        body: "Con clima seco y cielos despejados, una ceremonia en jardín o hacienda puede ser espectacular. Las fotos con luz natural de tarde (golden hour) quedan increíbles en esta época.",
      });
    }
    if (month === 12 || month === 1 || month === 2) {
      recs.push({
        type: "tip",
        title: "Verano en Lima — considera el horario",
        body: "Si el evento es en Lima en verano (dic–feb), las noches son cálidas y ideales. Evita ceremonias al mediodía por el calor. Las 6–7 pm son el horario favorito.",
      });
    }
  }

  // ---- QUINCEAÑERO ----
  if (eventType === "quinceañero" && isRainy) {
    recs.push({
      type: "tip",
      title: "Salón techado recomendado",
      body: "Para quinceañeros en temporada de lluvias, un salón con pista de baile techada garantiza que la celebración fluya sin interrupciones y protege el vestuario y la decoración.",
    });
  }

  // ---- TEMPORADA ALTA GENERAL ----
  if ((month === 7 || month === 8) && (key === "lima" || key === "arequipa")) {
    recs.push({
      type: "tip",
      title: "Temporada alta de eventos — reserva pronto",
      body: "Julio y agosto son los meses más demandados para eventos en esta ciudad. Los mejores locales y proveedores se agendan con 4–6 meses de anticipación. No lo dejes para después.",
    });
  }

  // Fallback si no hay nada específico
  if (recs.length === 0) {
    recs.push({
      type: "tip",
      title: "Planifica con anticipación",
      body: "Independientemente de la época, reservar local y catering con al menos 3 meses de anticipación te da más opciones y mejores precios.",
    });
  }

  return recs;
}

function getMonthName(month: number): string {
  return [
    "", "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ][month];
}
