import type { EventItem, VenueItem, UserItem, ReservationItem } from "../types";

export interface ApiEvent {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  date?: string;
  venue_id?: { name: string; _id: string } | string;
  venue?: string;
  capacity?: number;
  price?: number;
  status?: string;
  category?: string;
  imageUrl?: string;
}

export function mapEventFromApi(data: ApiEvent | undefined): EventItem {
  if (!data) {
    return {
      id: "",
      name: "N/A",
      date: "TBA",
      venue: "N/A",
      capacity: 0,
      price: 0,
      status: "draft",
    };
  }
  return {
    id: data._id || data.id || "",
    name: data.title || data.name || "N/A",
    date: data.date ? new Date(data.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBA",
    venue: typeof data.venue_id === 'object' ? data.venue_id?.name : (data.venue_id || data.venue || "N/A"),
    capacity: data.capacity || 0,
    price: data.price || 0,
    status:
      data.status === "Upcoming" || data.status === "active"
        ? "active"
        : data.status === "Ongoing" || data.status === "draft"
          ? "draft"
          : "paused",
  };
}

export interface ApiVenue {
  _id?: string;
  id?: string;
  name?: string;
  location?: string;
  city?: string;
  capacity?: number;
  seats?: number;
}

export function mapVenueFromApi(data: ApiVenue | undefined): VenueItem {
  if (!data) {
    return { id: "", name: "N/A", city: "N/A", seats: 0, status: "active" };
  }
  return {
    id: data._id || data.id || "",
    name: data.name || "N/A",
    city: data.location || data.city || "N/A",
    seats: data.capacity || data.seats || 0,
    status: "active",
  };
}

export interface ApiUser {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: "admin" | "manager" | "support";
}

export function mapUserFromApi(data: ApiUser | undefined): UserItem {
  if (!data) {
    return { id: "", name: "N/A", email: "N/A", role: "support", status: "active" };
  }
  return {
    id: data._id || data.id || "",
    name: data.name || "N/A",
    email: data.email || "N/A",
    role: data.role || "support",
    status: "active",
  };
}

export interface ApiReservation {
  _id?: string;
  id?: string;
  ticketCode?: string;
  code?: string;
  eventName?: string;
  event?: string;
  customerName?: string;
  customer?: string;
  numberOfSeats?: number;
  seats?: number;
  totalPrice?: number;
  total?: number;
  status?: string;
  createdAt?: string;
}

export function mapReservationFromApi(data: ApiReservation | undefined): ReservationItem {
  if (!data) {
    return {
      id: "",
      ticketCode: "N/A",
      event: "N/A",
      customer: "N/A",
      seats: 0,
      total: 0,
      status: "draft",
      createdAt: new Date().toLocaleDateString(),
    };
  }
  return {
    id: data._id || data.id || "",
    ticketCode: data.ticketCode || data.code || "N/A",
    event: data.eventName || data.event || "N/A",
    customer: data.customerName || data.customer || "N/A",
    seats: data.numberOfSeats || data.seats || 0,
    total: data.totalPrice || data.total || 0,
    status: data.status === "Cancelled" ? "paused" : data.status ? "active" : "draft",
    createdAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
  };
}
