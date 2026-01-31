import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Quali sono i vostri orari di apertura?",
    answer: "Siamo aperti dal martedì alla domenica, dalle 18:00 alle 23:00. Il lunedì siamo chiusi per riposo settimanale. Durante le festività gli orari potrebbero variare, ti consigliamo di chiamarci per conferma.",
  },
  {
    question: "Devo prenotare un tavolo in anticipo?",
    answer: "Per il weekend (venerdì, sabato e domenica) consigliamo vivamente la prenotazione, soprattutto per gruppi superiori a 4 persone. Durante la settimana generalmente è possibile trovare posto senza prenotazione, ma per sicurezza ti consigliamo di contattarci.",
  },
  {
    question: "Offrite opzioni per intolleranze alimentari?",
    answer: "Sì! Abbiamo pizze senza glutine preparate in un'area dedicata per evitare contaminazioni. Offriamo anche opzioni vegetariane e vegane (con mozzarella vegetale). Comunica le tue esigenze al momento dell'ordine.",
  },
  {
    question: "Quanto tempo ci vuole per la consegna a domicilio?",
    answer: "Il tempo medio di consegna è di 30-40 minuti, a seconda della zona e del traffico. Consegniamo in un raggio di 5 km dalla pizzeria. Durante i picchi (venerdì e sabato sera) i tempi potrebbero allungarsi leggermente.",
  },
  {
    question: "Come funziona l'ordine per asporto?",
    answer: "Puoi ordinare online sul nostro sito o chiamando direttamente. Scegli l'orario di ritiro preferito e la tua pizza sarà pronta e calda al tuo arrivo. Il tempo minimo di preparazione è di 20 minuti.",
  },
  {
    question: "Accettate pagamenti con carta?",
    answer: "Sì, accettiamo tutte le principali carte di credito e debito, oltre a Satispay e contanti. Per le consegne a domicilio, il pagamento avviene alla consegna.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-16 lg:py-20 bg-[hsl(var(--section-gold))] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_hsl(var(--section-gold-light)/0.5)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,_hsl(var(--gold-dark)/0.3)_0%,_transparent_50%)]" />
      
      {/* Decorative dots pattern */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--gold-dark)) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Floating decorative elements */}
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-16 right-16 w-32 h-32 rounded-full bg-white/20 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 12, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-16 left-16 w-40 h-40 rounded-full bg-[hsl(var(--gold-dark))]/20 blur-3xl"
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="lg:sticky lg:top-20">
              <div className="inline-block px-3 py-1.5 bg-white/20 backdrop-blur-sm text-[hsl(var(--charcoal))] text-xs font-semibold rounded-full mb-3 border border-white/30">
                FAQ
              </div>
              <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--charcoal))] mb-3">
                Domande <span className="text-[hsl(var(--pizzeria-red-dark))]">Frequenti</span>
              </h2>
              <p className="text-[hsl(var(--charcoal)/0.8)] text-base mb-6">
                Trova le risposte alle domande più comuni. Non trovi quello che cerchi? 
                Contattaci direttamente!
              </p>
              
              {/* Contact Card - Premium Style */}
              <motion.div 
                whileHover={{ y: -3 }}
                className="bg-white/40 backdrop-blur-sm rounded-xl p-4 lg:p-6 border-2 border-white/50 shadow-[0_6px_24px_-6px_rgba(0,0,0,0.12)]"
              >
                <h3 className="font-bold text-[hsl(var(--charcoal))] text-base mb-1.5">
                  Hai altre domande?
                </h3>
                <p className="text-[hsl(var(--charcoal)/0.7)] text-sm mb-4">
                  Il nostro team è sempre pronto ad aiutarti
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2.5 bg-white/60 rounded-lg border border-white/80">
                    <div className="w-8 h-8 rounded-full bg-[hsl(var(--pizzeria-red))]/10 flex items-center justify-center">
                      <span className="text-sm">📞</span>
                    </div>
                    <div>
                      <div className="text-xs text-[hsl(var(--charcoal)/0.6)]">Telefono</div>
                      <div className="font-semibold text-sm text-[hsl(var(--charcoal))]">02 1234567</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 bg-white/60 rounded-lg border border-white/80">
                    <div className="w-8 h-8 rounded-full bg-[hsl(var(--pizzeria-red))]/10 flex items-center justify-center">
                      <span className="text-sm">✉️</span>
                    </div>
                    <div>
                      <div className="text-xs text-[hsl(var(--charcoal)/0.6)]">Email</div>
                      <div className="font-semibold text-sm text-[hsl(var(--charcoal))]">info@pizzeriarossi.it</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Column - Accordion */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <AccordionItem
                    value={`item-${index}`}
                    className="bg-white/50 backdrop-blur-sm border-2 border-white/60 rounded-xl px-4 data-[state=open]:border-[hsl(var(--pizzeria-red))]/40 data-[state=open]:shadow-[0_6px_24px_-6px_rgba(0,0,0,0.12)] data-[state=open]:bg-white/70 transition-all duration-300"
                  >
                    <AccordionTrigger className="text-left text-[hsl(var(--charcoal))] hover:text-[hsl(var(--pizzeria-red))] hover:no-underline py-4 font-semibold text-sm">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-[hsl(var(--charcoal)/0.75)] pb-4 leading-relaxed text-sm">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
