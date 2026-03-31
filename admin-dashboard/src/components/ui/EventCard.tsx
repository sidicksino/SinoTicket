import { motion } from "framer-motion";
import { Calendar, MapPin, ChevronRight } from "lucide-react";
import type { EventItem } from "../types";

interface EventCardProps {
  event: EventItem;
  variant?: "featured" | "compact";
  onClick?: () => void;
}

export function EventCard({ event, variant = "compact", onClick }: EventCardProps) {
  if (variant === "featured") {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="relative group cursor-pointer overflow-hidden rounded-[2rem] aspect-[4/5] md:aspect-[3/4] lg:aspect-[4/5] bg-zinc-900"
      >
        <img
          src={event.date === "TBA" ? "https://images.unsplash.com/photo-1540575861501-7ad058c67a3f?q=80&w=800" : "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=800"}
          alt={event.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black mb-4">
            {event.status === "active" ? "FEATURED" : event.status.toUpperCase()}
          </div>
          <h3 className="text-3xl font-heading italic text-white leading-tight mb-4 group-hover:underline decoration-white/30 underline-offset-4">
            {event.name}
          </h3>
          <div className="flex items-center gap-4 text-white/70 text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={14} />
              <span className="truncate max-w-[120px]">{event.venue}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all cursor-pointer group"
    >
      <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
        <img
          src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400"
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-lg font-heading italic text-white truncate mb-1">
          {event.name}
        </h4>
        <div className="flex items-center gap-3 text-white/40 text-xs">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={12} />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>
      </div>
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 transition-colors group-hover:bg-white/10 group-hover:text-white">
        <ChevronRight size={18} />
      </div>
    </motion.div>
  );
}
