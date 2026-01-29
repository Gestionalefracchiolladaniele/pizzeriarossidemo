-- Add delivery coordinates to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_lat DECIMAL(10, 8);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_lng DECIMAL(11, 8);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_distance_km DECIMAL(5, 2);

-- Add pizzeria coordinates to settings
ALTER TABLE pizzeria_settings ADD COLUMN IF NOT EXISTS pizzeria_lat DECIMAL(10, 8);
ALTER TABLE pizzeria_settings ADD COLUMN IF NOT EXISTS pizzeria_lng DECIMAL(11, 8);

-- Add new order status for delivery tracking
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending', 'received', 'read', 'preparing', 'done', 'out_for_delivery', 'delivered', 'cancelled'));