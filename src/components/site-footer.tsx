import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-surface/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-base font-semibold text-foreground">Padel Quejio</p>
          <p>Reserva rapida, gestion profesional y juego entre amigos.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/faq">FAQ</Link>
          <Link href="/contacto">Contacto</Link>
          <Link href="/legal/terminos">Terminos</Link>
          <Link href="/legal/privacidad">Privacidad</Link>
          <Link href="/legal/cancelaciones">Cancelaciones</Link>
        </div>
      </div>
    </footer>
  );
}
