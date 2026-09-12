import MarketingNav from '../components/navigation/MarketingNav';
import MarketingFooter from '../components/navigation/MarketingFooter';
import { Hero } from './Landing/components/Hero';
import { Logos, ToolsGrid } from './Landing/components/ToolsGrid';
import { TryItEmbed } from './Landing/components/TryItEmbed';
import { TemplateGallery } from './Landing/components/TemplateGallery';
import { UseCases } from './Landing/components/UseCases';
import { LandingPricing } from './Landing/components/LandingPricing';
import { Newsletter } from './Landing/components/Newsletter';

export default function Landing() {
  return (
    <div className="marketing-page">
      <MarketingNav />
      <main id="main-content">
        <Hero />
        <Logos />
        <ToolsGrid />
        <TryItEmbed />
        <TemplateGallery />
        <UseCases />
        <LandingPricing />
        <Newsletter />
      </main>
      <MarketingFooter />
    </div>
  );
}
