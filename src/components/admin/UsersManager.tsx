import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, User, Mail, Calendar, Shield, Download } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useExcelExport } from "@/hooks/useExcelExport";

interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
}

export function UsersManager() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { exportToExcel, isExporting } = useExcelExport();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Note: En production, vous devriez utiliser l'API Admin de Supabase
      // Pour cette démo, nous simulons la récupération des utilisateurs
      const { data: { users }, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        // Fallback: récupérer l'utilisateur actuel
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUsers([{
            id: user.id,
            email: user.email || '',
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at,
            email_confirmed_at: user.email_confirmed_at,
          }]);
        }
      } else {
        setUsers(users.map(user => ({
          id: user.id,
          email: user.email || '',
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          email_confirmed_at: user.email_confirmed_at,
        })));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      toast({
        title: "Information",
        description: "Fonctionnalité limitée en mode démo. Seul l'utilisateur actuel est affiché.",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
    });
    setIsCreating(false);
  };

  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
      });

      if (error) throw error;
      
      toast({
        title: "Utilisateur créé",
        description: "Le nouvel utilisateur a été ajouté avec succès.",
      });

      resetForm();
      fetchUsers();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur s'est produite lors de la création.";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      return;
    }

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;
      
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès.",
      });
      
      fetchUsers();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Impossible de supprimer l'utilisateur.";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleExportToExcel = () => {
    const exportData = users.map(user => ({
      'Email': user.email,
      'Statut': user.email_confirmed_at ? 'Vérifié' : 'Non vérifié',
      'Date de création': new Date(user.created_at).toLocaleDateString('fr-FR'),
      'Dernière connexion': user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('fr-FR') : 'Jamais',
      'Email confirmé le': user.email_confirmed_at ? new Date(user.email_confirmed_at).toLocaleDateString('fr-FR') : 'Non confirmé'
    }));

    exportToExcel(exportData, {
      filename: 'utilisateurs',
      sheetName: 'Utilisateurs'
    });
  };

  if (loading) {
    return <div className="text-center">Chargement des utilisateurs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Gestion des utilisateurs</h2>
          <p className="text-muted-foreground">
            Gérez les comptes utilisateurs de votre application
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportToExcel}
            disabled={isExporting || users.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Export...' : 'Exporter Excel'}
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvel utilisateur
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total utilisateurs</CardTitle>
            <User className="h-4 w-4 text-accent-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-blue">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comptes vérifiés</CardTitle>
            <Shield className="h-4 w-4 text-accent-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-green">
              {users.filter(u => u.email_confirmed_at).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connexions récentes</CardTitle>
            <Calendar className="h-4 w-4 text-accent-sky" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-sky">
              {users.filter(u => u.last_sign_in_at && 
                new Date(u.last_sign_in_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Cette semaine</p>
          </CardContent>
        </Card>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Nouvel utilisateur</CardTitle>
            <CardDescription>
              Créer un nouveau compte utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  placeholder="utilisateur@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit">
                  Créer l'utilisateur
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{user.email}</h3>
                      {user.email_confirmed_at ? (
                        <Badge variant="default" className="text-xs bg-accent-green text-white">
                          Vérifié
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs bg-accent-red/10 text-accent-red">
                          Non vérifié
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Créé le {new Date(user.created_at).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      
                      {user.last_sign_in_at && (
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>
                            Dernière connexion: {new Date(user.last_sign_in_at).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(user.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {users.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}