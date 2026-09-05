import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import MarketingNav from '@/components/navigation/MarketingNav'
import MarketingFooter from '@/components/navigation/MarketingFooter'

const content = {
  '/about': { title: 'Tools that respect the work', label: 'About Vanaila Studio', intro: 'Vanaila Studio is a browser-first toolkit by Vanaila Digital for freelancers, creators, job seekers, and small teams.', sections: [['What we build', 'We make practical tools for the documents, content, CVs, PDFs, images, and scans that surround everyday work. The product is designed to be useful before an upgrade is required.'], ['Privacy by default', 'PDF, image, OCR, and export processing runs locally in your browser. Files are not uploaded to Vanaila servers for conversion. Accounts, billing, usage, and selected document metadata use the production API when those features require it.']] },
  '/changelog': { title: 'Built in public, carefully', label: 'Changelog', intro: 'A concise record of the production work that has shaped Vanaila Studio.', sections: [['Current release', 'The current stage includes 18 registered browser tools, the authenticated application shell, account lifecycle, tiered billing, credit packs, admin operations, runtime social templates, CV AI, and production SEO surfaces.'], ['Recent work', 'Recent releases added direct document PDF/PNG export, document history categories, social markdown formatting, word-boundary-safe dynamic sizing, runtime social template authoring, and registry-driven marketing/support surfaces.'], ['Release principle', 'Every feature should have a clear owner, a browser-safe processing path, a usage and entitlement rule where relevant, and documentation that matches the deployed behavior.']] },
  '/roadmap': { title: 'The next useful thing', label: 'Roadmap', intro: 'The roadmap follows user value and operational confidence rather than a fixed promise of dates.', sections: [['Now', 'Production verification: payment and webhook checks, email delivery, mobile OCR and image processing, SEO validation, monitoring, and support workflows.'], ['Next', 'Improve runtime social-template authoring, expand browser/device regression coverage, refine mobile workflows, and continue aligning product copy with the tool registry and billing rules.'], ['Later', 'Optional enhancements include richer runtime-template editing, deeper analytics, additional export workflows, and cloud features only when their privacy and lifecycle design are ready.']] },
} as const

export default function Company() {
  const location = useLocation()
  const page = content[location.pathname as keyof typeof content] ?? content['/about']
  useEffect(() => { document.title = `${page.label} — Vanaila Studio` }, [page.label])
  return <div className="public-page"><MarketingNav /><main className="public-page__content">
    <Link to="/" className="public-page__back">← Vanaila Studio</Link>
    <p className="public-page__updated">{page.label}</p><h1>{page.title}</h1><p className="public-page__intro">{page.intro}</p>
    {page.sections.map(([title, body]) => <section key={title}><h2>{title}</h2><p>{body}</p></section>)}
    <section><h2>Keep exploring</h2><p><Link to="/manual">Read the manual</Link> · <Link to="/pricing">See plans</Link> · <Link to="/faq">Browse FAQs</Link> · <Link to="/contact">Contact support</Link></p></section>
  </main><MarketingFooter /></div>
}
