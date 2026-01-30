-- Add prep_time_minutes column to menu_items table
ALTER TABLE public.menu_items 
ADD COLUMN prep_time_minutes INTEGER DEFAULT 10;

-- Add a comment to explain the column
COMMENT ON COLUMN public.menu_items.prep_time_minutes IS 'Time in minutes required to prepare this menu item';