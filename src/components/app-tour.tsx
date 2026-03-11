"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface TourStep {
  title: string;
  description: string;
  targetId: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to DailyTaskTrack!",
    description: "Your new command center for productivity. Let's take a 30-second tour of the main features.",
    targetId: "tour-header",
  },
  {
    title: "The Focus Engine",
    description: "This is your Pomodoro Timer. Use it to work in 25-minute sprints. It automatically tracks your 'Deep Work' sessions.",
    targetId: "tour-timer",
  },
  {
    title: "Interactive Planning",
    description: "Click any date on this calendar to view or schedule tasks. The dots show your daily workload at a glance.",
    targetId: "tour-calendar",
  },
  {
    title: "Daily Mission Control",
    description: "Manage your tasks for the selected day here. You can search, filter by labels, and track your completion rate.",
    targetId: "tour-tasks",
  },
  {
    title: "Smart Task Creation",
    description: "Click here to add a new task. You can set priorities, add detailed notes, and assign high-contrast labels.",
    targetId: "tour-add-task",
  },
  {
    title: "Navigation & Insights",
    description: "Quickly jump to your Time Tracking logs, view detailed Productivity Analytics, or manage your custom Labels.",
    targetId: "tour-nav",
  },
];

export function AppTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const clearHighlights = useCallback(() => {
    document.querySelectorAll(".tour-highlight").forEach((el) => {
      el.classList.remove("tour-highlight");
    });
  }, []);

  const applyHighlight = useCallback((stepIndex: number) => {
    clearHighlights();
    const step = TOUR_STEPS[stepIndex];
    const element = document.getElementById(step.targetId);
    if (element) {
      element.classList.add("tour-highlight");
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [clearHighlights]);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("daily_task_track_tour_seen");
    if (!hasSeenTour) {
      // Small delay to ensure layout is ready
      setTimeout(() => {
        setIsOpen(true);
        applyHighlight(0);
      }, 1000);
    }
  }, [applyHighlight]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      applyHighlight(nextStep);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      applyHighlight(prevStep);
    }
  };

  const handleComplete = () => {
    setIsOpen(false);
    clearHighlights();
    localStorage.setItem("daily_task_track_tour_seen", "true");
  };

  const restartTour = () => {
    setCurrentStep(0);
    setIsOpen(true);
    applyHighlight(0);
  };

  useEffect(() => {
    (window as any).restartAppTour = restartTour;
  }, [applyHighlight]);

  const step = TOUR_STEPS[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) clearHighlights();
    }}>
      <DialogContent className="sm:max-w-[400px] border-primary/20 shadow-2xl">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-primary text-white p-3 rounded-full shadow-xl">
          <Info className="w-6 h-6" />
        </div>
        
        <DialogHeader className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40">
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </span>
          </div>
          <DialogTitle className="text-xl font-black text-primary tracking-tight">
            {step.title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium leading-relaxed pt-2">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-row items-center justify-between sm:justify-between pt-6 border-t gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handlePrev} 
            disabled={currentStep === 0}
            className="text-xs font-bold uppercase tracking-widest h-9 px-4 rounded-xl"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="flex gap-1">
            {TOUR_STEPS.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  i === currentStep ? "bg-primary w-4" : "bg-primary/20"
                )} 
              />
            ))}
          </div>
          <Button 
            size="sm" 
            onClick={handleNext}
            className="text-xs font-bold uppercase tracking-widest h-9 px-4 rounded-xl shadow-lg shadow-primary/20"
          >
            {currentStep === TOUR_STEPS.length - 1 ? (
              <>
                Got it
                <Check className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
