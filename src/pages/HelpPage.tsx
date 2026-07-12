import Breadcrumb from '@/components/ui/Breadcrumb';
import { siteContent } from '@/data/siteContent';

export default function HelpPage() {
  const { contact, parentCompany } = siteContent;

  return (
    <>
      <Breadcrumb title="Help Center" />
      <div className="container sp_top_100 sp_bottom_100">
        <div className="row">
          <div className="col-xl-8 offset-xl-2">
            <h3>How can we help?</h3>
            <p>
              Contact the {parentCompany.name} EdTech support team for login, exam access, and school
              onboarding help. EduTest Pro is built and supported by {parentCompany.name} from India.
            </p>
            <ul>
              <li>Phone: {contact.phone}</li>
              <li>Email: {contact.email}</li>
              <li>Address: {contact.address}</li>
              <li>
                Parent company:{' '}
                <a href={parentCompany.website} target="_blank" rel="noreferrer">
                  {parentCompany.name}
                </a>
              </li>
            </ul>
            <p>For password resets, use your registered email or contact support.</p>
          </div>
        </div>
      </div>
    </>
  );
}
