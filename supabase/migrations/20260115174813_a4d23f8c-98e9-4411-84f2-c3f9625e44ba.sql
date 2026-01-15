-- Fase 1 & 2: Aggiungere reservation_settings e popolare menu

-- Aggiungere colonna reservation_settings a pizzeria_settings
ALTER TABLE public.pizzeria_settings 
ADD COLUMN IF NOT EXISTS reservation_settings JSONB DEFAULT '{
  "time_slots": ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"],
  "days_available": {
    "monday": true,
    "tuesday": true,
    "wednesday": true,
    "thursday": true,
    "friday": true,
    "saturday": true,
    "sunday": false
  },
  "max_reservations_per_slot": 5,
  "advance_booking_days": 14
}'::jsonb;

-- Inserire categorie menu
INSERT INTO public.menu_categories (name, description, icon, sort_order, is_active) VALUES
  ('Pizze', 'Le nostre pizze artigianali con impasto lievitato 48 ore', '🍕', 1, true),
  ('Antipasti', 'Stuzzichini e antipasti della tradizione', '🥗', 2, true),
  ('Bevande', 'Bibite, vini e birre artigianali', '🍷', 3, true),
  ('Dolci', 'Dessert fatti in casa', '🍰', 4, true)
ON CONFLICT DO NOTHING;

-- Inserire prodotti menu usando subquery per ottenere category_id
INSERT INTO public.menu_items (name, description, price, category_id, image_url, tags, is_available, is_popular, sort_order)
SELECT * FROM (VALUES
  ('Margherita', 'Pomodoro San Marzano, mozzarella di bufala, basilico fresco', 8.50::numeric, (SELECT id FROM public.menu_categories WHERE name = 'Pizze'), '/placeholder.svg', ARRAY['vegetariano'], true, true, 1),
  ('Diavola', 'Pomodoro, mozzarella, salame piccante, peperoncino', 10.50::numeric, (SELECT id FROM public.menu_categories WHERE name = 'Pizze'), '/placeholder.svg', ARRAY['piccante'], true, true, 2),
  ('Quattro Formaggi', 'Mozzarella, gorgonzola, parmigiano, fontina', 11.00::numeric, (SELECT id FROM public.menu_categories WHERE name = 'Pizze'), '/placeholder.svg', ARRAY['vegetariano'], true, false, 3),
  ('Prosciutto e Funghi', 'Pomodoro, mozzarella, prosciutto cotto, funghi champignon', 11.00::numeric, (SELECT id FROM public.menu_categories WHERE name = 'Pizze'), '/placeholder.svg', ARRAY[]::text[], true, false, 4),
  ('Capricciosa', 'Pomodoro, mozzarella, prosciutto, funghi, carciofi, olive', 12.00::numeric, (SELECT id FROM public.menu_categories WHERE name = 'Pizze'), '/placeholder.svg', ARRAY[]::text[], true, true, 5),
  ('Marinara', 'Pomodoro, aglio, origano, olio extra vergine', 7.00::numeric, (SELECT id FROM public.menu_categories WHERE name = 'Pizze'), '/placeholder.svg', ARRAY['vegano'], true, false, 6),
  ('Bruschetta Classica', 'Pane tostato con pomodorini freschi, basilico e olio EVO', 5.50::numeric, (SELECT id FROM public.menu_categories WHERE name = 'Antipasti'), '/placeholder.svg', ARRAY['vegano'], true, true, 1),
  ('Mozzarella in Carrozza', 'Mozzarella fritta in panatura dorata', 7.00::numeric, (SELECT id FROM public.menu_categories WHERE name = 'Antipasti'), '/placeholder.svg', ARRAY['vegetariano'], true, false, 2),
  ('Tagliere Misto', 'Selezione di salumi e formaggi locali con miele', 14.00::numeric, (SELECT id FROM public.menu_categories WHERE name = 'Antipasti'), '/placeholder.svg', ARRAY[]::text[], true, true, 3),
  ('Coca-Cola', 'Coca-Cola classica 33cl', 3.00::numeric, (SELECT id FROM public.menu_categories WHERE name = 'Bevande'), '/placeholder.svg', ARRAY[]::text[], true, false, 1),
  ('Acqua Naturale', 'Acqua minerale naturale 50cl', 2.00::numeric, (SELECT id FROM public.menu_categories WHERE name = 'Bevande'), '/placeholder.svg', ARRAY[]::text[], true, false, 2),
  ('Birra Artigianale', 'Birra artigianale locale 33cl', 5.00::numeric, (SELECT id FROM public.menu_categories WHERE name = 'Bevande'), '/placeholder.svg', ARRAY[]::text[], true, true, 3),
  ('Vino Rosso della Casa', 'Vino rosso locale al calice', 4.50::numeric, (SELECT id FROM public.menu_categories WHERE name = 'Bevande'), '/placeholder.svg', ARRAY[]::text[], true, false, 4),
  ('Tiramisù', 'Tiramisù classico fatto in casa', 6.00::numeric, (SELECT id FROM public.menu_categories WHERE name = 'Dolci'), '/placeholder.svg', ARRAY['vegetariano'], true, true, 1),
  ('Panna Cotta', 'Panna cotta con frutti di bosco', 5.50::numeric, (SELECT id FROM public.menu_categories WHERE name = 'Dolci'), '/placeholder.svg', ARRAY['vegetariano', 'senza-glutine'], true, false, 2),
  ('Cannolo Siciliano', 'Cannolo con ricotta fresca e gocce di cioccolato', 5.00::numeric, (SELECT id FROM public.menu_categories WHERE name = 'Dolci'), '/placeholder.svg', ARRAY['vegetariano'], true, true, 3)
) AS t(name, description, price, category_id, image_url, tags, is_available, is_popular, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.menu_items WHERE menu_items.name = t.name);