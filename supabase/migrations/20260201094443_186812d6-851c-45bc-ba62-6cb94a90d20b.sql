-- Add UPDATE policy for reservations so users can cancel their own reservations
CREATE POLICY "Users can update their own reservations"
  ON public.reservations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);