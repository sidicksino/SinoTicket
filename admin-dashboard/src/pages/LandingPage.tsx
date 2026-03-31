import { motion } from "framer-motion";
import { ArrowUpRight, BarChart3, Palette, Play, Shield, Zap } from "lucide-react";
import { BlurText } from "../components/ui/BlurText";
import { HLSVideo } from "../components/ui/HLSVideo";

const navLinks = ["Home", "Services", "Work", "Process", "Pricing"];

const partners = ["Stripe", "Vercel", "Linear", "Notion", "Figma"];

const featuresChess = [
  {
    badge: "Capabilities",
    title: "Designed to convert. Built to perform.",
    description: "Every pixel is intentional. Our AI studies what works across thousands of top sites—then builds yours to outperform them all.",
    buttonText: "Learn more",
    image: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHYyYWR3Ynd4Ynd4Ynd4Ynd4Ynd4Ynd4Ynd4Ynd4Ynd4Ynd4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxy6yYxZ5C/giphy.gif",
    reverse: false,
  },
  {
    badge: "Capabilities",
    title: "It gets smarter. Automatically.",
    description: "Your site evolves on its own. AI monitors every click, scroll, and conversion—then optimizes in real time. No manual updates. Ever.",
    buttonText: "See how it works",
    image: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHYyYWR3Ynd4Ynd4Ynd4Ynd4Ynd4Ynd4Ynd4Ynd4Ynd4Ynd4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l41lTfuxV37R4qP68/giphy.gif",
    reverse: true,
  },
];

const featuresGrid = [
  {
    icon: Zap,
    title: "Days, Not Months",
    description: "Concept to launch at a pace that redefines fast.",
  },
  {
    icon: Palette,
    title: "Obsessively Crafted",
    description: "Every detail considered. Every element refined.",
  },
  {
    icon: BarChart3,
    title: "Built to Convert",
    description: "Layouts informed by data. Decisions backed by performance.",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    description: "Enterprise-grade protection comes standard.",
  },
];

const stats = [
  { value: "200+", label: "Sites launched" },
  { value: "98%", label: "Client satisfaction" },
  { value: "3.2x", label: "More conversions" },
  { value: "5 days", label: "Average delivery" },
];

const testimonials = [
  {
    quote: "A complete rebuild in five days...",
    name: "Sarah Chen",
    role: "CEO Luminary",
  },
  {
    quote: "Conversions up 4x...",
    name: "Marcus Webb",
    role: "Head of Growth Arcline",
  },
  {
    quote: "They didn't just design our site...",
    name: "Elena Voss",
    role: "Brand Director Helix",
  },
];

export function LandingPage() {
  return (
    <div className="bg-black text-white font-body selection:bg-white selection:text-black">
      {/* SECTION 1 — NAVBAR */}
      <nav className="fixed top-4 left-0 right-0 z-50 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
          
          <div className="liquid-glass rounded-full px-6 py-2 flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-sm font-medium text-white/90 hover:text-white transition-colors"
              >
                {link}
              </a>
            ))}
            <button className="bg-white text-black rounded-full px-5 py-2 text-sm font-medium flex items-center gap-1.5 hover:bg-white/90 transition-colors">
              Get Started <ArrowUpRight size={16} />
            </button>
          </div>
          
          <div className="w-12 h-12 md:hidden" /> {/* Spacer for mobile layout */}
        </div>
      </nav>

      {/* SECTION 2 — HERO */}
      <section className="relative h-[1000px] overflow-visible bg-black flex flex-col items-center">
        <video
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
          autoPlay loop muted playsInline
          className="absolute top-[20%] w-full h-auto object-contain z-0"
        />
        <div className="absolute inset-0 bg-black/5 z-0" />
        <div className="absolute bottom-0 left-0 right-0 z-[1] h-[300px] bg-gradient-to-t from-black to-transparent" />
        
        <div className="relative z-10 pt-[150px] flex flex-col items-center text-center px-6">
          <div className="liquid-glass rounded-full px-4 py-1.5 flex items-center gap-2 mb-8 animate-fade-in">
            <span className="bg-white text-black rounded-full px-2 py-0.5 text-[10px] uppercase font-semibold">New</span>
            <span className="text-xs font-medium text-white">Introducing AI-powered web design.</span>
          </div>
          
          <BlurText 
            text="The Website Your Brand Deserves" 
            className="text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.8] tracking-[-4px] max-w-4xl"
          />
          
          <motion.p 
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-8 text-white/60 text-lg max-w-xl font-light"
          >
            Stunning design. Blazing performance. Built by AI, refined by experts. This is web design, wildly reimagined.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="mt-12 flex items-center gap-4"
          >
            <button className="liquid-glass-strong rounded-full px-8 py-4 flex items-center gap-2 text-white font-medium hover:bg-white/5 transition-all">
              Get Started <ArrowUpRight size={20} />
            </button>
            <button className="text-white font-medium flex items-center gap-2 px-8 py-4 hover:opacity-80 transition-all">
              <Play size={20} fill="currentColor" /> Watch the Film
            </button>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3 — PARTNERS BAR */}
      <section className="bg-black py-24 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="liquid-glass rounded-full px-4 py-1.5 text-xs font-medium text-white mb-12">
            Trusted by the teams behind
          </div>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24">
            {partners.map((partner) => (
              <span key={partner} className="text-2xl md:text-3xl font-heading italic text-white/40 hover:text-white transition-colors cursor-default">
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — START SECTION ("How It Works") */}
      <section className="relative min-h-[700px] py-32 px-6 md:px-16 lg:px-24 flex items-center justify-center text-center overflow-hidden">
        <HLSVideo 
          src="https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute top-0 left-0 right-0 h-[200px] bg-gradient-to-b from-black to-transparent z-[1]" />
        <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-black to-transparent z-[1]" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white inline-block mb-4">
            How It Works
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white mb-6 leading-tight">
            You dream it. We ship it.
          </h2>
          <p className="text-white/60 text-lg mb-10 font-light">
            Share your vision. Our AI handles the rest—wireframes, design, code, launch. All in days, not quarters.
          </p>
          <button className="liquid-glass-strong rounded-full px-8 py-4 flex items-center gap-2 text-white font-medium mx-auto hover:bg-white/5 transition-all">
            Get Started <ArrowUpRight size={20} />
          </button>
        </div>
      </section>

      {/* SECTION 5 — FEATURES CHESS */}
      <section className="py-24 px-6 md:px-16 lg:px-24 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-24">
            <div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white inline-block mb-4">
              Capabilities
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white leading-[0.9]">
              Pro features. Zero complexity.
            </h2>
          </div>
          
          <div className="space-y-32">
            {featuresChess.map((feature, idx) => (
              <div key={idx} className={`flex flex-col ${feature.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16 md:gap-24`}>
                <div className="flex-1 text-left">
                  <h3 className="text-3xl md:text-4xl font-heading italic text-white mb-6">
                    {feature.title}
                  </h3>
                  <p className="text-white/60 text-base mb-8 font-light leading-relaxed">
                    {feature.description}
                  </p>
                  <button className="liquid-glass-strong rounded-full px-6 py-3 text-white font-medium hover:bg-white/5 transition-all">
                    {feature.buttonText}
                  </button>
                </div>
                <div className="flex-1 w-full">
                  <div className="liquid-glass rounded-2xl overflow-hidden aspect-video">
                    <img src={feature.image} alt={feature.title} className="w-full h-full object-cover opacity-80" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — FEATURES GRID */}
      <section className="py-24 px-6 md:px-16 lg:px-24 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-16">
            <div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white inline-block mb-4">
              Why Us
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white leading-[0.9]">
              The difference is everything.
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuresGrid.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div key={idx} className="liquid-glass rounded-2xl p-8 flex flex-col gap-6">
                  <div className="liquid-glass-strong rounded-full w-12 h-12 flex items-center justify-center text-white/80">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading italic text-white mb-3">
                      {card.title}
                    </h3>
                    <p className="text-white/60 font-body font-light text-sm leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 7 — STATS */}
      <section className="relative py-32 px-6 overflow-hidden">
        <HLSVideo 
          src="https://stream.mux.com/NcU3HlHeF7CUL86azTTzpy3Tlb00d6iF3BmCdFslMJYM.m3u8"
          style={{ filter: 'saturate(0)' }}
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute top-0 left-0 right-0 h-[200px] bg-gradient-to-b from-black to-transparent z-[1]" />
        <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-black to-transparent z-[1]" />
        
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="liquid-glass rounded-3xl p-12 md:p-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center">
              {stats.map((stat, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <span className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white">
                    {stat.value}
                  </span>
                  <span className="text-white/60 font-body font-light text-xs uppercase tracking-widest">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8 — TESTIMONIALS */}
      <section className="py-24 px-6 md:px-16 lg:px-24 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-16">
            <div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white inline-block mb-4">
              What They Say
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white leading-[0.9]">
              Don't take our word for it.
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="liquid-glass rounded-2xl p-10 flex flex-col justify-between">
                <p className="text-white/80 font-body font-light text-lg italic leading-relaxed mb-10">
                  "{t.quote}"
                </p>
                <div>
                  <h4 className="text-white font-body font-medium text-base mb-1">
                    {t.name}
                  </h4>
                  <p className="text-white/50 font-body font-light text-sm">
                    {t.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9 — CTA FOOTER */}
      <section className="relative pt-48 pb-24 px-6 overflow-hidden">
        <HLSVideo 
          src="https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute top-0 left-0 right-0 h-[200px] bg-gradient-to-b from-black to-transparent z-[1]" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading italic text-white mb-8 leading-[0.9]">
            Your next website starts here.
          </h2>
          <p className="text-white/60 text-xl font-light mb-12">
            Book a free strategy call. See what AI-powered design can do.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-32">
            <button className="liquid-glass-strong rounded-full px-10 py-5 text-white font-medium w-full sm:w-auto hover:bg-white/5 transition-all">
              Book a Call
            </button>
            <button className="bg-white text-black rounded-full px-10 py-5 font-medium w-full sm:w-auto hover:bg-white/90 transition-all">
              View Pricing
            </button>
          </div>
          
          <footer className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-white/40 text-xs">© 2026 Studio</p>
            <div className="flex items-center gap-8 text-white/40 text-xs">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
}
