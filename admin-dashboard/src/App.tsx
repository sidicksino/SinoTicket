import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./components/layout/AdminLayout";
import { EventsPage } from "./pages/EventsPage";
import { InsightsPage } from "./pages/InsightsPage";
import { OverviewPage } from "./pages/OverviewPage";
import { ReservationsPage } from "./pages/ReservationsPage";
import { UsersPage } from "./pages/UsersPage";
import { VenuesPage } from "./pages/VenuesPage";
import { LandingPage } from "./pages/LandingPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="venues" element={<VenuesPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="reservations" element={<ReservationsPage />} />
        <Route path="insights" element={<InsightsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
