import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Search, Menu, User, ChevronRight, X } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { BlurText } from "../components/ui/BlurText";
import { HLSVideo } from "../components/ui/HLSVideo";
import { EventCard } from "../components/ui/EventCard";
import { CategoryFilter } from "../components/ui/CategoryFilter";
import { apiClient } from "../lib/api";
import { mapEventFromApi, type ApiEvent } from "../lib/mappers";
import type { EventItem } from "../types";
import { Link } from "react-router-dom";

const CATEGORIES = ["All", "Music", "Sports", "Cultural", "Business", "Fashion"];

export function LandingPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    apiClient.getEvents()
      .then((res) => {
        const mapped = (res.data as ApiEvent[])?.map((e: ApiEvent) => mapEventFromApi(e)) || [];
        setEvents(mapped);
      })
      .catch((err) => console.error("Failed to fetch events", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           e.venue.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || 
                              e.status === "active"; // Placeholder logic until categories are in API
      return matchesSearch && matchesCategory;
    });
  }, [events, searchQuery, selectedCategory]);

  const featuredEvents = useMemo(() => {
    return filteredEvents.filter(e => e.status === "active").slice(0, 4);
  }, [filteredEvents]);

  const upcomingEvents = useMemo(() => {
    return filteredEvents.slice(0, 8);
  }, [filteredEvents]);

  return (
    <div className="bg-black text-white font-body selection:bg-white selection:text-black min-h-screen">
      {/* NAVIGATION */}
      <nav className="fixed top-4 left-0 right-0 z-50 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="SinoTicket" className="w-10 h-10 object-contain" />
            <span className="font-heading italic text-2xl tracking-tighter hidden sm:block">SinoTicket</span>
          </Link>
          
          <div className="hidden lg:flex liquid-glass rounded-full px-6 py-2 items-center gap-8 border border-white/5 shadow-2xl">
            {["Events", "Venues", "Insights", "About"].map((link) => (
              <a key={link} href={`#${link.toLowerCase()}`} className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                {link}
              </a>
            ))}
            <div className="w-px h-4 bg-white/10" />
            <Link to="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors flex items-center gap-2">
              <User size={14} /> Login
            </Link>
            <Link to="/register" className="bg-white text-black rounded-full px-5 py-2 text-sm font-bold flex items-center gap-1.5 hover:bg-white/90 transition-all hover:scale-105 active:scale-95">
              REGISTER <ArrowUpRight size={16} />
            </Link>
          </div>

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden liquid-glass-strong p-3 rounded-full border border-white/10"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-black pt-24 px-6 lg:hidden"
          >
            <div className="flex flex-col gap-6">
              {["Events", "Venues", "Insights", "Login", "Register"].map((link) => (
                <Link 
                  key={link} 
                  to={link === "Login" ? "/login" : link === "Register" ? "/register" : "#"} 
                  className="text-4xl font-heading italic text-white/60 hover:text-white transition-colors border-b border-white/5 pb-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden pt-20">
        <HLSVideo 
          src="https://stream.mux.com/NcU3HlHeF7CUL86azTTzpy3Tlb00d6iF3BmCdFslMJYM.m3u8"
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black z-[1]" />
        
        <div className="relative z-10 w-full max-w-5xl px-6 text-center">
          <BlurText 
            text="All Chadian Events In Your Pocket" 
            className="text-5xl md:text-7xl lg:text-[6.5rem] font-heading italic text-white leading-[0.85] tracking-[-0.04em] mb-12"
          />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="relative max-w-2xl mx-auto group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative liquid-glass-strong rounded-full p-2 flex items-center gap-2 border border-white/10 shadow-2xl">
              <div className="pl-6 text-white/30 truncate">
                <Search size={20} />
              </div>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, artists, venues..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/20 text-lg py-3"
              />
              <button className="bg-white text-black px-8 py-3 rounded-full font-bold text-sm tracking-widest hover:bg-neutral-200 transition-colors hidden sm:block">
                SEARCH
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-6 -mt-20 relative z-20 pb-32">
        {/* CATEGORIES */}
        <section className="mb-20">
          <CategoryFilter 
            categories={CATEGORIES} 
            selected={selectedCategory} 
            onSelect={setSelectedCategory} 
          />
        </section>

        {/* FEATURED EVENTS */}
        {!searchQuery && selectedCategory === "All" && (
          <section className="mb-24">
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-4xl md:text-5xl font-heading italic text-white">Featured Events</h2>
              <div className="flex gap-2">
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:bg-white/5 cursor-pointer transition-colors">
                  <X size={16} className="rotate-45" />
                </div>
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:bg-white/5 cursor-pointer transition-colors">
                  <ArrowUpRight size={16} />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="aspect-[4/5] rounded-[2rem] bg-white/5 animate-pulse" />
                ))
              ) : featuredEvents.map(event => (
                <EventCard key={event.id} event={event} variant="featured" />
              ))}
            </div>
          </section>
        )}

        {/* UPCOMING EVENTS */}
        <section>
          <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-6">
            <h2 className="text-4xl font-heading italic text-white">
              {searchQuery ? `Search Results (${filteredEvents.length})` : "Happening Soon"}
            </h2>
            <Link to="/events" className="text-sm font-medium text-white/40 hover:text-white transition-colors flex items-center gap-1.5 uppercase tracking-widest">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-28 rounded-3xl bg-white/5 animate-pulse" />
              ))
            ) : upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} variant="compact" />
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-white/20">
                <Search size={48} className="mx-auto mb-4 opacity-10" />
                <p>No events match your search criteria.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-zinc-950 pt-32 pb-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-8">
                <img src="/logo.png" alt="SinoTicket" className="w-12 h-12 object-contain" />
                <span className="font-heading italic text-3xl tracking-tighter">SinoTicket</span>
              </Link>
              <p className="text-white/40 text-lg font-light max-w-md leading-relaxed mb-8">
                The premier event ticketing platform in Chad. Discover music, sports, cultural festivals and more with a seamless experience.
              </p>
              <div className="flex gap-4">
                {/* Social links placeholder */}
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/20 hover:text-white transition-colors cursor-pointer" />
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-8">Navigation</h4>
              <ul className="space-y-4 text-white/40 text-base font-light">
                {["Home", "Events", "Venues", "Booking", "Support"].map(item => (
                  <li key={item} className="hover:text-white transition-colors cursor-pointer">{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-8">Legal</h4>
              <ul className="space-y-4 text-white/40 text-base font-light">
                {["Privacy Policy", "Terms of Use", "Cookie Policy", "Contact Us"].map(item => (
                  <li key={item} className="hover:text-white transition-colors cursor-pointer">{item}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-white/20 text-xs font-light">
            <p>© 2026 SinoTicket Entertainment. All rights reserved.</p>
            <p>Built with ❤️ for Chad.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

