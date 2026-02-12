type AppPlaceholderProps = {
  title: string;
  description: string;
};

export function AppPlaceholder({ title, description }: AppPlaceholderProps) {
  return (
    <section className="card p-6">
      <h1 className="text-5xl">{title}</h1>
      <p className="mt-2 text-sm text-muted">{description}</p>
    </section>
  );
}
