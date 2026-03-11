"use client";

import { useState, useEffect } from "react";
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
  position: "bottom" | "top" | "left" | "right";
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to DailyTaskTrack!",
    description: "Let's take a quick look at how to supercharge your productivity. This tour will guide you through the main features.",
    targetId: "tour-header",
    position: "bottom",
  },
  {
    title: "Master Your Time",
    description: "Use the integrated Pomodoro Timer to stay focused. It switches between 25-minute work sessions and 5-minute breaks automatically.",
    targetId: "tour-timer",
    position: "bottom",
  },
  {
    title: "Interactive Calendar",
    description: "Click any date to view or plan tasks for that specific day. The dots indicate how many tasks are scheduled and their status.",
    targetId: "tour-calendar",
    position: "right",
  },
  {
    title: "Daily Focus",
    description: "This is your command center for the day. You can search, filter by labels, and track your daily completion rate here.",
    targetId: "tour-tasks",
    position: "left",
  },
  {
    title: "Add a Task",
    description: "Ready to get started? Click this button to create your first task. You can set priorities, labels, and even add detailed notes.",
    targetId: "tour-add-task",
    position: "left",
  },
  {
    title: "Analytics & Logs",
    description: "Track your long-term progress and focus sessions here. You can even export your data to an Excel-compatible CSV file.",
    targetId: "tour-nav",
    position: "bottom",
  },
];

export function AppTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("daily_task_track_tour_seen");
    if (!hasSeenTour) {
      setIsOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsOpen(false);
    localStorage.setItem("daily_task_track_tour_seen", "true");
  };

  const restartTour = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  // Expose restart function to window for the "Help" button
  useEffect(() => {
    (window as any).restartAppTour = restartTour;
  }, []);

  const step = TOUR_STEPS[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                Finish
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
