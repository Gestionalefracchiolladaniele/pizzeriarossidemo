-- Create delivery_tracking table for live GPS tracking
CREATE TABLE public.delivery_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  driver_lat NUMERIC,
  driver_lng NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT true,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.delivery_tracking ENABLE ROW LEVEL SECURITY;

-- Admins can manage all tracking records
CREATE POLICY "Admins can manage all delivery tracking"
ON public.delivery_tracking
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view tracking for their own orders
CREATE POLICY "Users can view tracking for their orders"
ON public.delivery_tracking
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = delivery_tracking.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Anonymous users can view tracking by order_id (for guest orders)
CREATE POLICY "Anyone can view active tracking"
ON public.delivery_tracking
FOR SELECT
USING (is_active = true);

-- Create trigger to update last_updated_at
CREATE TRIGGER update_delivery_tracking_updated_at
BEFORE UPDATE ON public.delivery_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_delivery_tracking_order_id ON public.delivery_tracking(order_id);
CREATE INDEX idx_delivery_tracking_active ON public.delivery_tracking(is_active) WHERE is_active = true;