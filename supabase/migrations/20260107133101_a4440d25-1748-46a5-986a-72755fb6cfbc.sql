-- Fix security warnings: Remove overly permissive policies and make them more specific

-- Drop the permissive "Anyone can create" policies
DROP POLICY IF EXISTS "Anyone can create reservations" ON public.reservations;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create better policies for anonymous users
-- Reservations: allow anonymous users to create only with required fields
CREATE POLICY "Anonymous can create reservations with guest info" ON public.reservations
    FOR INSERT
    WITH CHECK (
        user_id IS NULL 
        AND guest_name IS NOT NULL 
        AND guest_email IS NOT NULL 
        AND guest_phone IS NOT NULL
    );

-- Orders: allow anonymous users to create only with required fields  
CREATE POLICY "Anonymous can create orders with customer info" ON public.orders
    FOR INSERT
    WITH CHECK (
        user_id IS NULL 
        AND customer_name IS NOT NULL 
        AND customer_email IS NOT NULL 
        AND customer_phone IS NOT NULL
    );