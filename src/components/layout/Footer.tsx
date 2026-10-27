import FooterMain from './footer/FooterMain';
import FooterCopyright from './footer/FooterCopyright';

export default function Footer() {
  return (
    <footer className="ms-footer-clean">
      <div className="container">
        <FooterMain />
        <FooterCopyright />
      </div>
    </footer>
  );
}
