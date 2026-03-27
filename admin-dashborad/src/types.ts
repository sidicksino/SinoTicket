export type EntityStatus = "active" | "draft" | "paused" | "archived";

export interface EventItem {
  id: string;
  name: string;
  date: string;
  venue: string;
  capacity: number;
  price: number;
  status: EntityStatus;
}

export interface VenueItem {
  id: string;
  name: string;
  city: string;
  seats: number;
  status: EntityStatus;
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "support";
  status: EntityStatus;
}

export interface ReservationItem {
  id: string;
  ticketCode: string;
  event: string;
  customer: string;
  seats: number;
  total: number;
  status: EntityStatus;
  createdAt: string;
}

export interface MetricCard {
  title: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "steady";
}

export interface SalesPoint {
  month: string;
  gross: number;
  net: number;
}

export interface SegmentPoint {
  name: string;
  value: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface DashboardSeed {
  events: EventItem[];
  venues: VenueItem[];
  users: UserItem[];
  reservations: ReservationItem[];
  metrics: MetricCard[];
  salesSeries: SalesPoint[];
  occupancySeries: SegmentPoint[];
  recentActivity: ActivityItem[];
}
