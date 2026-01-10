import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface DaySchedule {
  open: string;
  close: string;
  is_closed?: boolean;
}

interface OpeningHours {
  [key: string]: DaySchedule;
}

const DAYS = [
  { key: "monday", label: "Lunedì" },
  { key: "tuesday", label: "Martedì" },
  { key: "wednesday", label: "Mercoledì" },
  { key: "thursday", label: "Giovedì" },
  { key: "friday", label: "Venerdì" },
  { key: "saturday", label: "Sabato" },
  { key: "sunday", label: "Domenica" },
];

const DAY_MAP: { [key: number]: string } = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

interface OpeningHoursDisplayProps {
  compact?: boolean;
  showCurrentStatus?: boolean;
}

export const OpeningHoursDisplay = ({ compact = false, showCurrentStatus = true }: OpeningHoursDisplayProps) => {
  const [hours, setHours] = useState<OpeningHours | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHours();
  }, []);

  const fetchHours = async () => {
    const { data, error } = await supabase
      .from("pizzeria_settings")
      .select("opening_hours")
      .limit(1)
      .single();

    if (!error && data?.opening_hours) {
      setHours(data.opening_hours as unknown as OpeningHours);
    }
    setIsLoading(false);
  };

  const getCurrentStatus = () => {
    if (!hours) return { isOpen: false, message: "Orari non disponibili" };
    
    const now = new Date();
    const currentDay = DAY_MAP[now.getDay()];
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const todaySchedule = hours[currentDay];
    if (!todaySchedule || todaySchedule.is_closed) {
      return { isOpen: false, message: "Chiuso oggi" };
    }
    
    if (currentTime >= todaySchedule.open && currentTime <= todaySchedule.close) {
      return { isOpen: true, message: `Aperto fino alle ${todaySchedule.close}` };
    } else if (currentTime < todaySchedule.open) {
      return { isOpen: false, message: `Apre alle ${todaySchedule.open}` };
    } else {
      return { isOpen: false, message: "Chiuso ora" };
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse h-20 bg-muted rounded-lg"></div>
    );
  }

  if (!hours) {
    return null;
  }

  const status = getCurrentStatus();

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${status.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm">{status.message}</span>
      </div>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Orari di Apertura</h3>
        {showCurrentStatus && (
          <div className={`ml-auto px-2 py-1 rounded-full text-xs font-medium
            ${status.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {status.isOpen ? 'Aperto' : 'Chiuso'}
          </div>
        )}
      </div>
      
      <div className="space-y-1 text-sm">
        {DAYS.map(day => {
          const schedule = hours[day.key];
          const today = DAY_MAP[new Date().getDay()];
          const isToday = day.key === today;
          
          return (
            <div 
              key={day.key} 
              className={`flex justify-between py-1 ${isToday ? 'font-semibold text-primary' : ''}`}
            >
              <span>{day.label} {isToday && '(oggi)'}</span>
              <span className={schedule?.is_closed ? "text-red-600" : "text-muted-foreground"}>
                {schedule?.is_closed 
                  ? "Chiuso" 
                  : `${schedule?.open || "11:00"} - ${schedule?.close || "23:00"}`}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
