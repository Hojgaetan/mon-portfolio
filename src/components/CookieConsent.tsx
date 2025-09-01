import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getConsent, setConsent, type CookieConsent } from "@/lib/cookies";

export default function CookieConsentBanner() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<CookieConsent>({ necessary: true, preferences: false, analytics: false });
  const [showCustomize, setShowCustomize] = useState(false);

  useEffect(() => {
    const c = getConsent();
    if (!c) setOpen(true);
  }, []);

  if (!open) return null;

  const acceptAll = () => {
    setConsent({ necessary: true, preferences: true, analytics: true });
    setOpen(false);
  };

  const rejectAll = () => {
    setConsent({ necessary: true, preferences: false, analytics: false });
    setOpen(false);
  };

  const save = () => {
    setConsent(prefs);
    setOpen(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-1/2 md:-translate-x-1/2 md:w-[720px]">
      <div className="bg-card border border-border rounded-xl shadow-xl p-4 md:p-5">
        <div className="md:flex md:items-start md:justify-between gap-4">
          <div className="md:flex-1">
            <h4 className="font-semibold mb-1">Cookies</h4>
            <p className="text-sm text-muted-foreground">
              Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez accepter, refuser, ou personnaliser vos préférences.
            </p>
            {showCustomize && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between py-1">
                  <Label className="text-sm">Nécessaires</Label>
                  <Switch checked disabled aria-readonly />
                </div>
                <div className="flex items-center justify-between py-1">
                  <Label className="text-sm">Préférences</Label>
                  <Switch
                    checked={prefs.preferences}
                    onCheckedChange={(v) => setPrefs((p) => ({ ...p, preferences: v }))}
                  />
                </div>
                <div className="flex items-center justify-between py-1">
                  <Label className="text-sm">Analytics</Label>
                  <Switch
                    checked={prefs.analytics}
                    onCheckedChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="mt-3 md:mt-0 flex gap-2 md:flex-col">
            {!showCustomize && (
              <Button variant="outline" onClick={() => setShowCustomize(true)}>Personnaliser</Button>
            )}
            {showCustomize ? (
              <Button onClick={save}>Enregistrer</Button>
            ) : (
              <Button onClick={acceptAll}>Accepter</Button>
            )}
            <Button variant="secondary" onClick={rejectAll}>Refuser</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

