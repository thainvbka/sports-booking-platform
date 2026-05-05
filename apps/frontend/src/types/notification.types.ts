export const NotificationType = {
  BOOKING: "BOOKING",
  MATCH: "MATCH",
  PAYMENT: "PAYMENT",
  SYSTEM: "SYSTEM",
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export const NotificationTargetRole = {
  PLAYER: "PLAYER",
  OWNER: "OWNER",
  ADMIN: "ADMIN",
} as const;

export type NotificationTargetRole =
  (typeof NotificationTargetRole)[keyof typeof NotificationTargetRole];

export interface NotificationItem {
  id: string;
  account_id: string;
  message: string;
  is_read: boolean;
  type: NotificationType;
  target_role: NotificationTargetRole;
  link_to?: string | null;
  created_at: string;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface NotificationListData {
  notifications: NotificationItem[];
  pagination: NotificationPagination;
}

