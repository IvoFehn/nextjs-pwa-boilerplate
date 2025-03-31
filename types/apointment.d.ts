// types/appointment.ts
export interface Appointment {
  _id?: string;
  userId: string;
  userName: string;
  time: string;
  date: string;
  timestamp: string;
  completed?: boolean;
}
