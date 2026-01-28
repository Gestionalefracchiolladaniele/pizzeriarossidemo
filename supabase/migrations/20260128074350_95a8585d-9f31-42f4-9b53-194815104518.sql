-- 1. Update orders_status_check constraint to include all states
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending', 'received', 'read', 'preparing', 'done', 'delivered', 'cancelled'));

-- 2. Add confirmation_code column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmation_code TEXT UNIQUE;

-- 3. Add confirmation_code column to reservations table
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS confirmation_code TEXT UNIQUE;

-- 4. Add exception_dates column to pizzeria_settings for managing closures and special hours
ALTER TABLE pizzeria_settings ADD COLUMN IF NOT EXISTS exception_dates JSONB DEFAULT '[]'::jsonb;

-- 5. Add scheduled_date and scheduled_time columns to orders for scheduled orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS scheduled_date DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS scheduled_time TIME;

-- 6. Create index for faster queries on confirmation codes
CREATE INDEX IF NOT EXISTS idx_orders_confirmation_code ON orders(confirmation_code);
CREATE INDEX IF NOT EXISTS idx_reservations_confirmation_code ON reservations(confirmation_code);