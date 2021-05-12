export enum STATE {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  ERROR = 'ERROR',
}

type OwnerType = {
  avatar: string;
  first_name: string;
  id: number;
  last_name: string;
};

export type ListTimeOff = {
  id: number;
  end_date: string;
  owner?: OwnerType;
  reviewed_by: string | null;
  start_date: string;
  note: string | null;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Canceled';
  time_off_type: string;
};
