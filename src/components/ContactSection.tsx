import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { getClientIP } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Mail, PhoneCall } from "lucide-react";

export const ContactSection = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation côté client
      if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
        throw new Error(t('contact.all_fields_required'));
      }

      const ip = await getClientIP();

      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
          ip_address: ip || null,
          user_agent: navigator.userAgent || null
        });

      if (error) {
        console.error('Erreur Supabase:', error);
        throw new Error(`Erreur base de données: ${error.message}`);
      }

      setSent(true);
      setForm({ name: "", email: "", message: "" });
      toast({
        title: t('contact.success'),
        description: t('contact.success_description'),
      });

      // Reset après 5 secondes
      setTimeout(() => setSent(false), 5000);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue";
      toast({
        title: t('contact.error'),
        description: `${t('contact.error_description')}: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-center px-4 py-12 font-sans bg-background">
      <div className="max-w-2xl w-full bg-card/90 backdrop-blur-sm border border-accent-blue/30 rounded-lg shadow-xl p-8 space-y-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 via-accent-sky/5 to-transparent pointer-events-none" />
        <div className="space-y-3 text-center relative">
          <Badge className="mx-auto bg-accent-blue/20 text-accent-blue border-accent-blue/30">
            {t('contact.badge') || (t('contact.title') ?? 'Contact')}
          </Badge>
          <h2 className="text-3xl font-bold text-foreground">
            <span className="text-accent-blue">{t('contact.title')}</span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">{t('contact.description')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 relative">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('contact.name')}</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              className="px-3 py-2 border border-accent-blue/30 rounded bg-background/60 text-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('contact.email')}</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="px-3 py-2 border border-accent-sky/30 rounded bg-background/60 text-foreground focus:outline-none focus:ring-2 focus:ring-accent-sky/50 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('contact.message')}</label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              value={form.message}
              onChange={handleChange}
              className="px-3 py-2 border border-accent-green/30 rounded bg-background/60 text-foreground focus:outline-none focus:ring-2 focus:ring-accent-green/50 transition-colors resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded bg-accent-blue text-white font-semibold hover:bg-accent-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-accent-blue/20"
            disabled={sent || loading}
          >
            {loading ? t('contact.sending') : sent ? t('contact.success') : t('contact.send')}
          </button>
        </form>
        <div className="border-t border-accent-blue/20 pt-6 flex flex-col gap-3 text-xs text-muted-foreground relative">
          <div className="flex items-center gap-2">
            <Mail className="w-3 h-3 text-accent-blue" />
            <span className="font-semibold text-foreground">{t('contact.email')} :</span> contact@joelhassam.com
          </div>
          <div className="flex items-center gap-2">
            <PhoneCall className="w-3 h-3 text-accent-green" />
            <span className="font-semibold text-foreground">{t('contact.phone')} :</span> 221 77 202 04 30
          </div>
          <div className="flex items-center gap-4 mt-2 justify-center">
            <a href="https://www.linkedin.com/in/joel-gaetan-hassam-obah/" target="_blank" rel="noopener noreferrer" className="px-3 py-1 rounded border border-accent-sky/40 text-accent-sky hover:bg-accent-sky/10 transition-colors text-xs">
              LinkedIn
            </a>
            <a href="https://github.com/Hojgaetan" target="_blank" rel="noopener noreferrer" className="px-3 py-1 rounded border border-accent-yellow/40 text-accent-yellow hover:bg-accent-yellow/10 transition-colors text-xs">
              Github
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
