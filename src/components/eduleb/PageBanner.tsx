type Props = {
  title?: string;
  crumb?: string;
};

export default function PageBanner(_props: Props) {
  return (
    <section className="section-top">
      <div className="container">
        <div className="col-lg-10 offset-lg-1 text-center">
          <div className="section-top-title" />
        </div>
      </div>
    </section>
  );
}
