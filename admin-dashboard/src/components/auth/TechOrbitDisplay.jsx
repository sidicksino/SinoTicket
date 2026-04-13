import {
  Activity,
  BarChart,
  Calendar,
  Cpu,
  Globe,
  Layers,
  MapPin,
  MonitorPlay,
  Radio,
  Settings,
  ShieldCheck,
  Ticket,
  Users
} from 'lucide-react';
import { memo } from 'react';
import { OrbitingCircles } from '../ui/OrbitingCircles';
import { Ripple } from '../ui/Ripple';

export const TechOrbitDisplay = memo(function TechOrbitDisplay({
  text = 'SinoTicket Admin',
}) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#030712]">
      {/* Background Ripple Effect */}
      <Ripple />

      {/* Center Branding Text */}
      <div className="relative z-10 text-center select-none pointer-events-none">
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-600 drop-shadow-2xl tracking-tighter">
          {text}
        </h1>
        <div className="mt-2 h-1 w-32 bg-blue-600 mx-auto rounded-full blur-[1px]"></div>
      </div>

      {/* 5 Orbiting Circles for high-fidelity radar look */}
      
      {/* Circle 1 - Radius 50 (Core) */}
      <OrbitingCircles radius={90} duration={12}>
        <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-500/20">
          <Ticket size={16} />
        </div>
      </OrbitingCircles>
      <OrbitingCircles radius={90} duration={12} delay={6}>
        <div className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-rose-400">
          <Calendar size={16} />
        </div>
      </OrbitingCircles>

      {/* Circle 2 - Radius 90 (System) */}
      <OrbitingCircles radius={130} duration={18} reverse>
        <div className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400">
          <Activity size={16} />
        </div>
      </OrbitingCircles>
      <OrbitingCircles radius={130} duration={18} delay={6} reverse>
        <div className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-yellow-400">
          <Radio size={16} />
        </div>
      </OrbitingCircles>
      <OrbitingCircles radius={130} duration={18} delay={12} reverse>
        <div className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-blue-400">
          <Cpu size={16} />
        </div>
      </OrbitingCircles>

      {/* Circle 3 - Radius 130 (Management) */}
      <OrbitingCircles radius={170} duration={25}>
        <div className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-cyan-400">
          <Users size={16} />
        </div>
      </OrbitingCircles>
      <OrbitingCircles radius={170} duration={25} delay={8}>
        <div className="p-2 bg-blue-600/20 border border-blue-500/50 rounded-lg text-blue-400">
          <Ticket size={16} />
        </div>
      </OrbitingCircles>
      <OrbitingCircles radius={170} duration={25} delay={16}>
        <div className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-amber-400">
          <BarChart size={16} />
        </div>
      </OrbitingCircles>

      {/* Circle 4 - Radius 170 (Network) */}
      <OrbitingCircles radius={210} duration={32} reverse>
        <div className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-purple-400">
          <Globe size={16} />
        </div>
      </OrbitingCircles>
      <OrbitingCircles radius={210} duration={32} delay={11} reverse>
        <div className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-emerald-500">
          <MapPin size={16} />
        </div>
      </OrbitingCircles>
      <OrbitingCircles radius={210} duration={32} delay={22} reverse>
        <div className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-orange-400">
          <ShieldCheck size={16} />
        </div>
      </OrbitingCircles>

      {/* Circle 5 - Radius 210 (Infrastructure) */}
      <OrbitingCircles radius={250} duration={45}>
        <div className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-indigo-400">
          <MonitorPlay size={16} />
        </div>
      </OrbitingCircles>
      <OrbitingCircles radius={250} duration={45} delay={9}>
        <div className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-pink-400">
          <Ticket size={16} />
        </div>
      </OrbitingCircles>
      <OrbitingCircles radius={250} duration={45} delay={18}>
        <div className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-teal-400">
          <Settings size={16} />
        </div>
      </OrbitingCircles>
      <OrbitingCircles radius={250} duration={45} delay={27}>
        <div className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-sky-400">
          <Layers size={16} />
        </div>
      </OrbitingCircles>
      <OrbitingCircles radius={250} duration={45} delay={36}>
        <div className="p-2 bg-blue-600/30 border border-blue-500/50 rounded-lg text-blue-400">
          <Ticket size={16} />
        </div>
      </OrbitingCircles>

    </div>
  );
});
