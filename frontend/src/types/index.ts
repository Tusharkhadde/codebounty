// Type definitions for CodeBounty

export type BountyStatus = 'created' | 'funded' | 'linked' | 'verified' | 'paid' | 'cancelled' | 'disputed';

export interface Bounty {
  id: number;
  issue_url: string;
  creator: string;
  amount: number;
  token: string | null;
  deadline: number;
  status: BountyStatus;
  linked_pr_url: string | null;
  contributor: string | null;
  funded_at: number;
  paid_at: number;
}

export interface BountyEvent {
  id: number;
  type: 'bounty_created' | 'bounty_funded' | 'pr_linked' | 'payment_released' | 'bounty_cancelled' | 'dispute_raised' | 'funds_refunded';
  bounty_id: number;
  timestamp: number;
  data: Record<string, unknown>;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  network: string;
  connecting: boolean;
  error: string | null;
}

export interface CreateBountyFormData {
  issueUrl: string;
  amount: string;
  token: string;
  deadline: string;
}

export interface LinkPRFormData {
  prUrl: string;
}

export interface FundBountyFormData {
  amount: string;
}

export type StepperStep = 'created' | 'funded' | 'pr_linked' | 'verified' | 'paid';

export interface StepperProps {
  currentStep: StepperStep;
  bountyId?: number;
}