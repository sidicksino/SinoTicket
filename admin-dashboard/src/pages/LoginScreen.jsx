import React from 'react';
import { TechOrbitDisplay } from '../components/auth/TechOrbitDisplay';
import { AnimatedForm } from '../components/auth/AnimatedForm';

export default function LoginScreen() {
  return (
    <div className="min-h-screen w-full flex bg-[#030712] overflow-hidden selection:bg-blue-500/30">
      
      {/* Left Column - Tech & Platform Branding */}
      <div className="hidden lg:flex w-1/2 relative">
        <TechOrbitDisplay />
        
        {/* Decorative corner glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none"></div>
      </div>

      {/* Right Column - Custom Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative p-8">
        {/* Subtle background element for the form side */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <AnimatedForm />
      </div>
    </div>
  );
}
