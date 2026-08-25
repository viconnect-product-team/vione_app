// Shared mock data for remaining feature pages.

export type Notification = {
  id: string;
  title: string;
  body: string;
  audience: "all" | "members" | "sponsors" | "staff";
  channel: "inapp" | "email" | "sms";
  sentAt: string;
  reach: number;
  status: "sent" | "scheduled" | "draft";
};

export type NewsArticle = {
  id: string;
  title: string;
  category: string;
  author: string;
  publishedAt: string;
  views: number;
  status: "published" | "draft" | "scheduled";
  excerpt: string;
};

export type ActivityLog = {
  id: string;
  user: string;
  action: string;
  target: string;
  category: "auth" | "member" | "fee" | "event" | "system";
  at: string;
  ip: string;
};

export function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}
