interface SectionTitleProps {
  badge: string;
  title: string;
  centered?: boolean;
  className?: string;
}

export default function SectionTitle({ badge, title, centered, className = '' }: SectionTitleProps) {
  return (
    <div className={`section__title ${centered ? 'text-center' : ''} ${className}`.trim()}>
      <div className="section__title__button">
        <div className="default__small__button">{badge}</div>
      </div>
      <div className="section__title__heading">
        <h2>
          {title.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < title.split('\n').length - 1 && <br />}
            </span>
          ))}
        </h2>
      </div>
    </div>
  );
}
