"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  X, 
  StickyNote, 
  Sparkles, 
  Apple, 
  Dumbbell, 
  Compass, 
  Wallet,
  LayoutGrid,
  CalendarDays
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";

const FLOAT_ITEMS = [
  { title: "Routines", url: "/routines", icon: CalendarDays, color: "text-blue-500", hoverBg: "hover:text-blue-600" },
  { title: "Notes", url: "/notes", icon: StickyNote, color: "text-amber-500", hoverBg: "hover:text-amber-600" },
  { title: "Growth", url: "/mindfulness", icon: Sparkles, color: "text-purple-500", hoverBg: "hover:text-purple-600" },
  { title: "Health", url: "/health", icon: Apple, color: "text-sky-500", hoverBg: "hover:text-sky-600" },
  { title: "Workout", url: "/exercise", icon: Dumbbell, color: "text-orange-500", hoverBg: "hover:text-orange-600" },
  { title: "Travel", url: "/travel", icon: Compass, color: "text-emerald-500", hoverBg: "hover:text-emerald-600" },
  { title: "Wallet", url: "/expenses", icon: Wallet, color: "text-emerald-600", hoverBg: "hover:text-emerald-700" },
];

export function FloatButtonGroup() {
  const { user, loading } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  if (loading || !user) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col items-end gap-3 mb-2">
            {FLOAT_ITEMS.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                transition={{ delay: (FLOAT_ITEMS.length - i - 1) * 0.05, type: "spring", stiffness: 260, damping: 20 }}
              >
                <Link href={item.url}>
                  <Button 
                    variant="ghost"
                    className={cn(
                      "h-12 px-6 gap-3 rounded-[1.25rem] shadow-lg bg-white text-slate-600 border border-primary/10 transition-all font-black uppercase tracking-widest text-[10px]",
                      item.hoverBg
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 transition-colors", item.color)} />
                    <span>{item.title}</span>
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-[2rem] shadow-2xl transition-all duration-300 active:scale-90 ring-4 ring-background text-white",
          "bg-blue-600 hover:bg-blue-700",
          isOpen && "rotate-90"
        )}
      >
        {isOpen ? <X className="w-8 h-8" /> : <LayoutGrid className="w-8 h-8" />}
      </Button>
    </div>
  );
}