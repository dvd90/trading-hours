export interface MarketConfig {
  name: string;
  timezone: string;
  openHour: number;
  openMinute: number;
  closeHour: number;
  closeMinute: number;
}

export interface MarketStatus {
  exchange: string;
  name: string;
  status: 'open' | 'closed';
  nextOpen?: string;
  closesAt?: string;
  timeUntilOpen?: string;
  timeUntilClose?: string;
  hoursUntil?: number;
}

export interface User {
  name: string;
  email: string;
  timezone: string;
  exchanges: string[];
}

export interface Report {
  text: string;
  html: string;
  statuses: MarketStatus[];
}

