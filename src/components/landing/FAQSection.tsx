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
    <section id="faq" className="py-20 lg:py-28 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-pattern-dots opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Column - Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="lg:sticky lg:top-24">
              <div className="inline-block px-4 py-2 bg-[hsl(var(--gold))]/10 text-[hsl(var(--gold-dark))] text-sm font-semibold rounded-full mb-4">
                FAQ
              </div>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Domande <span className="text-gradient-red">Frequenti</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Trova le risposte alle domande più comuni. Non trovi quello che cerchi? 
                Contattaci direttamente!
              </p>
              
              {/* Contact Card - Premium Style */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-primary/5 rounded-2xl p-6 lg:p-8 border-2 border-primary/20 shadow-[0_8px_30px_-8px_hsl(var(--pizzeria-red)/0.15)]"
              >
                <h3 className="font-bold text-foreground text-lg mb-2">
                  Hai altre domande?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Il nostro team è sempre pronto ad aiutarti
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-card rounded-xl border border-border">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg">📞</span>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Telefono</div>
                      <div className="font-semibold text-foreground">02 1234567</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-card rounded-xl border border-border">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg">✉️</span>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Email</div>
                      <div className="font-semibold text-foreground">info@pizzeriarossi.it</div>
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
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AccordionItem
                    value={`item-${index}`}
                    className="bg-card border-2 border-border rounded-2xl px-6 data-[state=open]:border-primary/40 data-[state=open]:shadow-[0_8px_30px_-8px_hsl(var(--pizzeria-red)/0.15)] transition-all duration-300"
                  >
                    <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline py-5 font-semibold">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
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
