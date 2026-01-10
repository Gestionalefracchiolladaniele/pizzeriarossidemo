-- Drop existing restrictive policies on orders table
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anonymous can create orders with customer info" ON public.orders;

-- Create better policy for logged-in users (PERMISSIVE to allow insert)
CREATE POLICY "Authenticated users can create orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy for anonymous users
CREATE POLICY "Anonymous users can create orders"
ON public.orders
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL AND customer_name IS NOT NULL AND customer_email IS NOT NULL AND customer_phone IS NOT NULL);

-- Add policy for menu_items to allow all users to view all items (for admin display)
DROP POLICY IF EXISTS "Anyone can view available items" ON public.menu_items;
CREATE POLICY "Anyone can view menu items"
ON public.menu_items
FOR SELECT
USING (true);

-- Add policy for menu_categories to allow all users to view all categories
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.menu_categories;
CREATE POLICY "Anyone can view menu categories"
ON public.menu_categories
FOR SELECT
USING (true);