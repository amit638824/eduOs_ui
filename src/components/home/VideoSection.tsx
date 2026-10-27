export default function VideoSection() {
  return (
    <section id="video" className="vid_area section-padding">
      <div className="container">
        <div className="row">
          <div className="col-lg-12 vp_top">
            <div
              className="video-area"
              style={{
                backgroundImage: 'url(/eduleb/img/bg/video.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
              }}
            >
              <a
                href="https://www.youtube.com/watch?v=RXv_uIN6e-Y"
                className="magnific_popup video-button"
                target="_blank"
                rel="noreferrer"
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
