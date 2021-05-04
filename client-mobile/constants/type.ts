export enum STATE {
  IDLE = "IDLE",
  LOADING = "LOADING",
  LOADED = "LOADED",
  ERROR = "ERROR",
}

type OwnerType = {
  avatar: string;
  first_name: string;
  id: number;
  last_name: string;
};
export type ListTimeOff = {
  end_date: string;
  id: number;
  note: string | null;
  owner?: OwnerType;
  reviewed_by: string | null;
  start_date: string;
  status: string;
  time_off_type: string;
};
