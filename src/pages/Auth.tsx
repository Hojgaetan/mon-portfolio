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
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();

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
          title: t('auth.toast.login_error'),
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t('auth.toast.login_success'),
          description: t('auth.toast.login_success_desc'),
        });
      }
    } catch (error) {
      toast({
        title: t('auth.toast.generic_error'),
        description: t('auth.toast.generic_error_desc'),
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
          title: t('auth.toast.signup_error'),
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t('auth.toast.signup_success'),
          description: t('auth.toast.signup_success_desc'),
        });
        setIsSignUp(false); // Return to login form
      }
    } catch (error) {
      toast({
        title: t('auth.toast.generic_error'),
        description: t('auth.toast.generic_error_desc'),
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
          <CardTitle>{isSignUp ? t('auth.title.signup') : t('auth.title.login')}</CardTitle>
          <CardDescription>
            {isSignUp 
              ? t('auth.subtitle.signup')
              : t('auth.subtitle.login')
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isSignUp ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.placeholder.email')}
                  required
                  className="focus:ring-accent-blue focus:border-accent-blue"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.placeholder.password')}
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
                  {loading ? t('auth.signing_in') : t('auth.sign_in')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsSignUp(true)}
                  disabled={loading}
                >
                  {t('auth.sign_up')}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('auth.first_name')}</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={t('auth.first_name')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('auth.last_name')}</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={t('auth.last_name')}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">{t('auth.city')}</Label>
                <Input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t('auth.city')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profession">{t('auth.profession')}</Label>
                <Input
                  id="profession"
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder={t('auth.profession')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signupEmail">{t('auth.email')}</Label>
                <Input
                  id="signupEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.placeholder.email')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signupPassword">{t('auth.password')}</Label>
                <Input
                  id="signupPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.placeholder.password')}
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
                  {loading ? t('auth.signing_up') : t('auth.sign_up')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsSignUp(false)}
                  disabled={loading}
                >
                  {t('auth.back_to_login')}
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
              {t('auth.back_to_site')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
