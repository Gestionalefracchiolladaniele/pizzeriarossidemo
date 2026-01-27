import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, DayPickerSingleProps } from "react-day-picker";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type StyledCalendarProps = Omit<DayPickerSingleProps, "mode"> & {
  highlightedDates?: Date[];
  onDateClick?: (date: Date) => void;
};

function StyledCalendar({
  className,
  classNames,
  showOutsideDays = true,
  highlightedDates = [],
  onDateClick,
  ...props
}: StyledCalendarProps) {
  // Create a set of highlighted date strings for quick lookup
  const highlightedSet = new Set(
    highlightedDates.map(d => d.toISOString().split('T')[0])
  );

  const modifiers = {
    highlighted: (date: Date) => highlightedSet.has(date.toISOString().split('T')[0]),
  };

  const modifiersStyles = {
    highlighted: {
      position: 'relative' as const,
    },
  };

  return (
    <DayPicker
      mode="single"
      locale={it}
      showOutsideDays={showOutsideDays}
      className={cn("p-4 pointer-events-auto", className)}
      modifiers={modifiers}
      modifiersStyles={modifiersStyles}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-base font-bold text-foreground",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-background p-0 opacity-70 hover:opacity-100 hover:bg-primary/10 border-primary/30"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-primary/80 rounded-md w-10 font-semibold text-[0.85rem] uppercase",
        row: "flex w-full mt-2",
        cell: cn(
          "relative h-10 w-10 text-center text-sm p-0",
          "focus-within:relative focus-within:z-20",
          "[&:has([aria-selected])]:bg-primary/10 [&:has([aria-selected])]:rounded-lg"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-medium aria-selected:opacity-100 hover:bg-primary/10 hover:text-primary transition-colors rounded-lg"
        ),
        day_range_end: "day-range-end",
        day_selected: cn(
          "bg-primary text-primary-foreground",
          "hover:bg-primary hover:text-primary-foreground",
          "focus:bg-primary focus:text-primary-foreground",
          "rounded-lg shadow-md"
        ),
        day_today: "bg-accent text-accent-foreground font-bold ring-2 ring-primary/30",
        day_outside: "day-outside text-muted-foreground/40 opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground/30 opacity-30 cursor-not-allowed",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-5 w-5 text-primary" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-5 w-5 text-primary" />,
        DayContent: ({ date, ...dayContentProps }) => {
          const dateStr = date.toISOString().split('T')[0];
          const isHighlighted = highlightedSet.has(dateStr);
          
          return (
            <div className="relative w-full h-full flex items-center justify-center">
              <span>{date.getDate()}</span>
              {isHighlighted && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </div>
          );
        },
      }}
      {...props}
    />
  );
}

StyledCalendar.displayName = "StyledCalendar";

export { StyledCalendar };
