"use client";

import { use, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, Star, ShieldCheck, MapPin, CheckCircle,
  XCircle, BadgeCheck, CheckCircle2, Plus,
} from "lucide-react";
import Header from "@/components/ui/Header";
import BookingCalendar from "@/components/marketplace/BookingCalendar";
import CatalogSection from "@/components/marketplace/CatalogSection";
import QuotePanel from "@/components/marketplace/QuotePanel";
import QuoteDrawer from "@/components/marketplace/QuoteDrawer";
import { MOCK_PROVIDERS } from "@/lib/mockData";
import { useTaskPlanStore } from "@/stores/taskPlan";
import { useQuoteRequestStore } from "@/stores/quoteRequest";
import { TaskProvider } from "@/lib/taskPlan";
import { useSearchParams } from "next/navigation";

export default function ProviderPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense><ProviderPageContent params={params} /></Suspense>;
}

function ProviderPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const provider = MOCK_PROVIDERS.find((p) => p.id === id);
  const [activePhoto, setActivePhoto] = useState(0);
  const [quoteDrawerOpen, setQuoteDrawerOpen] = useState(false);
  const { tasks, addProvider } = useTaskPlanStore();
  const { items: quoteItems, providerId: quotingId } = useQuoteRequestStore();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId");
  const task = taskId ? tasks.find((t) => t.id === taskId) : null;
  const alreadyAdded = task?.providers.some((p) => p.id === `mkt-${id}`) ?? false;
  const [justAdded, setJustAdded] = useState(false);
  const quoteCount = quotingId === id ? quoteItems.reduce((a, i) => a + i.quantity, 0) : 0;

  function handleAddToTask() {
    if (!provider || !taskId || alreadyAdded || justAdded) return;
    const tp: TaskProvider = {
      id: `mkt-${provider.id}`,
      source: "plannia",
      name: provider.business_name,
      priceEstMin: provider.price_min,
      priceEstMax: provider.price_max ?? provider.price_min,
      rating: provider.rating_avg,
      phone: "", email: "", notes: "",
      state: "suggested",
      quotedPrice: null, quoteNotes: "",
      contractedPrice: null, contractedDate: null, deliveryDate: null,
      adelanto: null, adelantoDate: null, adelantoPaid: false,
      finalPayment: null, finalPaymentDate: null, finalPaymentPaid: false,
      pendingPaymentDate: null,
    };
    addProvider(taskId, tp);
    setJustAdded(true);
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted mb-4">Proveedor no encontrado</p>
            <Link href="/marketplace" className="text-primary font-semibold hover:underline">← Volver al marketplace</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="max-w-5xl mx-auto w-full px-4 md:px-8 py-6 pb-24">
        {/* Back */}
        <Link
          href={taskId ? `/marketplace?taskId=${taskId}${task ? `&categoria=${encodeURIComponent(task.name)}` : ""}` : "/marketplace"}
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft size={16} /> {taskId ? "Volver a resultados" : "Volver al marketplace"}
        </Link>

        {/* Add-to-task banner */}
        {taskId && task && (
          <div className="mb-6 bg-primary/6 border border-primary/25 rounded-[var(--radius-card)] px-4 py-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">
                Estás buscando para
              </p>
              <p className="text-sm font-bold text-primary">{task.icon} {task.name}</p>
            </div>
            <button
              onClick={handleAddToTask}
              disabled={alreadyAdded || justAdded}
              className={[
                "shrink-0 flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border-2 transition-all",
                alreadyAdded || justAdded
                  ? "border-accent/40 bg-accent/10 text-secondary cursor-default"
                  : "border-primary bg-primary text-white hover:bg-primary/90",
              ].join(" ")}
            >
              {alreadyAdded || justAdded ? (
                <><CheckCircle2 size={13} /> Agregado</>
              ) : (
                <><Plus size={13} /> Agregar a mis sugeridos</>
              )}
            </button>
          </div>
        )}

        {/* Photo gallery */}
        <div className="mb-6">
          <div className="relative h-64 md:h-96 rounded-[var(--radius-card)] overflow-hidden bg-border mb-3">
            <Image
              src={provider.photos[activePhoto]}
              alt={provider.business_name}
              fill
              className="object-cover transition-all duration-300"
              priority
            />

            {/* Bottom gradient + provider info overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent rounded-[var(--radius-card)]" />
            <div className="absolute bottom-0 left-0 right-0 px-5 py-4 flex items-end justify-between gap-3">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white leading-tight drop-shadow" style={{ fontFamily: "var(--font-display)" }}>
                  {provider.business_name}
                </h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="bg-white/20 text-white/90 px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm">
                    {provider.category}
                  </span>
                  <span className="flex items-center gap-1 text-white/80 text-xs">
                    <MapPin size={11} />{provider.city}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1.5">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={13} className={s <= Math.round(provider.rating_avg) ? "text-yellow-400 fill-yellow-400" : "text-white/30"} />
                  ))}
                  <span className="text-white text-xs font-semibold ml-1">{provider.rating_avg}</span>
                  <span className="text-white/70 text-xs">({provider.review_count} reseñas)</span>
                </div>
              </div>
              {provider.is_verified && (
                <div className="flex items-center gap-1 bg-white/15 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 border border-white/25">
                  <ShieldCheck size={12} /> Verificado
                </div>
              )}
            </div>

            {!provider.availability && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="bg-white text-primary font-semibold px-4 py-2 rounded-full text-sm">
                  Consultar disponibilidad
                </span>
              </div>
            )}
          </div>
          {provider.photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {provider.photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  className={[
                    "relative shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all",
                    activePhoto === i ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
                  ].join(" ")}
                >
                  <Image src={photo} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: info + catalog */}
          <div className="flex-1 min-w-0">

            {/* Description */}
            <div className="bg-white border border-border rounded-[var(--radius-card)] p-5 mb-5">
              <h2 className="font-bold text-primary text-sm mb-2" style={{ fontFamily: "var(--font-display)" }}>Sobre nosotros</h2>
              <p className="text-sm text-muted leading-relaxed">{provider.longDescription}</p>
            </div>

            {/* Location */}
            <div className="bg-white border border-border rounded-[var(--radius-card)] p-5 mb-5">
              <h2 className="font-bold text-primary text-sm mb-3" style={{ fontFamily: "var(--font-display)" }}>Ubicación y cobertura</h2>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin size={15} className="text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-primary">Dirección</p>
                    <p className="text-muted">{provider.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <BadgeCheck size={15} className="text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-primary">Zona de cobertura</p>
                    <p className="text-muted">{provider.coverageZone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-5">
              {provider.tags.map((tag) => (
                <span key={tag} className="text-xs bg-border/60 text-muted px-3 py-1 rounded-full">{tag}</span>
              ))}
            </div>

            {/* Catalog */}
            <div className="mb-6">
              <CatalogSection
                providerId={provider.id}
                providerName={provider.business_name}
                providerCategory={provider.category}
                catalog={provider.catalog}
              />
            </div>

            {/* Mobile: quote panel */}
            <div className="lg:hidden mb-6">
              <QuotePanel
                providerId={provider.id}
                providerCategory={provider.category}
                onRequestQuote={() => setQuoteDrawerOpen(true)}
              />
            </div>

            {/* Reviews */}
            <div>
              <h2 className="font-bold text-primary mb-4" style={{ fontFamily: "var(--font-display)" }}>
                Reseñas ({provider.review_count})
              </h2>
              <div className="flex flex-col gap-3">
                {provider.reviews.map((review, i) => (
                  <div key={i} className="bg-white border border-border rounded-[var(--radius-card)] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/15 text-primary font-bold text-xs flex items-center justify-center">
                          {review.author[0]}
                        </div>
                        <span className="text-sm font-semibold text-primary">{review.author}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} size={12} className={s <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-border"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted leading-relaxed">{review.comment}</p>
                    <p className="text-xs text-muted/60 mt-2">
                      {new Date(review.date).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Booking calendar — mobile only (desktop shows in sidebar) */}
            <div className="mt-6 lg:hidden">
              <BookingCalendar providerId={provider.id} providerName={provider.business_name} />
            </div>

            {/* Transparency */}
            <div className="bg-white border border-border rounded-[var(--radius-card)] p-4 mt-5">
              <div className="flex items-center gap-2">
                {provider.accepts_commissions ? (
                  <><XCircle size={16} className="text-muted" /><p className="text-sm text-muted">Este proveedor acepta comisiones de afiliación</p></>
                ) : (
                  <><CheckCircle size={16} className="text-secondary" /><p className="text-sm text-secondary font-medium">Este proveedor no cobra comisiones de afiliación</p></>
                )}
              </div>
              <p className="text-xs text-muted mt-1">Los precios son referenciales. El proveedor confirma el monto final.</p>
            </div>
          </div>

          {/* Right: sticky sidebar (desktop) */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-6 flex flex-col gap-4">

              {/* Task CTA — only when coming from checklist */}
              {taskId && task && (
                <div className="bg-white border border-border rounded-[var(--radius-card)] p-4">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Buscando para</p>
                  <p className="text-sm font-bold text-primary mb-3">{task.icon} {task.name}</p>
                  <button
                    onClick={handleAddToTask}
                    disabled={alreadyAdded || justAdded}
                    className={[
                      "w-full flex items-center justify-center gap-2 text-xs font-bold py-2 rounded-[var(--radius-btn)] border-2 transition-all",
                      alreadyAdded || justAdded
                        ? "border-accent/40 bg-accent/10 text-secondary cursor-default"
                        : "border-primary/40 text-primary hover:border-primary hover:bg-primary/5",
                    ].join(" ")}
                  >
                    {alreadyAdded || justAdded ? (
                      <><CheckCircle2 size={13} /> Agregado a sugeridos</>
                    ) : (
                      <><Plus size={13} /> Agregar a sugeridos sin cotizar</>
                    )}
                  </button>
                  {(alreadyAdded || justAdded) && (
                    <Link
                      href={`/dashboard/checklist?taskId=${taskId}`}
                      className="mt-2 w-full flex items-center justify-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <ArrowLeft size={11} /> Volver al pendiente
                    </Link>
                  )}
                </div>
              )}

              {/* Quote panel — always visible */}
              <QuotePanel
                providerId={provider.id}
                providerCategory={provider.category}
                onRequestQuote={() => setQuoteDrawerOpen(true)}
              />

              {/* Booking calendar */}
              <BookingCalendar providerId={provider.id} providerName={provider.business_name} />

            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA — shows when items in quote */}
      {quoteCount > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
          <button
            onClick={() => setQuoteDrawerOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 rounded-[var(--radius-btn)] shadow-lg"
          >
            Solicitar cotización
            <span className="bg-white text-primary text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {quoteCount}
            </span>
          </button>
        </div>
      )}

      {/* Quote drawer */}
      {quoteDrawerOpen && (
        <QuoteDrawer
          providerId={provider.id}
          providerName={provider.business_name}
          taskId={taskId}
          onClose={() => setQuoteDrawerOpen(false)}
        />
      )}
    </div>
  );
}
