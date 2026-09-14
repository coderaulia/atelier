// @ts-nocheck
import { AgreementClassic, AgreementModern, AgreementEditorial, AgreementMinimal, AgreementExecutive } from './agreement';
import { InvoiceClassic, InvoiceModern, InvoiceEditorial, InvoiceMinimal, InvoiceExecutive } from './invoice';
import { ProposalClassic, ProposalModern, ProposalEditorial, ProposalMinimal, ProposalExecutive } from './proposal';
import { PRDClassic, PRDModern, PRDEditorial, PRDMinimal, PRDExecutive } from './prd';
import { RetainerClassic, RetainerModern, RetainerEditorial, RetainerMinimal, RetainerExecutive } from './retainer';
import { ReceiptClassic, ReceiptModern, ReceiptEditorial, ReceiptMinimal, ReceiptExecutive } from './receipt';
import { OnboardingClassic, OnboardingModern, OnboardingEditorial, OnboardingMinimal, OnboardingExecutive } from './onboarding';
import { ScopeGuardClassic, ScopeGuardModern, ScopeGuardEditorial, ScopeGuardMinimal, ScopeGuardExecutive } from './scopeguard';
import { HandoverClassic, HandoverModern, HandoverEditorial, HandoverMinimal, HandoverExecutive } from './handover';

export const DocTemplates = {
  agreement:  { classic: AgreementClassic,  modern: AgreementModern,  editorial: AgreementEditorial,  minimal: AgreementMinimal,  executive: AgreementExecutive },
  invoice:    { classic: InvoiceClassic,    modern: InvoiceModern,    editorial: InvoiceEditorial,    minimal: InvoiceMinimal,    executive: InvoiceExecutive },
  proposal:   { classic: ProposalClassic,   modern: ProposalModern,   editorial: ProposalEditorial,   minimal: ProposalMinimal,   executive: ProposalExecutive },
  prd:        { classic: PRDClassic,        modern: PRDModern,        editorial: PRDEditorial,        minimal: PRDMinimal,        executive: PRDExecutive },
  retainer:   { classic: RetainerClassic,   modern: RetainerModern,   editorial: RetainerEditorial,   minimal: RetainerMinimal,   executive: RetainerExecutive },
  receipt:    { classic: ReceiptClassic,    modern: ReceiptModern,    editorial: ReceiptEditorial,    minimal: ReceiptMinimal,    executive: ReceiptExecutive },
  onboarding: { classic: OnboardingClassic, modern: OnboardingModern, editorial: OnboardingEditorial, minimal: OnboardingMinimal, executive: OnboardingExecutive },
  scopeguard: { classic: ScopeGuardClassic, modern: ScopeGuardModern, editorial: ScopeGuardEditorial, minimal: ScopeGuardMinimal, executive: ScopeGuardExecutive },
  handover:   { classic: HandoverClassic,   modern: HandoverModern,   editorial: HandoverEditorial,   minimal: HandoverMinimal,   executive: HandoverExecutive },
};

