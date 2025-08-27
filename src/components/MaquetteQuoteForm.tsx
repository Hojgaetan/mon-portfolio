import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Clock, CheckCircle } from "lucide-react";

const formSchema = z.object({
  // Section 1
  fullName: z.string().min(2, "Le nom complet est requis"),
  companyName: z.string().min(2, "Le nom de l'entreprise est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  currentWebsite: z.string().url().optional().or(z.literal("")),
  businessSector: z.string().optional(),
  
  // Section 2
  projectName: z.string().min(2, "Le nom du projet est requis"),
  projectDescription: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  objectives: z.array(z.string()).min(1, "Sélectionnez au moins un objectif"),
  otherObjective: z.string().optional(),
  hasDocuments: z.enum(["yes", "no"]),
  
  // Section 3
  targetAudience: z.string().optional(),
  userBehavior: z.string().optional(),
  
  // Section 4
  platforms: z.array(z.string()).min(1, "Sélectionnez au moins une plateforme"),
  otherPlatform: z.string().optional(),
  webPages: z.string().optional(),
  mobileScreens: z.string().optional(),
  needsInteractiveStates: z.enum(["yes", "no"]),
  interactiveStatesDetails: z.string().optional(),
  needsDesignSystem: z.enum(["yes", "no", "dont-know"]),
  
  // Section 5
  contentProvider: z.enum(["ready", "needs-creation", "mix"]),
  hasGraphicChart: z.enum(["yes", "no", "ideas"]),
  inspirationLinks: z.string().optional(),
  
  // Section 6
  budget: z.string().optional(),
  deadline: z.string().min(1, "La date de livraison est requise"),
  isUrgent: z.enum(["yes", "no"]),
  
  // Section 7
  additionalServices: z.array(z.string()).optional()
});

type FormData = z.infer<typeof formSchema>;

interface MaquetteQuoteFormProps {
  onClose: () => void;
}

export function MaquetteQuoteForm({ onClose }: MaquetteQuoteFormProps) {
  const [currentSection, setCurrentSection] = useState(1);
  const totalSections = 7;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      objectives: [],
      platforms: [],
      additionalServices: []
    }
  });

  const watchedObjectives = watch("objectives");
  const watchedPlatforms = watch("platforms");
  const watchedAdditionalServices = watch("additionalServices");
  const watchedNeedsInteractiveStates = watch("needsInteractiveStates");

  const handleNext = async () => {
    const isValid = await trigger();
    if (isValid && currentSection < totalSections) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  const onSubmit = (data: FormData) => {
    // Construire le message WhatsApp
    const message = `Bonjour ! Je souhaite obtenir un devis pour la conception de maquettes web/mobile.

📋 INFORMATIONS PERSONNELLES
• Nom: ${data.fullName}
• Entreprise: ${data.companyName}
• Email: ${data.email}
• Téléphone: ${data.phone || "Non renseigné"}
• Site actuel: ${data.currentWebsite || "Aucun"}
• Secteur: ${data.businessSector || "Non renseigné"}

🚀 PROJET
• Nom: ${data.projectName}
• Description: ${data.projectDescription}
• Objectifs: ${data.objectives.join(", ")}${data.otherObjective ? ` + ${data.otherObjective}` : ""}

👥 PUBLIC CIBLE
• Audience: ${data.targetAudience || "Non renseigné"}
• Comportement: ${data.userBehavior || "Non renseigné"}

💻 SPÉCIFICATIONS TECHNIQUES
• Plateformes: ${data.platforms.join(", ")}${data.otherPlatform ? ` + ${data.otherPlatform}` : ""}
• Pages web: ${data.webPages || "Non renseigné"}
• Écrans mobile: ${data.mobileScreens || "Non renseigné"}
• États interactifs: ${data.needsInteractiveStates === "yes" ? `Oui - ${data.interactiveStatesDetails}` : "Non"}
• Design System: ${data.needsDesignSystem === "yes" ? "Oui" : data.needsDesignSystem === "no" ? "Non" : "Je ne sais pas"}

📝 CONTENU & BRANDING
• Contenu: ${data.contentProvider === "ready" ? "Prêt à fournir" : data.contentProvider === "needs-creation" ? "À créer" : "Mix des deux"}
• Charte graphique: ${data.hasGraphicChart === "yes" ? "Existante" : data.hasGraphicChart === "no" ? "À créer" : "Quelques idées"}
${data.inspirationLinks ? `• Inspirations: ${data.inspirationLinks}` : ""}

💰 BUDGET & DÉLAIS
• Budget: ${data.budget || "Non renseigné"}
• Date souhaitée: ${data.deadline}
• Urgent: ${data.isUrgent === "yes" ? "Oui" : "Non"}

🔧 SERVICES COMPLÉMENTAIRES
${data.additionalServices && data.additionalServices.length > 0 ? data.additionalServices.join(", ") : "Aucun"}

Merci de me faire parvenir votre devis personnalisé !`;

    // Encoder le message pour WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/22893139098?text=${encodedMessage}`;
    
    // Ouvrir WhatsApp
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  const handleCheckboxChange = (value: string, field: "objectives" | "platforms" | "additionalServices") => {
    const currentValues = watch(field) || [];
    if (currentValues.includes(value)) {
      setValue(field, currentValues.filter(item => item !== value));
    } else {
      setValue(field, [...currentValues, value]);
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Votre Identité et Votre Entreprise</h3>
              <p className="text-muted-foreground text-sm">
                Merci pour votre intérêt dans nos services. Ce formulaire nous permet de comprendre parfaitement votre projet et vos besoins pour vous établir un devis sur mesure et précis. Comptez environ 10 minutes pour le remplir.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Nom et Prénom *</Label>
                <Input id="fullName" {...register("fullName")} className="mt-1" />
                {errors.fullName && <p className="text-destructive text-sm mt-1">{errors.fullName.message}</p>}
              </div>
              
              <div>
                <Label htmlFor="companyName">Nom de l'Entreprise / Structure *</Label>
                <Input id="companyName" {...register("companyName")} className="mt-1" />
                {errors.companyName && <p className="text-destructive text-sm mt-1">{errors.companyName.message}</p>}
              </div>
              
              <div>
                <Label htmlFor="email">Adresse email *</Label>
                <Input id="email" type="email" {...register("email")} className="mt-1" />
                {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
              </div>
              
              <div>
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <Input id="phone" {...register("phone")} className="mt-1" />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="currentWebsite">Lien vers votre site web actuel (si existant)</Label>
                <Input id="currentWebsite" {...register("currentWebsite")} className="mt-1" placeholder="https://..." />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="businessSector">Quel est le secteur d'activité de votre entreprise ?</Label>
                <Input id="businessSector" {...register("businessSector")} className="mt-1" placeholder="ex: e-commerce, santé, restauration, tech..." />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Aperçu du Projet (La Vision)</h3>
            </div>
            
            <div>
              <Label htmlFor="projectName">Nom du projet *</Label>
              <Input id="projectName" {...register("projectName")} className="mt-1" />
              {errors.projectName && <p className="text-destructive text-sm mt-1">{errors.projectName.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="projectDescription">Décrivez en quelques phrases votre projet, son objectif principal et la valeur qu'il apporte. *</Label>
              <Textarea 
                id="projectDescription" 
                {...register("projectDescription")} 
                className="mt-1" 
                rows={4}
                placeholder="Ex: Création d'une application mobile de recettes de cuisine avec liste de courses intégrée"
              />
              {errors.projectDescription && <p className="text-destructive text-sm mt-1">{errors.projectDescription.message}</p>}
            </div>
            
            <div>
              <Label>Quels sont les objectifs principaux de ce nouveau design ? (Cochez toutes les cases pertinentes)</Label>
              <div className="grid md:grid-cols-2 gap-3 mt-2">
                {[
                  "Augmenter le taux de conversion (ventes, inscriptions)",
                  "Moderniser l'image de marque", 
                  "Améliorer l'expérience utilisateur (UX)",
                  "Clarifier le parcours utilisateur",
                  "Présenter un nouveau produit/service"
                ].map((objective) => (
                  <div key={objective} className="flex items-center space-x-2">
                    <Checkbox
                      id={objective}
                      checked={watchedObjectives?.includes(objective)}
                      onCheckedChange={() => handleCheckboxChange(objective, "objectives")}
                    />
                    <Label htmlFor={objective} className="text-sm">{objective}</Label>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <Label htmlFor="otherObjective">Autre :</Label>
                <Input id="otherObjective" {...register("otherObjective")} className="mt-1" />
              </div>
              {errors.objectives && <p className="text-destructive text-sm mt-1">{errors.objectives.message}</p>}
            </div>
            
            <div>
              <Label>Avez-vous des documents préparatoires ? (Mockups dessinés à la main, benchmark, notes...)</Label>
              <RadioGroup value={watch("hasDocuments")} onValueChange={(value) => setValue("hasDocuments", value as "yes" | "no")} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="docs-yes" />
                  <Label htmlFor="docs-yes">Oui, je peux les joindre</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="docs-no" />
                  <Label htmlFor="docs-no">Non</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Public Cible</h3>
            </div>
            
            <div>
              <Label htmlFor="targetAudience">À qui s'adresse ce produit / service ? Décrivez votre public cible (âge, profession, centres d'intérêt, etc.)</Label>
              <Textarea id="targetAudience" {...register("targetAudience")} className="mt-1" rows={3} />
            </div>
            
            <div>
              <Label htmlFor="userBehavior">Comment vos clients utilisent-ils habituellement votre service ? (Sur mobile en déplacement ? Sur ordinateur au travail ?)</Label>
              <Textarea id="userBehavior" {...register("userBehavior")} className="mt-1" rows={3} />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Périmètre et Spécifications Techniques</h3>
            </div>
            
            <div>
              <Label>Quels supports doivent être conçus ? *</Label>
              <div className="grid md:grid-cols-2 gap-3 mt-2">
                {[
                  "Site Web (Desktop)",
                  "Site Web (Tablette)", 
                  "Application Mobile (iOS)",
                  "Application Mobile (Android)"
                ].map((platform) => (
                  <div key={platform} className="flex items-center space-x-2">
                    <Checkbox
                      id={platform}
                      checked={watchedPlatforms?.includes(platform)}
                      onCheckedChange={() => handleCheckboxChange(platform, "platforms")}
                    />
                    <Label htmlFor={platform} className="text-sm">{platform}</Label>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <Label htmlFor="otherPlatform">Autre :</Label>
                <Input id="otherPlatform" {...register("otherPlatform")} className="mt-1" />
              </div>
              {errors.platforms && <p className="text-destructive text-sm mt-1">{errors.platforms.message}</p>}
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="webPages">Nombre de pages web uniques</Label>
                <Input id="webPages" {...register("webPages")} className="mt-1" placeholder="ex: 5 pages" />
              </div>
              <div>
                <Label htmlFor="mobileScreens">Nombre d'écrans mobiles uniques</Label>
                <Input id="mobileScreens" {...register("mobileScreens")} className="mt-1" placeholder="ex: 8 écrans" />
              </div>
            </div>
            
            <div>
              <Label>Avez-vous besoin de maquettes pour des états interactifs spécifiques ?</Label>
              <RadioGroup value={watchedNeedsInteractiveStates} onValueChange={(value) => setValue("needsInteractiveStates", value as "yes" | "no")} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="interactive-yes" />
                  <Label htmlFor="interactive-yes">Oui</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="interactive-no" />
                  <Label htmlFor="interactive-no">Non, les maquettes des pages principales suffisent</Label>
                </div>
              </RadioGroup>
              {watchedNeedsInteractiveStates === "yes" && (
                <div className="mt-3">
                  <Label htmlFor="interactiveStatesDetails">Veuillez préciser :</Label>
                  <Textarea id="interactiveStatesDetails" {...register("interactiveStatesDetails")} className="mt-1" rows={2} placeholder="ex: Menus déroulants, messages d'erreur, écrans de chargement, hover states..." />
                </div>
              )}
            </div>
            
            <div>
              <Label>Le devis doit-il inclure la création d'un système de design (Design System) ou d'une charte graphique détaillée ?</Label>
              <RadioGroup value={watch("needsDesignSystem")} onValueChange={(value) => setValue("needsDesignSystem", value as "yes" | "no" | "dont-know")} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="design-yes" />
                  <Label htmlFor="design-yes">Oui, c'est nécessaire</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="design-no" />
                  <Label htmlFor="design-no">Non, les maquettes classiques suffisent</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dont-know" id="design-dont-know" />
                  <Label htmlFor="design-dont-know">Je ne sais pas</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Contenu et Branding</h3>
            </div>
            
            <div>
              <Label>Qui fournira le contenu pour le site/application ?</Label>
              <RadioGroup value={watch("contentProvider")} onValueChange={(value) => setValue("contentProvider", value as "ready" | "needs-creation" | "mix")} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ready" id="content-ready" />
                  <Label htmlFor="content-ready">Le contenu (textes, images) est prêt et je peux le fournir</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="needs-creation" id="content-creation" />
                  <Label htmlFor="content-creation">Le contenu doit être créé ou rédigé (ce service est-il inclus ?)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mix" id="content-mix" />
                  <Label htmlFor="content-mix">Un mix des deux</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <Label>Avez-vous une charte graphique existante (logo, couleurs, polices) ?</Label>
              <RadioGroup value={watch("hasGraphicChart")} onValueChange={(value) => setValue("hasGraphicChart", value as "yes" | "no" | "ideas")} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="chart-yes" />
                  <Label htmlFor="chart-yes">Oui, je peux la joindre</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="chart-no" />
                  <Label htmlFor="chart-no">Non, il faut la créer (ce service est-il inclus ?)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ideas" id="chart-ideas" />
                  <Label htmlFor="chart-ideas">Non, mais j'ai quelques idées de couleurs/direction</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <Label htmlFor="inspirationLinks">Avez-vous des exemples de sites ou d'applications que vous aimez (ou n'aimez pas) ? Merci de fournir les liens et d'expliquer pourquoi.</Label>
              <Textarea id="inspirationLinks" {...register("inspirationLinks")} className="mt-1" rows={4} placeholder="ex: https://exemple.com - j'aime le style minimaliste et la navigation fluide..." />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Budget et Délais</h3>
            </div>
            
            <div>
              <Label htmlFor="budget">Avez-vous un budget prévisionnel pour la phase de design ? (Cette information nous aide à vous proposer une solution adaptée)</Label>
              <Input id="budget" {...register("budget")} className="mt-1" placeholder="ex: 50 000 - 100 000 F CFA" />
            </div>
            
            <div>
              <Label htmlFor="deadline">Quelle est votre date de livraison idéale ou date butoir ? *</Label>
              <Input id="deadline" type="date" {...register("deadline")} className="mt-1" />
              {errors.deadline && <p className="text-destructive text-sm mt-1">{errors.deadline.message}</p>}
            </div>
            
            <div>
              <Label>Le projet est-il urgent ?</Label>
              <RadioGroup value={watch("isUrgent")} onValueChange={(value) => setValue("isUrgent", value as "yes" | "no")} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="urgent-yes" />
                  <Label htmlFor="urgent-yes">Oui</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="urgent-no" />
                  <Label htmlFor="urgent-no">Non</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Prestations Complémentaires</h3>
            </div>
            
            <div>
              <Label>Souhaitez-vous également un devis pour :</Label>
              <div className="space-y-3 mt-2">
                {[
                  "Le développement front-end/intégration (transformer les maquettes en site fonctionnel)",
                  "Le développement back-end / fonctionnalités complexes",
                  "La rédaction de contenu (textes)",
                  "La stratégie UX (recherche utilisateur, audits, tests)",
                  "La maintenance future"
                ].map((service) => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={service}
                      checked={watchedAdditionalServices?.includes(service)}
                      onCheckedChange={() => handleCheckboxChange(service, "additionalServices")}
                    />
                    <Label htmlFor={service} className="text-sm">{service}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-accent-blue/5 border border-accent-blue/20 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-accent-green" />
                <h4 className="font-semibold text-lg">Presque terminé !</h4>
              </div>
              <p className="text-muted-foreground mb-4">
                Merci d'avoir pris le temps de remplir ce formulaire. Nous analysons chaque demande avec soin et reviendrons vers vous sous 48h avec un devis détaillé et personnalisé.
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Réponse sous 48h</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>Contact via WhatsApp</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto">
        <CardHeader className="sticky top-0 bg-card border-b z-10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Demande de devis - Maquettes web/mobile</CardTitle>
              <p className="text-muted-foreground">Section {currentSection} sur {totalSections}</p>
            </div>
            <Button variant="ghost" onClick={onClose}>✕</Button>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2 mt-4">
            <div 
              className="bg-accent-blue h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentSection / totalSections) * 100}%` }}
            />
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            {renderSection()}
            
            <div className="flex justify-between pt-8">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentSection === 1}
              >
                ← Précédent
              </Button>
              
              {currentSection < totalSections ? (
                <Button type="button" onClick={handleNext}>
                  Suivant →
                </Button>
              ) : (
                <Button type="submit" className="bg-accent-green hover:bg-accent-green/90">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Envoyer via WhatsApp
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}