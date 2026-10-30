type Props = {
  title: string;
  crumb: string;
  subtitle?: string;
  /** Match next section surface so intro merges (no hard border) */
  tone?: 'exams' | 'soft' | 'gradient';
};

/** Compact page intro — merges into the section below (no border-bottom) */
export default function PageBanner({ title, crumb, subtitle, tone = 'soft' }: Props) {
  const sub = subtitle || `Home / ${crumb}`;

  return (
    <section className={`eduleb-page-intro eduleb-page-intro--${tone}`}>
      <div className="container">
        <div className="eduleb-page-intro__inner">
          <h1>{title}</h1>
          <p>{sub}</p>
        </div>
      </div>
    </section>
  );
}
