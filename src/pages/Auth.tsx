import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Phone, AlertCircle, Info, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  const requestedRole = searchParams.get("role"); // "user" or "admin"
  
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showDemoDialog, setShowDemoDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { signIn, signUp, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirect based on role
      if (isAdmin || requestedRole === "admin") {
        navigate("/admin");
      } else {
        navigate("/profilo");
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

  const handleQuickLogin = async (type: "user" | "admin") => {
    const creds = DEMO_CREDENTIALS[type];
    setEmail(creds.email);
    setPassword(creds.password);
    setShowDemoDialog(false);
    
    setIsLoading(true);
    const { error } = await signIn(creds.email, creds.password);
    setIsLoading(false);

    if (error) {
      setError(`Errore login demo: ${error.message}. Assicurati che l'account demo esista.`);
    } else {
      toast.success(`Accesso come ${creds.role} effettuato!`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiato!");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-3xl font-bold">
            Pizzeria <span className="text-primary">Rossi</span>
          </Link>
          <p className="text-muted-foreground mt-2">
            {requestedRole === "admin" 
              ? "Accedi come Amministratore" 
              : "Accedi o registrati per gestire le tue prenotazioni"
            }
          </p>
        </div>

        <Card className="p-6 relative">
          {/* Demo Info Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-muted-foreground hover:text-primary"
            onClick={() => setShowDemoDialog(true)}
            title="Credenziali Demo"
          >
            <Info className="w-5 h-5" />
          </Button>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <Tabs defaultValue="login" onValueChange={() => setError(null)}>
            <TabsList className="w-full mb-6">
              <TabsTrigger value="login" className="flex-1">Accedi</TabsTrigger>
              <TabsTrigger value="register" className="flex-1">Registrati</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    placeholder="Email" 
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
                    type={showPassword ? "text" : "password"}
                    className="pl-10 pr-10" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <Button className="w-full" disabled={isLoading}>
                  {isLoading ? "Caricamento..." : "Accedi"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    placeholder="Nome e Cognome" 
                    className="pl-10" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required 
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    placeholder="Email" 
                    type="email" 
                    className="pl-10" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    placeholder="Telefono" 
                    type="tel" 
                    className="pl-10" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    placeholder="Password" 
                    type={showPassword ? "text" : "password"}
                    className="pl-10 pr-10" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <Button className="w-full" disabled={isLoading}>
                  {isLoading ? "Caricamento..." : "Registrati"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/" className="text-primary hover:underline">← Torna alla Home</Link>
        </p>
      </motion.div>

      {/* Demo Credentials Dialog */}
      <Dialog open={showDemoDialog} onOpenChange={setShowDemoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              Credenziali Demo
            </DialogTitle>
            <DialogDescription>
              Usa queste credenziali per testare l'applicazione
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* User Demo */}
            <Card className="p-4 border-primary/20">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Account Utente
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between bg-muted/50 p-2 rounded">
                  <span className="text-muted-foreground">Email:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-foreground">{DEMO_CREDENTIALS.user.email}</code>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(DEMO_CREDENTIALS.user.email)}
                    >
                      📋
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-muted/50 p-2 rounded">
                  <span className="text-muted-foreground">Password:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-foreground">{DEMO_CREDENTIALS.user.password}</code>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(DEMO_CREDENTIALS.user.password)}
                    >
                      📋
                    </Button>
                  </div>
                </div>
              </div>
              <Button 
                className="w-full mt-3" 
                variant="outline"
                onClick={() => handleQuickLogin("user")}
                disabled={isLoading}
              >
                Accedi come Utente Demo
              </Button>
            </Card>

            {/* Admin Demo */}
            <Card className="p-4 border-amber-500/30 bg-amber-500/5">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <User className="w-4 h-4" />
                Account Amministratore
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between bg-muted/50 p-2 rounded">
                  <span className="text-muted-foreground">Email:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-foreground">{DEMO_CREDENTIALS.admin.email}</code>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(DEMO_CREDENTIALS.admin.email)}
                    >
                      📋
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-muted/50 p-2 rounded">
                  <span className="text-muted-foreground">Password:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-foreground">{DEMO_CREDENTIALS.admin.password}</code>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(DEMO_CREDENTIALS.admin.password)}
                    >
                      📋
                    </Button>
                  </div>
                </div>
              </div>
              <Button 
                className="w-full mt-3 bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => handleQuickLogin("admin")}
                disabled={isLoading}
              >
                Accedi come Admin Demo
              </Button>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
