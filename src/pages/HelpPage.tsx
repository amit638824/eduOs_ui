import Breadcrumb from '@/components/ui/Breadcrumb';
import { siteContent } from '@/data/siteContent';

export default function HelpPage() {
  const { contact } = siteContent;

  return (
    <>
      <Breadcrumb title="Help Center" />
      <div className="container sp_top_100 sp_bottom_100">
        <div className="row">
          <div className="col-xl-8 offset-xl-2">
            <h3>How can we help?</h3>
            <p>Contact our US support team for login, exam access, and school onboarding help.</p>
            <ul>
              <li>Phone: {contact.phone}</li>
              <li>Email: {contact.email}</li>
              <li>Address: {contact.address}</li>
            </ul>
            <p>For password resets, use your registered email or contact support.</p>
          </div>
        </div>
      </div>
    </>
  );
}
