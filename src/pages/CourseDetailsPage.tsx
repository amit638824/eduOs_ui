import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageBanner from '@/components/eduleb/PageBanner';

const tabs = ['overview', 'curriculum', 'instructor', 'reviews'] as const;
type Tab = (typeof tabs)[number];

export default function CourseDetailsPage() {
  const [active, setActive] = useState<Tab>('overview');

  return (
    <>
      <PageBanner title="Course details" crumb="Course details" />

      <section className="our_event section-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 col-sm-8 col-xs-12">
              <div className="single_event_single">
                <img alt="" className="img-fluid" src="/eduleb/img/sc.png" />
                <div className="single_event_text_single">
                  <h4>Professional Ceramic Moulding for Beginners</h4>
                  <span>
                    <i className="fa fa-calendar" />
                    10 Oct 2024
                  </span>
                  <span>
                    <i className="fa fa-clock-o" />7 days
                  </span>
                  <span>
                    <i className="fa fa-table" />
                    <strong>30 Seats Available</strong>
                  </span>
                  <p>
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem
                    Ipsum has been the industry&apos;s standard dummy text ever since the 1500s,
                    when an unknown printer took a galley of type and scrambled it to make a type
                    specimen book. It has survived not only five centuries, but also the leap into
                    electronic typesetting, remaining essentially unchanged.
                  </p>
                  <p>
                    It has survived not only five centuries, but also the leap into electronic
                    typesetting, remaining essentially unchanged. It was popularised in the 1960s
                    with the release of Letraset sheets containing Lorem Ipsum passages, and more
                    recently with desktop publishing software like Aldus PageMaker including
                    versions of Lorem Ipsum.
                  </p>
                </div>
              </div>

              <div className="course-details-content section-bg">
                <ul className="nav nav-tabs" role="tablist">
                  {tabs.map((tab) => (
                    <li key={tab} className="nav-item">
                      <a
                        href={`#${tab}`}
                        className={`nav-link${active === tab ? ' active' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setActive(tab);
                        }}
                      >
                        {tab === 'overview'
                          ? 'Overview'
                          : tab === 'curriculum'
                            ? 'Curriculum'
                            : tab === 'instructor'
                              ? 'instructor'
                              : 'reviews'}
                      </a>
                    </li>
                  ))}
                </ul>

                <div className="tab-content">
                  {active === 'overview' && (
                    <div className="tab-pane show fade active">
                      <div className="overview">
                        <p>
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                          veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                          commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
                          velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                          cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
                          est laborum.
                        </p>
                        <iframe
                          width="900"
                          height="506"
                          src="https://www.youtube.com/embed/RXv_uIN6e-Y"
                          title="Course overview video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                        <p>
                          roin et eros varius, ornare turpis ac, dapibus nisi. Morbi luctus arcu non
                          massa consequat, et tristique velit semper. Curabitur interdum vulputate
                          sagittis. Donec erat massa, tincidunt sed feugiat id, suscipit in est.
                          Proin laoreet orci quis augue eleifend varius. Donec hendrerit ex ut lacus
                          blandit euismod.
                        </p>
                        <div className="details-buttons-area">
                          <a href="#0" className="custom-button theme-one">
                            Enroll Now <i className="fa fa-angle-right" />
                          </a>
                          <a href="#0" className="custom-button bg-white">
                            get membership
                          </a>
                          <ul className="social-icons">
                            <li>
                              <a href="#0" className="active">
                                <i className="fa fa-facebook" />
                              </a>
                            </li>
                            <li>
                              <a href="#0">
                                <i className="fa fa-twitter" />
                              </a>
                            </li>
                            <li>
                              <a href="#0">
                                <i className="fa fa-instagram" />
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {active === 'curriculum' && (
                    <div className="tab-pane show fade active">
                      <div className="overview">
                        <p>
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                          veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                          commodo consequat.
                        </p>
                        <p>
                          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
                          dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                          proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                        </p>
                        <div className="details-buttons-area">
                          <a href="#0" className="custom-button theme-one">
                            Enroll Now <i className="fa fa-angle-right" />
                          </a>
                          <a href="#0" className="custom-button bg-white">
                            get membership
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {active === 'instructor' && (
                    <div className="tab-pane show fade active">
                      <div className="overview text-center">
                        <div className="instructor-item">
                          <div className="instructor-thumb">
                            <a href="#0">
                              <img src="/eduleb/img/ins-details.png" alt="instructor" />
                            </a>
                          </div>
                          <div className="instructor-content">
                            <h6 className="title">
                              <a href="#0">Manuel Nuer</a>
                            </h6>
                            <span className="details">TEACHER</span>
                          </div>
                        </div>
                        <p>
                          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
                          ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                          ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
                          voluptate velit esse cillum dolore eu fugiat nulla pariatur..
                        </p>
                      </div>
                    </div>
                  )}

                  {active === 'reviews' && (
                    <div className="tab-pane show fade active">
                      <div className="client-review">
                        <div className="review-comments">
                          <h6 className="review-title">Reviews (03)</h6>
                          <ul className="review-contents">
                            {[
                              { img: 'client04.png', name: 'Robot Smith' },
                              { img: 'client02.png', name: 'Nicolas Anelca' },
                              { img: 'client03.png', name: 'Harry Johnshon' },
                            ].map((r) => (
                              <li key={r.name}>
                                <div className="thumb">
                                  <img src={`/eduleb/img/${r.img}`} alt="course" />
                                </div>
                                <div className="cont">
                                  <h6 className="subtitle">{r.name}</h6>
                                  <div className="ratings cl-theme">
                                    <span>
                                      <i className="fa fa-star" />
                                    </span>
                                    <span>
                                      <i className="fa fa-star" />
                                    </span>
                                    <span>
                                      <i className="fa fa-star" />
                                    </span>
                                    <span>
                                      <i className="fa fa-star" />
                                    </span>
                                    <span>
                                      <i className="fa fa-star" />
                                    </span>
                                  </div>
                                  <p>
                                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim
                                    unde et culpa voluptatibus repellat voluptates aliquid minima
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-sm-4 col-xs-12">
              <div className="course_features">
                <h3>Course features</h3>
                <ul>
                  <li>
                    <i className="fa fa-calendar" /> Course duration <b>10 days</b>
                  </li>
                  <li>
                    <i className="fa fa-user" /> Total Lectures <b>30</b>
                  </li>
                  <li>
                    <i className="fa fa-user" /> Total Students <b>1000</b>
                  </li>
                  <li>
                    <i className="fa fa-trophy" /> Certification <b>YES</b>
                  </li>
                </ul>
              </div>
              <div className="event_info_price">
                <h4>Price - 60$</h4>
              </div>
              <div className="event_info_register">
                <a className="btn_one" href="#0">
                  Register Today
                </a>
              </div>
              <div className="related_course">
                <h3>Related Course</h3>
                {[
                  { img: 'rc-1.png', title: 'UI/UX Design and...', price: '$42.00' },
                  { img: 'rc-2.png', title: 'Greatest Passion In...', price: '$37.00' },
                  { img: 'rc-3.png', title: 'incorporate your art ...', price: '$21.00' },
                ].map((item) => (
                  <div className="single_rc" key={item.title}>
                    <div className="rc_img">
                      <img src={`/eduleb/img/${item.img}`} alt="" />
                    </div>
                    <i className="fa fa-star" />
                    <i className="fa fa-star" />
                    <i className="fa fa-star" />
                    <i className="fa fa-star" />
                    <i className="fa fa-star" />
                    <h4>
                      <Link to="/course-details">{item.title}</Link>
                    </h4>
                    <span>{item.price}</span>
                  </div>
                ))}
              </div>
              <div className="sidebar-post">
                <div className="sidebar_title">
                  <h4>CATEGORIES</h4>
                </div>
                <div className="single_category">
                  <ul>
                    <li>
                      <a href="#0">
                        Education <sup>11</sup>
                      </a>
                    </li>
                    <li>
                      <a href="#0">
                        Ai Content <sup>44</sup>
                      </a>
                    </li>
                    <li>
                      <a href="#0">
                        New Course <sup>33</sup>
                      </a>
                    </li>
                    <li>
                      <a href="#0">
                        Marketing <sup>14</sup>
                      </a>
                    </li>
                    <li>
                      <a href="#0">
                        Software <sup>21</sup>
                      </a>
                    </li>
                    <li>
                      <a href="#0">
                        Design <sup>01</sup>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="sidebar-post">
                <div className="sidebar_title">
                  <h4>Follow us</h4>
                </div>
                <div className="single_social">
                  <ul>
                    <li>
                      <div className="social_item b_facebook">
                        <a href="#0" title="facebook">
                          <i className="fa fa-facebook" />
                          <span className="item-list">150K Likes</span>
                        </a>
                      </div>
                    </li>
                    <li>
                      <div className="social_item b_twitter">
                        <a href="#0" title="twitter">
                          <i className="fa fa-twitter" />
                          <span className="item-list">138K Followers</span>
                        </a>
                      </div>
                    </li>
                    <li>
                      <div className="social_item b_youtube">
                        <a href="#0" title="youtube">
                          <i className="fa fa-youtube" />
                          <span className="item-list">90K Subscribers</span>
                        </a>
                      </div>
                    </li>
                    <li>
                      <div className="social_item b_pinterest">
                        <a href="#0" title="pinterest">
                          <i className="fa fa-pinterest" />
                          <span className="item-list">350K Followers</span>
                        </a>
                      </div>
                    </li>
                    <li>
                      <div className="social_item b_tumblr">
                        <a href="#0" title="tumblr">
                          <i className="fa fa-tumblr" />
                          <span className="item-list">901 Followers</span>
                        </a>
                      </div>
                    </li>
                    <li>
                      <div className="social_item b_rss">
                        <a href="#0" title="rss">
                          <i className="fa fa-rss" />
                          <span className="item-list">411 Followers</span>
                        </a>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
