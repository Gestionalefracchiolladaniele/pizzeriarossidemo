

# Piano di Correzione Completo

## Panoramica dei Problemi Identificati

### 1. Dialog Admin Menu - Mancanza Pulsante Chiusura (IMG_1660)
**Problema**: Il dialog per aggiungere/modificare prodotti nel menu admin non ha un pulsante di chiusura visibile quando si scrolla.

**Causa**: Il form e troppo lungo e non scrollabile. Su mobile, gli elementi in fondo (bottoni Annulla/Salva) non sono visibili.

**Soluzione**:
- Aggiungere `max-h-[80vh] overflow-y-auto` al DialogContent
- Rendere visibile il pulsante X di chiusura in alto a destra (gia presente nel componente Dialog)
- Ridurre padding e spacing del form per adattarsi meglio a schermi piccoli

---

### 2. Bottone Disdici Non Funziona (IMG_1661)
**Problema**: Quando l'utente clicca su "Disdici" per cancellare una prenotazione, non succede nulla.

**Causa**: Manca una policy RLS UPDATE sulla tabella `reservations`. Le policy attuali sono:
- `Admins can manage all reservations` (ALL)
- `Anonymous can create reservations with guest info` (INSERT)
- `Users can create reservations` (INSERT)
- `Users can view their own reservations` (SELECT)

**Manca**: Policy per permettere agli utenti di aggiornare (UPDATE) le proprie prenotazioni.

**Soluzione**: Aggiungere una nuova RLS policy:
```sql
CREATE POLICY "Users can update their own reservations"
  ON public.reservations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

### 3. Dimensioni Troppo Grandi - Ordina e Prenota (IMG_1662, 1663, 1664, 1665, 1666)
**Problema**: Le pagine Ordina e Prenota hanno elementi UI troppo grandi:
- Titolo "Ordina Online" / "Prenota il Tuo Tavolo" troppo grande
- Card selezione tipo consegna (Ritiro, Consegna, Al Tavolo) troppo grandi
- Card menu items troppo grandi
- Date calendar cards troppo grandi
- Table visual e time slots troppo grandi

**Soluzione**: Applicare riduzione 25% a tutti gli elementi:

| Componente | Modifica |
|------------|----------|
| Hero title | `text-4xl md:text-5xl` -> `text-3xl md:text-4xl` |
| Hero subtitle | `text-lg` -> `text-base` |
| DeliveryTypeSelector | padding `p-6` -> `p-4`, icon `w-14 h-14` -> `w-12 h-12` |
| Menu item cards | image `w-24 h-24` -> `w-20 h-20`, padding `p-4` -> `p-3` |
| Date cards | padding `p-2` -> `p-1.5`, font sizes ridotti |
| Table visuals | dimensioni ridotte del 20% |
| Time slot buttons | `size="lg"` -> `size="default"` |
| Step indicators | `w-12 h-12` -> `w-10 h-10` |

---

### 4. Scroll to Top al Cambio Step
**Problema**: Quando l'utente passa da uno step al successivo (es. step 1 -> step 2), lo scroll rimane nella posizione precedente invece di tornare in alto.

**Soluzione**: Aggiungere `window.scrollTo(0, 0)` quando cambia lo step:

```typescript
// In Ordina.tsx
const handleStepChange = (newStep: "menu" | "checkout" | "confirmed") => {
  setStep(newStep);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// In Prenota.tsx  
const handleStepChange = (newStep: number) => {
  setStep(newStep);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
```

---

## File da Modificare

| File | Tipo Modifica |
|------|---------------|
| `src/components/admin/AdminMenu.tsx` | Aggiungere scroll e dimensioni compatte al dialog |
| `src/pages/Ordina.tsx` | Ridimensionamento UI + scroll-to-top |
| `src/pages/Prenota.tsx` | Ridimensionamento UI + scroll-to-top |
| `src/components/ordina/DeliveryTypeSelector.tsx` | Ridurre dimensioni card |
| Migrazione SQL | Aggiungere policy RLS UPDATE per reservations |

---

## Dettagli Tecnici Riduzione 25%

### Ordina.tsx
- Hero `text-4xl md:text-5xl` -> `text-3xl md:text-4xl`
- Hero paragraph `text-lg` -> `text-base`
- Section titles `text-lg` -> `text-base`
- Menu item image `w-24 h-24` -> `w-20 h-20`
- Card padding `p-4` -> `p-3`

### Prenota.tsx
- Hero `text-4xl md:text-5xl` -> `text-3xl md:text-4xl`
- Hero paragraph `text-lg` -> `text-base`
- Step indicators `w-12 h-12` -> `w-10 h-10`, `w-5 h-5` icons -> `w-4 h-4`
- Section titles `text-2xl` -> `text-xl`
- People buttons `w-14 h-14` -> `w-12 h-12`
- Date cards padding `p-2` -> `p-1.5`
- Table visual container `w-24 h-24` -> `w-20 h-20`
- Time buttons `size="lg"` -> `size="default"`

### DeliveryTypeSelector.tsx
- Card padding `p-6` -> `p-4`
- Icon container `w-14 h-14` -> `w-12 h-12`
- Icon `w-7 h-7` -> `w-6 h-6`
- Title `text-lg` -> `text-base`
- Selected indicator `w-6 h-6` -> `w-5 h-5`

### AdminMenu.tsx (Dialog)
- DialogContent max-height `max-h-[85vh]` con `overflow-y-auto`
- Form spacing ridotto `space-y-4` -> `space-y-3`
- Input padding ridotto
- Image preview `w-16 h-16` -> `w-14 h-14`

---

## Migrazione SQL

```sql
-- Add UPDATE policy for reservations
CREATE POLICY "Users can update their own reservations"
  ON public.reservations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## Ordine di Implementazione

1. **Migrazione SQL** - Aggiungere RLS policy UPDATE per reservations
2. **AdminMenu.tsx** - Fix dialog scrollabile con dimensioni compatte
3. **DeliveryTypeSelector.tsx** - Ridurre dimensioni card
4. **Ordina.tsx** - Ridimensionamento + scroll-to-top
5. **Prenota.tsx** - Ridimensionamento + scroll-to-top

