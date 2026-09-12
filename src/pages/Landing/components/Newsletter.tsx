import { ArrowSmIcon } from './Icons';

function Newsletter() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Thanks — you're on the list.")
  }

  return (
    <section className="section">
      <div className="container">
        <div className="section__head section__head--center">
          <span className="eyebrow eyebrow--accent">Field notes</span>
          <h2 className="newsletter"><span style={{ display: 'block' }}>The slow newsletter <span className="accent">for working people.</span></span></h2>
          <p className="section__lede" style={{ margin: '0 auto' }}>
            One short note, once a month. New templates, new tools, the occasional spreadsheet. No tracking, no upsells, unsubscribe in one click.
          </p>
        </div>

        <div className="newsletter">
          <form className="newsletter__form" onSubmit={handleSubmit}>
            <input className="newsletter__input" type="email" placeholder="you@work.email" required />
            <button className="btn btn--accent" type="submit">Subscribe <ArrowSmIcon /></button>
          </form>
          <div className="newsletter__note">~ 2,140 readers · zero ads</div>
        </div>
      </div>
    </section>
  )
}

/* ===================== FOOTER ===================== */

export { Newsletter };
