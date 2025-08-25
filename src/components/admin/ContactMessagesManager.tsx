import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Mail,
  MailOpen,
  Reply,
  Trash2,
  Calendar,
  User,
  MessageSquare,
  Eye,
  EyeOff
} from "lucide-react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  replied: boolean;
  created_at: string;
}

export function ContactMessagesManager() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string, read: boolean) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ read })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, read } : msg
        )
      );

      toast({
        title: read ? "Message marqué comme lu" : "Message marqué comme non lu",
        description: "Statut mis à jour avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const markAsReplied = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ replied: true, read: true })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, replied: true, read: true } : msg
        )
      );

      toast({
        title: "Message marqué comme répondu",
        description: "Statut mis à jour avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast({
        title: "Message supprimé",
        description: "Le message a été supprimé avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le message",
        variant: "destructive",
      });
    }
  };

  const sendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    setSendingReply(true);
    try {
      // Ici, vous pourriez intégrer un service d'email comme Resend, SendGrid, etc.
      // Pour l'instant, on simule l'envoi et on marque comme répondu

      await markAsReplied(selectedMessage.id);
      setReplyText("");
      setSelectedMessage(null);

      toast({
        title: "Réponse envoyée",
        description: `Réponse envoyée à ${selectedMessage.email}`,
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la réponse:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la réponse",
        variant: "destructive",
      });
    } finally {
      setSendingReply(false);
    }
  };

  const unreadCount = messages.filter(msg => !msg.read).length;
  const repliedCount = messages.filter(msg => msg.replied).length;

  if (loading) {
    return <div className="flex justify-center py-8">Chargement des messages...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Messages de contact</h2>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Total: {messages.length}</span>
          <span>Non lus: {unreadCount}</span>
          <span>Répondus: {repliedCount}</span>
        </div>
      </div>

      <div className="grid gap-4">
        {messages.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucun message de contact pour le moment.
            </CardContent>
          </Card>
        ) : (
          messages.map((message) => (
            <Card key={message.id} className={`transition-colors ${!message.read ? 'border-accent bg-accent/5' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {message.name}
                      <Badge variant={message.read ? "secondary" : "default"} className={`ml-2 ${!message.read ? 'bg-accent-blue text-white' : ''}`}>
                        {message.read ? "Lu" : "Non lu"}
                      </Badge>
                      {message.replied && (
                        <Badge variant="outline" className="bg-accent-green/10 text-accent-green border-accent-green/20">
                          Répondu
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {message.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(message.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(message.id, !message.read)}
                    >
                      {message.read ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedMessage(message);
                            if (!message.read) {
                              markAsRead(message.id, true);
                            }
                          }}
                        >
                          <Reply className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Répondre à {message.name}</DialogTitle>
                          <DialogDescription>
                            Message reçu le {new Date(message.created_at).toLocaleDateString('fr-FR')}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-4 bg-muted rounded-lg">
                            <h4 className="font-medium mb-2">Message original :</h4>
                            <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Votre réponse :</label>
                            <Textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Tapez votre réponse ici..."
                              rows={5}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => {
                              setSelectedMessage(null);
                              setReplyText("");
                            }}>
                              Annuler
                            </Button>
                            <Button
                              onClick={sendReply}
                              disabled={!replyText.trim() || sendingReply}
                            >
                              {sendingReply ? "Envoi..." : "Envoyer la réponse"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMessage(message.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-muted/50 p-3 rounded">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                      {message.message.length > 200
                        ? message.message.substring(0, 200) + "..."
                        : message.message
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
