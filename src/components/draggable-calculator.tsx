
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, X, Delete } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraggableCalculatorProps {
  onClose: () => void;
}

export function DraggableCalculator({ onClose }: DraggableCalculatorProps) {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");

  const handleNumber = (num: string) => {
    setDisplay((prev) => (prev === "0" ? num : prev + num));
    setExpression((prev) => prev + num);
  };

  const handleOperator = (op: string) => {
    setExpression((prev) => prev + " " + op + " ");
    setDisplay("0");
  };

  const calculate = () => {
    try {
      // Basic math calculation using Function for safety over eval
      const result = new Function(`return ${expression}`)();
      const formatted = Number.isInteger(result) ? result.toString() : result.toFixed(2);
      setDisplay(formatted);
      setExpression(formatted);
    } catch (error) {
      setDisplay("Error");
      setExpression("");
    }
  };

  const clear = () => {
    setDisplay("0");
    setExpression("");
  };

  const buttons = [
    { label: "7", onClick: () => handleNumber("7") },
    { label: "8", onClick: () => handleNumber("8") },
    { label: "9", onClick: () => handleNumber("9") },
    { label: "/", onClick: () => handleOperator("/"), color: "text-primary" },
    { label: "4", onClick: () => handleNumber("4") },
    { label: "5", onClick: () => handleNumber("5") },
    { label: "6", onClick: () => handleNumber("6") },
    { label: "*", onClick: () => handleOperator("*"), color: "text-primary" },
    { label: "1", onClick: () => handleNumber("1") },
    { label: "2", onClick: () => handleNumber("2") },
    { label: "3", onClick: () => handleNumber("3") },
    { label: "-", onClick: () => handleOperator("-"), color: "text-primary" },
    { label: "0", onClick: () => handleNumber("0") },
    { label: ".", onClick: () => handleNumber(".") },
    { label: "=", onClick: calculate, color: "bg-primary text-white hover:bg-primary/90" },
    { label: "+", onClick: () => handleOperator("+"), color: "text-primary" },
  ];

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="fixed z-[100] top-24 right-8 w-64 shadow-2xl pointer-events-auto"
    >
      <Card className="overflow-hidden border-border bg-card/90 backdrop-blur-xl rounded-[1.5rem] shadow-2xl">
        <div className="bg-primary/5 p-3 flex items-center justify-between cursor-move drag-handle">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Calculator</span>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={onClose}>
            <X className="w-3 h-3" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-muted/30 p-3 rounded-xl text-right overflow-hidden border border-border">
            <div className="text-[10px] font-bold text-muted-foreground/60 h-4 truncate">
              {expression || "0"}
            </div>
            <div className="text-2xl font-black text-primary truncate">
              {display}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              onClick={clear}
              className="col-span-3 text-[10px] font-black uppercase tracking-widest h-10 rounded-lg hover:bg-destructive/10 hover:text-destructive"
            >
              Clear
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
                setExpression((prev) => prev.slice(0, -1));
              }}
              className="h-10 rounded-lg"
            >
              <Delete className="w-4 h-4" />
            </Button>

            {buttons.map((btn, i) => (
              <Button
                key={i}
                variant="ghost"
                onClick={btn.onClick}
                className={cn(
                  "h-12 font-bold text-lg rounded-lg transition-all active:scale-95",
                  btn.color || "hover:bg-primary/5"
                )}
              >
                {btn.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
