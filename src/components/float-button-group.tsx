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
  { title: "Notes", url: "/notes", icon: StickyNote, color: "bg-blue-500/10 text-blue-600 border border-blue-200/50 hover:bg-blue-500/20 dark:border-blue-800/30 dark:text-blue-400" },
  { title: "Growth", url: "/mindfulness", icon: Sparkles, color: "bg-purple-500/10 text-purple-600 border border-purple-200/50 hover:bg-purple-500/20 dark:border-purple-800/30 dark:text-purple-400" },
  { title: "Health", url: "/health", icon: Apple, color: "bg-sky-500/10 text-sky-600 border border-sky-200/50 hover:bg-sky-500/20 dark:border-sky-800/30 dark:text-sky-400" },
  { title: "Workout", url: "/exercise", icon: Dumbbell, color: "bg-orange-500/10 text-orange-600 border border-orange-200/50 hover:bg-orange-500/20 dark:border-orange-800/30 dark:text-orange-400" },
  { title: "Travel", url: "/travel", icon: Compass, color: "bg-emerald-500/10 text-emerald-600 border border-emerald-200/50 hover:bg-emerald-500/20 dark:border-emerald-800/30 dark:text-emerald-400" },
  { title: "Wallet", url: "/expenses", icon: Wallet, color: "bg-emerald-600/10 text-emerald-700 border border-emerald-200/50 hover:bg-emerald-600/20 dark:border-emerald-800/30 dark:text-emerald-500" },
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
                    className={cn(
                      "h-12 px-6 gap-3 rounded-[1.25rem] shadow-lg backdrop-blur-md hover:scale-105 transition-all font-black uppercase tracking-widest text-[10px]",
                      item.color
                    )}
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
