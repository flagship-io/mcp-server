/**
 * Flagship Decision API Types
 */

export class DecisionAPIRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface FlagshipConfig {
  env_id: string;
  api_key: string;
  api_url?: string;
  polling_interval?: number;
  timeout?: number;
}

export interface VisitorContext {
  [key: string]: string | number | boolean;
}

export interface DecisionRequest {
  visitor_id: string;
  context?: VisitorContext;
  trigger_hit?: boolean;
  campaign_id?: string;
}

export interface Campaign {
  id: string;
  name?: string;
  type?: string;
  slug?: string;
  variationGroupId?: string;
  variationGroupName?: string;
  variation?: Variation;
}

export interface Variation {
  id: string;
  name?: string;
  reference?: boolean;
  modifications?: {
    type: string;
    value: Record<string, any>;
  };
}

export interface DecisionResponse {
  visitorId: string;
  campaigns: Campaign[];
  extras?: any;
}

export interface FlagInfo {
  value: any;
  metadata: {
    campaignId: string;
    campaignName?: string;
    type?: string;
    variationGroupId: string;
    variationGroupName?: string;
    variationId: string;
    variationName?: string;
    reference?: boolean;
    slug?: string;
  };
}

export interface Environment {
  id: string;
  isPanic: boolean;
  campaigns: Array<{
    id: string;
    name?: string;
    type?: string;
    slug?: string;
    variationGroups?: any[];
  }>;
  accountSettings?: any;
}

export interface CampaignActivation {
  vid: string;
  cid: string;
  caid: string;
  vaid: string;
  qt?: number;
  dl?: string;
}
