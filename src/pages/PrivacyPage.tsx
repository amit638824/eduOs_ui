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
              EduTest Pro, an EdTech product of {parentCompany.name} (India), protects student data in
              line with applicable privacy standards including FERPA-aligned practices for US
              institutions. We collect account information, exam attempt data, and usage analytics only
              to deliver and improve our testing platform.
            </p>
            <p>
              We do not sell personal data. Schools and institutions control organization-level access
              through admin roles. Data is processed on secure cloud infrastructure managed by{' '}
              {parentCompany.name}. Contact support to request data export or deletion.
            </p>
            <p>
              Learn more about our parent company at{' '}
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
