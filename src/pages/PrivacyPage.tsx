import Breadcrumb from '@/components/ui/Breadcrumb';
import { siteContent } from '@/data/siteContent';

export default function PrivacyPage() {
  const { parentCompany } = siteContent;

  return (
    <>
      <Breadcrumb title="Privacy Policy" />
      <div className="container sp_top_100 sp_bottom_100">
        <div className="row">
          <div className="col-xl-8 offset-xl-2">
            <p>
              {parentCompany.name} protects student data in line with applicable Indian privacy
              standards. We collect account information, exam attempt data, and usage analytics only
              to deliver online tests, results, and academy services.
            </p>
            <p>
              We do not sell personal data. Institutes control organization-level access through
              admin roles. Contact us to request data export or deletion.
            </p>
            <p>
              Learn more at{' '}
              <a href={parentCompany.website} target="_blank" rel="noreferrer">
                {parentCompany.website}
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
