const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface RequestOptions extends RequestInit {
  token?: string | null;
}

type ApiListResponse = {
  data?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

type ApiItemResponse = {
  data?: Record<string, unknown>;
  [key: string]: unknown;
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    options?: RequestOptions,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = options?.token || localStorage.getItem("adminToken");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (
      options?.headers &&
      !Array.isArray(options.headers) &&
      !(options.headers instanceof Headers)
    ) {
      Object.assign(headers, options.headers);
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: options?.body,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // ====== Events ======
  async getEvents() {
    return this.request<ApiListResponse>("/events", "GET");
  }

  async getEventById(id: string) {
    return this.request<ApiItemResponse>(`/events/${id}`, "GET");
  }

  async createEvent(data: Record<string, unknown>, token?: string | null) {
    return this.request<ApiItemResponse>("/events/add", "POST", {
      body: JSON.stringify(data),
      token: token || undefined,
    });
  }

  async updateEvent(
    id: string,
    data: Record<string, unknown>,
    token?: string | null,
  ) {
    return this.request<ApiItemResponse>(`/events/${id}`, "PUT", {
      body: JSON.stringify(data),
      token: token || undefined,
    });
  }

  async deleteEvent(id: string, token?: string | null) {
    return this.request<Record<string, unknown>>(`/events/${id}`, "DELETE", {
      token: token || undefined,
    });
  }

  // ====== Venues ======
  async getVenues() {
    return this.request<ApiListResponse>("/venue/getVenue", "GET");
  }

  async createVenue(data: Record<string, unknown>, token?: string | null) {
    return this.request<ApiItemResponse>("/venue/add", "POST", {
      body: JSON.stringify(data),
      token: token || undefined,
    });
  }

  async updateVenue(
    id: string,
    data: Record<string, unknown>,
    token?: string | null,
  ) {
    return this.request<ApiItemResponse>(`/venue/updateVenue/${id}`, "PUT", {
      body: JSON.stringify(data),
      token: token || undefined,
    });
  }

  async deleteVenue(id: string, token?: string | null) {
    return this.request<Record<string, unknown>>(
      `/venue/deleteVenue/${id}`,
      "DELETE",
      {
        token: token || undefined,
      },
    );
  }

  // ====== Reservations ======
  async getReservations(token?: string | null) {
    return this.request<ApiListResponse>("/reservations/me", "GET", {
      token: token || undefined,
    });
  }

  async createReservation(
    data: Record<string, unknown>,
    token?: string | null,
  ) {
    return this.request<ApiItemResponse>("/reservations/reserve", "POST", {
      body: JSON.stringify(data),
      token: token || undefined,
    });
  }

  async cancelReservation(id: string, token?: string | null) {
    return this.request<Record<string, unknown>>(
      "/reservations/cancel",
      "POST",
      {
        body: JSON.stringify({ reservation_id: id }),
        token: token || undefined,
      },
    );
  }

  // ====== Users ======
  async getCurrentUser(token?: string | null) {
    return this.request<ApiItemResponse>("/users/me", "GET", {
      token: token || undefined,
    });
  }

  async checkUserExists(email: string) {
    return this.request<Record<string, unknown>>("/users/check", "POST", {
      body: JSON.stringify({ email }),
    });
  }
}

export const apiClient = new ApiClient();
