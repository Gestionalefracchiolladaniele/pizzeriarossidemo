import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, AlertCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.string().email("Email non valida");
const passwordSchema = z.string().min(6, "La password deve avere almeno 6 caratteri");

const AdminAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const { signIn, user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate("/admin");
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
    }

    setIsLoading(true);
    const { error: signInError } = await signIn(email, password);
    
    if (signInError) {
      setIsLoading(false);
      if (signInError.message.includes("Invalid login credentials")) {
        setError("Credenziali non valide. Controlla email e password.");
      } else if (signInError.message.includes("Email not confirmed")) {
        setError("Email non confermata. Controlla la tua casella di posta.");
      } else {
        setError(signInError.message);
      }
      return;
    }

    // Wait a moment for isAdmin to be checked
    setTimeout(async () => {
      const { data } = await (await import("@/integrations/supabase/client")).supabase.auth.getUser();
      if (data?.user) {
        const { data: roleData } = await (await import("@/integrations/supabase/client")).supabase.rpc('has_role', {
          _user_id: data.user.id,
          _role: 'admin'
        });
        if (roleData) {
          toast.success("Accesso effettuato!");
          navigate("/admin");
        } else {
          setError("Accesso non autorizzato. Solo gli amministratori possono accedere.");
          await (await import("@/integrations/supabase/client")).supabase.auth.signOut();
        }
      }
      setIsLoading(false);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <Link to="/" className="font-display text-3xl font-bold">
            Pizzeria <span className="text-primary">Rossi</span>
          </Link>
          <p className="text-muted-foreground mt-2">Area Riservata - Accesso Amministratori</p>
        </div>

        <Card className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Email amministratore" 
                type="email" 
                className="pl-10" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Password" 
                type="password" 
                className="pl-10" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            <Button className="w-full" disabled={isLoading}>
              {isLoading ? "Caricamento..." : "Accedi"}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/" className="text-primary hover:underline">← Torna alla Home</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default AdminAuth;
