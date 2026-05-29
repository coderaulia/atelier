import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { allStaticRoutes, routeMeta, siteUrl, toolPages, type ToolPage } from './pages/toolPages'

/* Placeholder components used only at build time so we don't pull in browser-heavy tools
   into the SSR bundle. The prerender script will swap them with `<div id="live-tool" />`
   which the client hydrates later. */
import Landing from './pages/Landing'

function ToolPlaceholder({ tool }: { tool: ToolPage }) {
  return (
    <div className="tool-lazy-card">
      <div>
        <strong>{tool.name}</strong>
        <p>Live tool loads instantly in your browser.</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Dynamic imports must stay out of top-level for the SSR bundle.     */
/*  We lazy-import ToolLanding + placeholder here and cache them.      */
/* ------------------------------------------------------------------ */
let _ToolLanding: typeof import('./pages/ToolLanding')['default'] | null = null
async function getToolLanding() {
  if (!_ToolLanding) {
    _ToolLanding = (await import('./pages/ToolLanding')).default
  }
  return _ToolLanding
}

export async function render(url: string) {
  const ToolLanding = await getToolLanding()
  const tool = toolPages.find((page) => page.path === url)

  const element = tool ? (
    <ToolLanding tool={tool}>
      <ToolPlaceholder tool={tool} />
    </ToolLanding>
  ) : (
    <Landing />
  )

  return renderToString(
    <MemoryRouter location={url}>
      {element}
    </MemoryRouter>
  )
}

function schemaForTool(tool: ToolPage) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    description: tool.description,
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web Browser',
    url: `${siteUrl}${tool.path}`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  }
}

export default allStaticRoutes.map((url) => {
  const meta = routeMeta(url)
  const tool = toolPages.find((page) => page.path === url)
  return {
    url,
    meta: {
      title: meta.title,
      description: meta.description,
      ogImage: meta.ogImage,
      schema: tool ? schemaForTool(tool) : undefined,
    },
  }
})
