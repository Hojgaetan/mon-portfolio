import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";
import logoLight from "@/assets/logo fond beige.svg";
import logoDark from "@/assets/logo fond nuit.svg";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getActiveAccessPass } from "@/lib/access";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [city, setCity] = useState("");
  const [profession, setProfession] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN' && session?.user) {
          try {
            // Upsert de l'email dans profiles pour lister les utilisateurs par email dans l'admin
            await supabase.from('profiles').upsert({
              user_id: session.user.id,
              email: session.user.email ?? null,
              user_type: 'client'
            }, { onConflict: 'user_id' });
          } catch {}
          // Rediriger après connexion: admin vers /annuaire, sinon vers /annuaire si pass actif, sinon ouvrir l'achat sur /annuaire
          const { data: adminData } = await supabase
            .from('admins')
            .select('user_id')
            .eq('user_id', session.user.id)
            .maybeSingle();
          if (adminData) {
            navigate("/annuaire", { replace: true });
          } else {
            const pass = await getActiveAccessPass();
            navigate(pass ? "/annuaire" : "/annuaire?buy=1", { replace: true });
          }
        }
      }
    );

  // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        try {
          await supabase.from('profiles').upsert({
            user_id: session.user.id,
            email: session.user.email ?? null,
            user_type: 'client'
          }, { onConflict: 'user_id' });
        } catch {}
  // Rediriger selon rôle si déjà connecté: admin -> /annuaire ; sinon si pass actif -> /annuaire ; sinon /annuaire?buy=1
        const { data: adminData } = await supabase
          .from('admins')
          .select('user_id')
          .eq('user_id', session.user.id)
          .maybeSingle();
        if (adminData) {
          navigate("/annuaire", { replace: true });
        } else {
          const pass = await getActiveAccessPass();
          navigate(pass ? "/annuaire" : "/annuaire?buy=1", { replace: true });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Erreur de connexion",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté.",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName,
            city: city,
            profession: profession,
            user_type: 'visitor'
          }
        }
      });

      if (error) {
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Inscription réussie",
          description: "Vérifiez votre email pour confirmer votre compte.",
        });
        setIsSignUp(false); // Return to login form
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md bg-primary-light dark:bg-primary-dark">
        <div className="flex justify-center pt-6">
          <img src={logoLight} alt="Logo" className="h-20 block dark:hidden" />
          <img src={logoDark} alt="Logo" className="h-20 hidden dark:block" />
        </div>
        <CardHeader className="text-center">
          <CardTitle>{isSignUp ? "Créer un compte" : "Connexion"}</CardTitle>
          <CardDescription>
            {isSignUp 
              ? "Créez votre compte pour accéder à l'annuaire des entreprises"
              : "Connectez-vous pour accéder à votre compte"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isSignUp ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="focus:ring-accent-blue focus:border-accent-blue"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="focus:ring-accent-blue focus:border-accent-blue"
                />
              </div>
              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full bg-accent-blue hover:bg-accent-blue/90 text-white"
                  disabled={loading}
                >
                  {loading ? "Connexion..." : "Se connecter"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsSignUp(true)}
                  disabled={loading}
                >
                  Créer un compte
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Votre prénom"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Votre nom"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Votre ville"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profession">Profession</Label>
                <Input
                  id="profession"
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="Votre profession"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signupEmail">Email</Label>
                <Input
                  id="signupEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signupPassword">Mot de passe</Label>
                <Input
                  id="signupPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full bg-accent-green hover:bg-accent-green/90 text-white"
                  disabled={loading}
                >
                  {loading ? "Inscription..." : "Créer mon compte"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsSignUp(false)}
                  disabled={loading}
                >
                  Retour à la connexion
                </Button>
              </div>
            </form>
          )}
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => navigate("/")}
              className="text-sm"
            >
              Retour au site
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
