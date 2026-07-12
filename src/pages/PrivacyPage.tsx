import Breadcrumb from '@/components/ui/Breadcrumb';

export default function PrivacyPage() {
  return (
    <>
      <Breadcrumb title="Privacy Policy" />
      <div className="container sp_top_100 sp_bottom_100">
        <div className="row">
          <div className="col-xl-8 offset-xl-2">
            <p>
              EduTest Pro protects student data in line with FERPA and US privacy standards. We collect account
              information, exam attempt data, and usage analytics only to deliver and improve our testing platform.
            </p>
            <p>
              We do not sell personal data. Schools and institutions control organization-level access through admin
              roles. Contact support to request data export or deletion.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
