// @ts-nocheck
import { AgreementClassic, AgreementModern, AgreementEditorial } from './agreement';
import { InvoiceClassic, InvoiceModern, InvoiceEditorial } from './invoice';
import { ProposalClassic, ProposalModern, ProposalEditorial } from './proposal';
import { PRDClassic, PRDModern, PRDEditorial } from './prd';
import { RetainerClassic, RetainerModern, RetainerEditorial } from './retainer';
import { ReceiptClassic, ReceiptModern, ReceiptEditorial } from './receipt';
import { OnboardingClassic, OnboardingModern, OnboardingEditorial } from './onboarding';
import { ScopeGuardClassic, ScopeGuardModern, ScopeGuardEditorial } from './scopeguard';
import { HandoverClassic, HandoverModern, HandoverEditorial } from './handover';

export const DocTemplates = {
  agreement:  { classic: AgreementClassic,  modern: AgreementModern,  editorial: AgreementEditorial },
  invoice:    { classic: InvoiceClassic,    modern: InvoiceModern,    editorial: InvoiceEditorial },
  proposal:   { classic: ProposalClassic,   modern: ProposalModern,   editorial: ProposalEditorial },
  prd:        { classic: PRDClassic,        modern: PRDModern,        editorial: PRDEditorial },
  retainer:   { classic: RetainerClassic,   modern: RetainerModern,   editorial: RetainerEditorial },
  receipt:    { classic: ReceiptClassic,    modern: ReceiptModern,    editorial: ReceiptEditorial },
  onboarding: { classic: OnboardingClassic, modern: OnboardingModern, editorial: OnboardingEditorial },
  scopeguard: { classic: ScopeGuardClassic, modern: ScopeGuardModern, editorial: ScopeGuardEditorial },
  handover:   { classic: HandoverClassic,   modern: HandoverModern,   editorial: HandoverEditorial },
};
