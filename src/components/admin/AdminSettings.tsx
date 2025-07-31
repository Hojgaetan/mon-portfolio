import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { 
  Palette, 
  Globe, 
  Bell, 
  Shield, 
  Database,
  Moon,
  Sun,
  Monitor
} from "lucide-react";

export function AdminSettings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    siteName: "Joel Gaetan HASSAM OBAH - Portfolio",
    siteDescription: "Portfolio de Joel Gaetan Hassam Obah, Étudiant en Informatique",
    emailNotifications: true,
    commentModeration: false,
    publicRegistration: false,
    maintenanceMode: false,
  });

  const handleSave = () => {
    // Ici vous pourriez sauvegarder les paramètres dans une base de données
    toast({
      title: "Paramètres sauvegardés",
      description: "Vos modifications ont été enregistrées avec succès.",
    });
  };

  const themeOptions = [
    { value: "light", label: "Clair", icon: Sun },
    { value: "dark", label: "Sombre", icon: Moon },
    { value: "system", label: "Système", icon: Monitor },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Paramètres</h2>
        <p className="text-muted-foreground">
          Configurez votre application et vos préférences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Apparence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Apparence
            </CardTitle>
            <CardDescription>
              Personnalisez l'apparence de votre interface
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Thème</Label>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.value}
                      variant={theme === option.value ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => setTheme(option.value as "light" | "dark" | "system")}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Site Web */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Configuration du site
            </CardTitle>
            <CardDescription>
              Informations générales de votre site web
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Nom du site</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Description</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Gérez vos préférences de notification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications par email</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des notifications pour les nouveaux commentaires
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, emailNotifications: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Sécurité et modération
            </CardTitle>
            <CardDescription>
              Paramètres de sécurité et de modération du contenu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modération des commentaires</Label>
                <p className="text-sm text-muted-foreground">
                  Les commentaires doivent être approuvés avant publication
                </p>
              </div>
              <Switch
                checked={settings.commentModeration}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, commentModeration: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Inscription publique</Label>
                <p className="text-sm text-muted-foreground">
                  Permettre aux visiteurs de créer un compte
                </p>
              </div>
              <Switch
                checked={settings.publicRegistration}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, publicRegistration: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Maintenance
            </CardTitle>
            <CardDescription>
              Options de maintenance et de sauvegarde
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mode maintenance</Label>
                <p className="text-sm text-muted-foreground">
                  Activer le mode maintenance pour les visiteurs
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, maintenanceMode: checked }))
                }
              />
            </div>
            
            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full">
                Exporter les données
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            Sauvegarder les paramètres
          </Button>
        </div>
      </div>
    </div>
  );
}