// types/pushNotifications.ts
export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface DbPushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: PushSubscriptionKeys;
  createdAt?: Date;
  userId?: string;
  _id?: string; // MongoDB ID
}

export interface NotificationPayload {
  title: string;
  body: string;
  link?: string;
  icon?: string;
  badge?: string;
}

export interface SendNotificationResult {
  success: boolean;
  endpoint: string;
  removed?: boolean;
  error?: string;
}

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
