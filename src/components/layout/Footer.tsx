import FooterNewsletter from './footer/FooterNewsletter';
import FooterMain from './footer/FooterMain';
import FooterCopyright from './footer/FooterCopyright';

export default function Footer() {
  return (
    <div className="footerarea">
      <div className="container">
        <FooterNewsletter />
        <FooterMain />
        <FooterCopyright />
      </div>
    </div>
  );
}
