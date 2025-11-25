import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Star, ChevronLeft, ChevronRight, LinkedinIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScaleIn } from '@/components/AnimatedSection';
import { motion, AnimatePresence } from 'framer-motion';

interface Testimonial {
  id: string;
  client_name: string;
  client_company: string | null;
  client_role: string | null;
  client_avatar_url: string | null;
  client_initials: string | null;
  testimonial_text: string;
  rating: number;
  linkedin_url: string | null;
  project_type: string | null;
}

interface TestimonialsSectionProps {
  variant?: 'default' | 'carousel';
  maxItems?: number;
}

export const TestimonialsSection = ({ variant = 'default', maxItems }: TestimonialsSectionProps) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { language } = useLanguage();

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('testimonials')
          .select('*')
          .eq('locale', language)
          .eq('is_active', true)
          .eq('is_featured', true)
          .order('order_index', { ascending: true });

        if (maxItems) {
          query = query.limit(maxItems);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Erreur chargement témoignages:', error);
          setTestimonials([]);
          return;
        }

        setTestimonials(data || []);
      } catch (e) {
        console.error('Erreur chargement témoignages:', e);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    loadTestimonials();
  }, [language, maxItems]);

  const getColorForIndex = (index: number) => {
    const colors = [
      { bg: 'bg-gradient-to-br from-accent-blue to-accent-blue/80', border: 'border-accent-blue/30' },
      { bg: 'bg-gradient-to-br from-accent-green to-accent-green/80', border: 'border-accent-green/30' },
      { bg: 'bg-gradient-to-br from-accent-red to-accent-red/80', border: 'border-accent-red/30' },
      { bg: 'bg-gradient-to-br from-accent-sky to-accent-sky/80', border: 'border-accent-sky/30' },
    ];
    return colors[index % colors.length];
  };

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (variant === 'carousel' && testimonials.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [variant, testimonials.length]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="border-2">
            <CardHeader>
              <Skeleton className="h-12 w-12 rounded-full mb-3" />
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  if (variant === 'carousel') {
    return (
      <div className="relative max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          >
            <TestimonialCard
              testimonial={testimonials[currentIndex]}
              colorScheme={getColorForIndex(currentIndex)}
              showLinkedIn
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {testimonials.length > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              className="rounded-full hover:bg-primary/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Dots indicateurs */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'
                  }`}
                  aria-label={`Aller au témoignage ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              className="rounded-full hover:bg-primary/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Grid par défaut
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {testimonials.map((testimonial, index) => (
        <ScaleIn key={testimonial.id} delay={index * 0.1}>
          <TestimonialCard
            testimonial={testimonial}
            colorScheme={getColorForIndex(index)}
            showLinkedIn
          />
        </ScaleIn>
      ))}
    </div>
  );
};

interface TestimonialCardProps {
  testimonial: Testimonial;
  colorScheme: { bg: string; border: string };
  showLinkedIn?: boolean;
}

const TestimonialCard = ({ testimonial, colorScheme, showLinkedIn }: TestimonialCardProps) => {
  return (
    <Card className={`border-2 hover:${colorScheme.border} transition-all duration-300 h-full flex flex-col hover:shadow-xl hover-lift`}>
      <CardHeader>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-full ${colorScheme.bg} flex items-center justify-center text-white font-bold text-lg`}>
            {testimonial.client_avatar_url ? (
              <img
                src={testimonial.client_avatar_url}
                alt={testimonial.client_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              testimonial.client_initials || testimonial.client_name.substring(0, 2).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{testimonial.client_name}</CardTitle>
              {showLinkedIn && testimonial.linkedin_url && (
                <a
                  href={testimonial.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Profil LinkedIn"
                >
                  <LinkedinIcon className="h-4 w-4" />
                </a>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {testimonial.client_role && testimonial.client_company
                ? `${testimonial.client_role}, ${testimonial.client_company}`
                : testimonial.client_role || testimonial.client_company}
            </p>
          </div>
        </div>
        <div className="flex gap-1 mb-2">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-accent-yellow text-accent-yellow" />
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground italic leading-relaxed">
          "{testimonial.testimonial_text}"
        </p>
      </CardContent>
    </Card>
  );
};

