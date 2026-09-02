import { Icon, exportImage } from './utils';

export function SocialPreview({ template, data, brand, zoom }: any) {
  if (!template) return null;
  const slides = template.slides({ data, brand });
  const isCarousel = slides.length > 1;
  const fileBase = template.name.toLowerCase().replace(/\s+/g, "-");

  const dlSlide = async (i: number, fmt: string) => {
    await exportImage(`#social-target-${i}`, `${fileBase}-${String(i + 1).padStart(2, "0")}`, fmt);
  };

  return (
    <div className="social-stage">
      {slides.map((slide: any, i: number) => (
        <div className="slide-wrap" key={i}>
          {isCarousel && <div className="slide-wrap__num">Slide {String(i + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</div>}
          {isCarousel && (
            <div className="slide-wrap__chrome">
              <button className="slide-wrap__btn" onClick={() => dlSlide(i, "png")} title="Download this slide as PNG">{Icon.image} PNG</button>
              <button className="slide-wrap__btn" onClick={() => dlSlide(i, "jpg")} title="Download this slide as JPG">{Icon.download} JPG</button>
            </div>
          )}
          <div id={`social-target-${i}`} style={{ transform: `scale(${zoom})`, transformOrigin: "top center", boxShadow: "0 24px 70px -24px rgba(0,0,0,0.4)" }}>
            {slide}
          </div>
        </div>
      ))}
    </div>
  );
}
