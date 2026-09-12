import { CVData, CVTemplate } from './types';
import {
  ClassicTemplate,
  ModernTemplate,
  MinimalTemplate,
  AtsOptimizedTemplate,
  ExecutiveTemplate,
  CreativeTemplate,
} from './templates';
import {
  SlateAtsTemplate,
  CrimsonAtsTemplate,
  CarbonAtsTemplate,
} from './ats-templates';

export function renderTemplate(templateId: CVTemplate, data: CVData, accent: string) {
  switch (templateId) {
    case 'classic':    return <ClassicTemplate   data={data} accent={accent} />;
    case 'modern':     return <ModernTemplate    data={data} accent={accent} />;
    case 'minimal':    return <MinimalTemplate   data={data} accent={accent} />;
    case 'ats':        return <AtsOptimizedTemplate data={data} accent={accent} />;
    case 'executive':  return <ExecutiveTemplate data={data} accent={accent} />;
    case 'creative':   return <CreativeTemplate  data={data} accent={accent} />;
    case 'slate':      return <SlateAtsTemplate   data={data} accent={accent} />;
    case 'crimson':    return <CrimsonAtsTemplate data={data} accent={accent} />;
    case 'carbon':     return <CarbonAtsTemplate  data={data} accent={accent} />;
    default:           return <ClassicTemplate   data={data} accent={accent} />;
  }
}
