import type { HomepageContent } from '@/types/homepage';

export default function VideoSection({ content }: { content?: HomepageContent['video'] }) {
  return (
    <section id="video" className="vid_area section-padding" data-aos="fade-up">
      <div className="container">
        <div className="row">
          <div className="col-lg-12 vp_top">
            <div
              className="video-area"
              data-aos="zoom-in"
              data-aos-duration="800"
              style={{
                backgroundImage: `url(${content?.image || '/eduleb/img/bg/video.jpg'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
              }}
            >
              <a
                href={content?.href || 'https://www.youtube.com/watch?v=RXv_uIN6e-Y'}
                className="magnific_popup video-button"
                target="_blank"
                rel="noreferrer"
                data-aos="zoom-in"
                data-aos-delay="200"
              >
                <i className="fa fa-play" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
