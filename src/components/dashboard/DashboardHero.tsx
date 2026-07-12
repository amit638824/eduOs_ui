import { Link } from 'react-router-dom';
import type { DashboardProfile } from '@/types/dashboard';

interface DashboardHeroProps {
  profile: DashboardProfile;
}

export default function DashboardHero({ profile }: DashboardHeroProps) {
  return (
    <div className="container-fluid full__width__padding">
      <div className="row">
        <div className="col-xl-12">
          <div className="dashboardarea__wraper">
            <div className="dashboardarea__img">
              <div className={`dashboardarea__inner ${profile.innerClass ?? ''}`.trim()}>
                <div className="dashboardarea__left">
                  <div className="dashboardarea__left__img">
                    <img loading="lazy" src={profile.image} alt={profile.name} />
                  </div>
                  <div className="dashboardarea__left__content">
                    {profile.greeting && <h5>{profile.greeting}</h5>}
                    <h4>{profile.name}</h4>
                    {profile.stats && (
                      <ul>
                        {profile.stats.map((stat) => (
                          <li key={stat.text}>
                            <i className={stat.icon} /> {stat.text}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {profile.showRating && (
                  <div className="dashboardarea__star">
                    <i className="icofont-star" />
                    <i className="icofont-star" />
                    <i className="icofont-star" />
                    <i className="icofont-star" />
                    <i className="icofont-star" />
                    <span>4.8 (120 Reviews)</span>
                  </div>
                )}

                {profile.cta && (
                  <div className="dashboardarea__right">
                    <div className="dashboardarea__right__button">
                      <Link className="default__button" to={profile.cta.href}>
                        {profile.cta.label}
                        <i className="icofont-long-arrow-right" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
