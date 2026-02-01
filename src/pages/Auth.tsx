import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Phone, AlertCircle, Info, Eye, EyeOff, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.string().email("Email non valida");
const passwordSchema = z.string().min(6, "La password deve avere almeno 6 caratteri");

// Demo credentials
const DEMO_CREDENTIALS = {
  user: {
    email: "demo@pizzeriarossi.it",
    password: "demo123456",
    role: "Utente"
  },
  admin: {
    email: "admin@pizzeriarossi.it",
    password: "admin123456",
    role: "Amministratore"
  }
};

const Auth = () => {
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get("role") as "user" | "admin" | null;
  const currentRole = requestedRole === "admin" ? "admin" : "user";
  
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const { signIn, signUp, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Get credentials for current role
  const demoCredentials = DEMO_CREDENTIALS[currentRole];

  useEffect(() => {
    if (user) {
      // Redirect based on role and requested page
      if (requestedRole === "admin") {
        // Only redirect to admin if user is actually an admin
        if (isAdmin) {
          navigate("/admin");
        }
        // If not admin, stay on auth page to show error or let them log in with different account
      } else {
        // Default user flow
        if (isAdmin) {
          navigate("/admin");
        } else {
          navigate("/profilo");
        }
      }
    }
  }, [user, isAdmin, navigate, requestedRole]);

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
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        setError("Credenziali non valide. Controlla email e password.");
      } else if (error.message.includes("Email not confirmed")) {
        setError("Email non confermata. Controlla la tua casella di posta.");
      } else {
        setError(error.message);
      }
    } else {
      toast.success("Accesso effettuato!");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      if (!fullName.trim()) throw new Error("Il nome è obbligatorio");
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
    }

    setIsLoading(true);
    const { error } = await signUp(email, password, fullName, phone);
    setIsLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        setError("Questa email è già registrata. Prova ad accedere.");
      } else {
        setError(error.message);
      }
    } else {
      toast.success("Registrazione completata! Controlla la tua email per confermare.");
    }
  };

  const handleQuickLogin = async () => {
    setEmail(demoCredentials.email);
    setPassword(demoCredentials.password);
    
    setIsLoading(true);
    const { error } = await signIn(demoCredentials.email, demoCredentials.password);
    setIsLoading(false);

    if (error) {
      setError(`Errore login demo: ${error.message}. Assicurati che l'account demo esista.`);
    } else {
      toast.success(`Accesso come ${demoCredentials.role} effettuato!`);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copiato!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="font-display text-2xl font-bold">
            Pizzeria <span className="text-primary">Rossi</span>
          </Link>
          <p className="text-muted-foreground text-sm mt-2">
            {currentRole === "admin" 
              ? "Accedi come Amministratore" 
              : "Accedi o registrati per gestire le tue prenotazioni"
            }
          </p>
        </div>

        <Card className="p-5">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <Tabs defaultValue="login" onValueChange={() => setError(null)}>
            <TabsList className="w-full mb-5">
              <TabsTrigger value="login" className="flex-1 text-sm">Accedi</TabsTrigger>
              <TabsTrigger value="register" className="flex-1 text-sm">Registrati</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Email" 
                    type="email" 
                    className="pl-9 h-10 text-sm" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Password" 
                    type={showPassword ? "text" : "password"}
                    className="pl-9 pr-9 h-10 text-sm" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button className="w-full h-10 text-sm" disabled={isLoading}>
                  {isLoading ? "Caricamento..." : "Accedi"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Nome e Cognome" 
                    className="pl-9 h-10 text-sm" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required 
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Email" 
                    type="email" 
                    className="pl-9 h-10 text-sm" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Telefono" 
                    type="tel" 
                    className="pl-9 h-10 text-sm" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Password" 
                    type={showPassword ? "text" : "password"}
                    className="pl-9 pr-9 h-10 text-sm" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button className="w-full h-10 text-sm" disabled={isLoading}>
                  {isLoading ? "Caricamento..." : "Registrati"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Demo Credentials Card - Inline, role-specific */}
        <Card className={`mt-4 p-4 ${currentRole === "admin" ? "border-amber-500/30 bg-amber-500/5" : "border-primary/20 bg-primary/5"}`}>
          <div className="flex items-center gap-2 mb-3">
            <Info className={`w-4 h-4 ${currentRole === "admin" ? "text-amber-600" : "text-primary"}`} />
            <h4 className={`font-semibold text-sm ${currentRole === "admin" ? "text-amber-700 dark:text-amber-400" : "text-foreground"}`}>
              Account Demo {demoCredentials.role}
            </h4>
          </div>
          
          <p className="text-xs text-muted-foreground mb-3">
            Usa queste credenziali per testare l'applicazione come {demoCredentials.role.toLowerCase()}
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-background/60 p-2 rounded-lg border">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Email:</span>
                <code className="text-xs font-medium">{demoCredentials.email}</code>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => copyToClipboard(demoCredentials.email, "email")}
              >
                {copiedField === "email" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>
            <div className="flex items-center justify-between bg-background/60 p-2 rounded-lg border">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Password:</span>
                <code className="text-xs font-medium">{demoCredentials.password}</code>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => copyToClipboard(demoCredentials.password, "password")}
              >
                {copiedField === "password" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>
          </div>
          
          <Button 
            className={`w-full mt-3 h-9 text-sm ${currentRole === "admin" ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}`}
            onClick={handleQuickLogin}
            disabled={isLoading}
          >
            {isLoading ? "Caricamento..." : `Accedi come ${demoCredentials.role} Demo`}
          </Button>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-5">
          <Link to="/" className="text-primary hover:underline">← Torna alla Home</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
