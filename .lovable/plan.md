

# Piano di Correzione e Completamento

## Problemi Identificati

### 1. **Problema Critico: Pagina Profilo Bloccata su Loading**
Lo screenshot mostra la pagina `/profilo` bloccata sullo spinner. Il problema e alla riga 204 di `Profilo.tsx`:

```typescript
if (isLoading || !user) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
```

La condizione `!user` blocca la pagina quando non c'e autenticazione. Devo rimuoverla e permettere l'accesso diretto.

### 2. **Problema: Pagina Admin - Stesso Problema**
Anche `Admin.tsx` ha una condizione simile a riga 39:
```typescript
if (isLoading) { ... }
```
Questo funziona meglio ma il `useAuth()` potrebbe ancora causare problemi.

---

## Cose da Correggere/Implementare

### Fase 1: Fix Accesso Diretto Profilo Utente
- Rimuovere la condizione `!user` dal loading check
- Gestire il caso in cui `user` e null mostrando comunque la pagina
- Creare un "utente demo" fittizio per mostrare i dati quando non autenticato
- Permettere di visualizzare tutti gli ordini/prenotazioni del database (per demo)

### Fase 2: Fix Accesso Diretto Admin
- Verificare che Admin funzioni correttamente senza autenticazione
- Rimuovere dipendenze da `user` e `isAdmin`

### Fase 3: Funzionalita Mancanti dal Messaggio Originale

**Non implementato:**
1. **Stima tempo totale consegna** - Quando l'utente ordina con consegna e inserisce posizione GPS, deve vedere:
   - Tempo preparazione (max dei piatti ordinati)
   - Tempo consegna (basato su distanza)
   - Ordini in coda prima del suo
   - Totale stimato

2. **Percorso stradale sulla mappa** - La `LiveDeliveryMap` mostra solo i marker ma non il percorso effettivo usando Google Maps Directions API

---

## Piano di Implementazione

### Correzione 1: Profilo.tsx - Accesso Senza Auth
Modificare la condizione di loading per permettere accesso anche senza utente autenticato.
Quando `user` e null, mostrare una versione "demo" della pagina che:
- Mostra un utente generico "Ospite"
- Recupera TUTTI gli ordini e prenotazioni dal database (per demo)
- Permette comunque di navigare e vedere lo storico

**Codice da modificare (riga 204):**
```typescript
// PRIMA (blocca se no user):
if (isLoading || !user) { ... }

// DOPO (permette accesso demo):
if (isLoading) { ... }
// Poi gestire user === null nel render
```

### Correzione 2: Gestione User Null in Profilo
Aggiungere logica per creare dati "demo" quando user e null:
- Nome: "Ospite"
- Email: "ospite@demo.it"
- Recuperare ordini/prenotazioni senza filtro user_id

### Correzione 3: Admin.tsx - Verifica Funzionamento
Il file sembra gia OK ma devo verificare che non ci siano dipendenze nascoste da `user`.

### Implementazione 4: Stima Tempo Totale in Ordina.tsx
Aggiungere nel checkout (dopo selezione GPS):
1. Query per contare ordini attivi (`pending`, `received`, `preparing`)
2. Calcolo tempo max preparazione dai `prep_time_minutes` dei prodotti nel carrello
3. Calcolo tempo consegna: `distanza_km * 2.5 minuti`
4. Calcolo tempo coda: `ordini_attivi * 5 minuti`
5. Mostrare box con breakdown:
   - "Preparazione: ~15 min"
   - "Consegna: ~10 min"  
   - "Ordini in coda: 2 (~10 min)"
   - "**Totale stimato: ~35 min**"

### Implementazione 5: Percorso Stradale su LiveDeliveryMap
Aggiungere Google Maps Directions API per visualizzare:
1. Polyline colorata dal pizzeria al fattorino
2. Polyline colorata dal fattorino alla destinazione
3. Distanza e tempo reali basati sul percorso stradale (non in linea d'aria)

---

## Riepilogo File da Modificare

| File | Modifica |
|------|----------|
| `src/pages/Profilo.tsx` | Rimuovere blocco `!user`, gestire modalita demo |
| `src/pages/Admin.tsx` | Verificare funzionamento senza auth |
| `src/pages/Ordina.tsx` | Aggiungere stima tempo totale consegna |
| `src/components/ordina/LiveDeliveryMap.tsx` | Aggiungere Directions API per percorso |
| `src/components/ordina/DeliveryAddressMap.tsx` | Mostrare stima dopo selezione GPS |

---

## Ordine di Esecuzione

1. **Fix Profilo.tsx** - Critico, pagina bloccata
2. **Verifica Admin.tsx** - Assicurarsi funzioni
3. **Aggiungi stima tempo in Ordina.tsx** - Funzionalita richiesta
4. **Aggiungi percorso in LiveDeliveryMap** - Funzionalita richiesta

---

## Note Tecniche

### Modalita Demo per Profilo
Quando `user === null`:
- Mostrare "Utente Ospite" come nome
- Recuperare tutti gli ordini dal DB (senza filtro `user_id`)
- Nascondere bottone "Esci" (non ha senso senza login)
- Mostrare messaggio "Stai visualizzando in modalita demo"

### Calcolo Tempo Stimato
```typescript
const maxPrepTime = Math.max(...cartItems.map(i => i.prep_time_minutes || 10));
const deliveryTime = Math.round(distanceKm * 2.5);
const queueTime = activeOrdersCount * 5;
const totalEstimate = maxPrepTime + deliveryTime + queueTime;
```

### Directions API
```typescript
const directionsService = new google.maps.DirectionsService();
const result = await directionsService.route({
  origin: pizzeriaLocation,
  destination: deliveryLocation,
  travelMode: google.maps.TravelMode.DRIVING,
});
// Render polyline from result
```

