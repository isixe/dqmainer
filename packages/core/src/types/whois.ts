export interface RegistrarInfo {
  id: string;
  name: string;
  email?: string;
  reseller?: string;
}

export interface WhoisTimestamps {
  created?: string;
  updated?: string;
  expires?: string;
}

export interface WhoisData {
  found: boolean;
  registrar?: RegistrarInfo;
  status?: string[];
  nameservers?: string[];
  ts?: WhoisTimestamps;
  error?: string;
}

export type WhoisResults = Record<string, WhoisData>;
