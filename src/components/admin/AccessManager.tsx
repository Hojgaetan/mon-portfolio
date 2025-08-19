import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Mail, Calendar, Plus, CheckCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserProfile {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  city: string | null;
  profession: string | null;
}

interface AccessPass {
  id: string;
  user_id: string;
  status: string;
  expires_at: string;
  created_at: string;
  amount: number;
  currency: string;
  profiles?: UserProfile;
}

interface User {
  id: string;
  email: string;
}

export function AccessManager() {
  const [accessPasses, setAccessPasses] = useState<AccessPass[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isGranting, setIsGranting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAccessPasses();
    fetchUsers();
  }, []);

  const fetchAccessPasses = async () => {
    try {
      const { data, error } = await supabase
        .from("access_pass")
        .select(`
          *,
          profiles (
            user_id,
            first_name,
            last_name,
            city,
            profession
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAccessPasses(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des accès:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les accès utilisateurs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // Récupérer les profils pour avoir accès aux emails via les relations
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name");

      if (error) throw error;

      // Pour chaque profil, essayer de récupérer l'email depuis auth
      const usersWithEmails: User[] = [];
      for (const profile of profiles || []) {
        try {
          // Note: En production, vous devriez utiliser l'API Admin
          const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(profile.user_id);
          if (!userError && user) {
            usersWithEmails.push({
              id: user.id,
              email: user.email || '',
            });
          }
        } catch (err) {
          // Ignorer les erreurs individuelles
        }
      }
      
      setUsers(usersWithEmails);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
    }
  };

  const handleGrantAccess = async () => {
    if (!selectedUserId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un utilisateur",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGranting(true);
      
      // Créer un accès de 1 heure
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      const { error } = await supabase
        .from("access_pass")
        .insert([
          {
            user_id: selectedUserId,
            status: "active",
            expires_at: expiresAt.toISOString(),
            amount: 5000,
            currency: "XOF"
          }
        ]);

      if (error) throw error;

      toast({
        title: "Accès accordé",
        description: "L'utilisateur a maintenant accès à l'annuaire pour 1 heure",
      });

      setSelectedUserId("");
      fetchAccessPasses();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur s'est produite";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGranting(false);
    }
  };

  const isAccessActive = (pass: AccessPass) => {
    return pass.status === "active" && new Date(pass.expires_at) > new Date();
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return "Expiré";
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}min`;
    }
    return `${remainingMinutes}min`;
  };

  if (loading) {
    return <div className="text-center">Chargement des accès...</div>;
  }

  const activeAccesses = accessPasses.filter(isAccessActive);
  const expiredAccesses = accessPasses.filter(pass => !isAccessActive(pass));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Gestion des accès</h2>
          <p className="text-muted-foreground">
            Accordez l'accès à l'annuaire des entreprises
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accès actifs</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeAccesses.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total accès</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accessPasses.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus total</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accessPasses.reduce((sum, pass) => sum + pass.amount, 0).toLocaleString()} F
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grant Access Form */}
      <Card>
        <CardHeader>
          <CardTitle>Accorder un accès</CardTitle>
          <CardDescription>
            Donnez accès à l'annuaire à un utilisateur pour 1 heure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="user-select">Sélectionner un utilisateur</Label>
              <select
                id="user-select"
                className="w-full mt-1 p-2 border border-input bg-background rounded-md"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Choisir un utilisateur...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleGrantAccess}
                disabled={isGranting || !selectedUserId}
              >
                <Plus className="w-4 h-4 mr-2" />
                {isGranting ? "Attribution..." : "Accorder l'accès"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Accesses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">Accès actifs ({activeAccesses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeAccesses.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Aucun accès actif</p>
            ) : (
              activeAccesses.map((pass) => (
                <div key={pass.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-green-100 text-green-700">
                        {pass.profiles?.first_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {pass.profiles?.first_name} {pass.profiles?.last_name}
                        </span>
                        <Badge variant="default" className="bg-green-600">
                          <Clock className="w-3 h-3 mr-1" />
                          {getTimeRemaining(pass.expires_at)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Expire le {new Date(pass.expires_at).toLocaleString("fr-FR")}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium">{pass.amount.toLocaleString()} {pass.currency}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(pass.created_at).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expired Accesses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-muted-foreground">Accès expirés ({expiredAccesses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {expiredAccesses.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Aucun accès expiré</p>
            ) : (
              expiredAccesses.map((pass) => (
                <div key={pass.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-muted">
                        {pass.profiles?.first_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {pass.profiles?.first_name} {pass.profiles?.last_name}
                        </span>
                        <Badge variant="secondary">
                          Expiré
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Expiré le {new Date(pass.expires_at).toLocaleString("fr-FR")}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium">{pass.amount.toLocaleString()} {pass.currency}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(pass.created_at).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}