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
  LayoutGrid
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const FLOAT_ITEMS = [
  { title: "Notes", url: "/notes", icon: StickyNote },
  { title: "Growth", url: "/mindfulness", icon: Sparkles },
  { title: "Health", url: "/health", icon: Apple },
  { title: "Workout", url: "/exercise", icon: Dumbbell },
  { title: "Travel", url: "/travel", icon: Compass },
  { title: "Wallet", url: "/expenses", icon: Wallet },
];

export function FloatButtonGroup() {
  const [isOpen, setIsOpen] = useState(false);

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
                    className="h-12 px-6 gap-3 rounded-[1.25rem] shadow-lg bg-white text-primary hover:bg-slate-50 border border-primary/10 transition-all font-black uppercase tracking-widest text-[10px]"
                  >
                    <item.icon className="w-5 h-5" />
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
          "w-16 h-16 rounded-[2rem] shadow-2xl transition-all duration-300 active:scale-90 ring-4 ring-background",
          isOpen 
            ? "bg-destructive hover:bg-destructive/90 rotate-90" 
            : "bg-primary hover:bg-primary/90 hover:shadow-primary/40"
        )}
      >
        {isOpen ? <X className="w-8 h-8" /> : <LayoutGrid className="w-8 h-8" />}
      </Button>
    </div>
  );
}
