export type TrackingStatus = 'on-track' | 'at-risk' | 'behind';

export interface TrackerItem {
  id: string;
  item: string;
  target: string;
  confirmed: string;
  percentComplete: number;
  status: TrackingStatus;
  owner: string;
  nextStep: string;
  risk: string;
}

export interface TrackerSection {
  name: string;
  items: TrackerItem[];
}
