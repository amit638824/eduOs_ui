type Props = {
<<<<<<< HEAD
  title?: string;
  crumb?: string;
};

export default function PageBanner(_props: Props) {
=======
  title: string;
  crumb: string;
  subtitle?: string;
  /** Match next section surface so intro merges (no hard border) */
  tone?: 'exams' | 'soft' | 'gradient';
};

/** Compact page intro — merges into the section below (no border-bottom) */
export default function PageBanner({ title, crumb, subtitle, tone = 'soft' }: Props) {
  const sub = subtitle || `Home / ${crumb}`;

>>>>>>> 80693461bcaeb2b8b8d67b934b610efbb05d7b26
  return (
    <section className={`eduleb-page-intro eduleb-page-intro--${tone}`}>
      <div className="container">
<<<<<<< HEAD
        <div className="col-lg-10 offset-lg-1 text-center">
          <div className="section-top-title" />
=======
        <div className="eduleb-page-intro__inner">
          <h1>{title}</h1>
          <p>{sub}</p>
>>>>>>> 80693461bcaeb2b8b8d67b934b610efbb05d7b26
        </div>
      </div>
    </section>
  );
}
