import { Link } from 'react-router-dom';
import Breadcrumb from '@/components/ui/Breadcrumb';
import RegisterSection from '@/components/home/RegisterSection';

export default function RegisterPage() {
  return (
    <>
      <Breadcrumb title="Sign Up" variant="compact" />
      <RegisterSection variant="auth" />
      <div className="container auth-page-footer">
        <div className="row">
          <div className="col-12 text-center" data-aos="fade-up">
            <p>
              Already have an account? <Link to="/login">Log in here</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
