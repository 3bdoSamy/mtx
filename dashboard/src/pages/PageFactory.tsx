export function PageFactory({ title }: { title: string }) {
  return (
    <section className="page">
      <h2>{title}</h2>
      <div className="panel-grid">
        <article className="panel">Real-time KPIs</article>
        <article className="panel">Live protocol mix</article>
        <article className="panel">Audit activity</article>
        <article className="panel">Resource summary</article>
      </div>
    </section>
  );
}
