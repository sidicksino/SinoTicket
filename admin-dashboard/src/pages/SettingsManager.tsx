import { Globe, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { setLocale, useTranslation } from "../i18n";

export default function SettingsManager() {
  const { theme, toggle } = useTheme();
  const { t, locale } = useTranslation();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text">{t("admin.nav.settings")}</h2>
          <p className="text-subtext mt-1">Manage your platform preferences.</p>
        </div>
      </div>

      <div className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* Theme Card */}
          <div className="bg-card rounded-3xl border border-card-border p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-4 text-primary">
              <div className="p-3 bg-primary/10 rounded-2xl">
                {theme === "dark" ? <Moon size={24} /> : <Sun size={24} />}
              </div>
              <div>
                <h3 className="font-bold text-text text-lg">Platform Theme</h3>
                <p className="text-subtext text-xs">Switch between dark and light modes.</p>
              </div>
            </div>
            
            <div className="mt-4 flex gap-3">
               <button 
                 onClick={() => theme !== "light" && toggle()}
                 className={`flex-1 py-3 px-4 font-bold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                   theme === "light" 
                     ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                     : "bg-input-bg text-subtext border-card-border hover:bg-card-border/50"
                 }`}
               >
                 <Sun size={18} /> Light
               </button>
               <button 
                 onClick={() => theme !== "dark" && toggle()}
                 className={`flex-1 py-3 px-4 font-bold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                   theme === "dark" 
                     ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                     : "bg-input-bg text-subtext border-card-border hover:bg-card-border/50"
                 }`}
               >
                 <Moon size={18} /> Dark
               </button>
            </div>
          </div>

          {/* Language Card */}
          <div className="bg-card rounded-3xl border border-card-border p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-4 text-primary">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Globe size={24} />
              </div>
              <div>
                <h3 className="font-bold text-text text-lg">System Language</h3>
                <p className="text-subtext text-xs">Change the language of the dashboard.</p>
              </div>
            </div>
            
            <div className="mt-4 flex gap-3">
               <button 
                 onClick={() => setLocale("en")}
                 className={`flex-1 py-3 px-4 font-bold rounded-xl border flex items-center justify-center transition-all ${
                   locale === "en" 
                     ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                     : "bg-input-bg text-subtext border-card-border hover:bg-card-border/50"
                 }`}
               >
                 English
               </button>
               <button 
                 onClick={() => setLocale("fr")}
                 className={`flex-1 py-3 px-4 font-bold rounded-xl border flex items-center justify-center transition-all ${
                   locale === "fr" 
                     ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                     : "bg-input-bg text-subtext border-card-border hover:bg-card-border/50"
                 }`}
               >
                 Français
               </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
