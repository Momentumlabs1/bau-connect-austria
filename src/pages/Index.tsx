import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
  Hammer, 
  Zap, 
  Droplet, 
  Paintbrush, 
  Construction,
  Wrench,
  Flame,
  Trees,
  ChevronRight,
  Star,
  CheckCircle,
  Users,
  FolderOpen
} from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";

export default function Index() {
  const navigate = useNavigate();

  // Check if user is logged in and redirect to dashboard
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (profile?.role === 'customer') {
          navigate('/kunde/dashboard');
        } else if (profile?.role === 'contractor') {
          navigate('/handwerker/dashboard');
        }
      }
    };
    checkAuth();
  }, [navigate]);

  // Fetch live stats
  const { data: stats } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const [projects, contractors] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('contractors').select('id', { count: 'exact', head: true })
      ]);
      
      return {
        totalProjects: projects.count || 0,
        totalContractors: contractors.count || 0,
        avgRating: 4.9
      };
    }
  });

  const gewerke = [
    { name: 'Elektriker', icon: Zap, color: 'text-yellow-500' },
    { name: 'Sanitär', icon: Droplet, color: 'text-blue-500' },
    { name: 'Maler', icon: Paintbrush, color: 'text-purple-500' },
    { name: 'Bau', icon: Construction, color: 'text-orange-500' },
    { name: 'Tischler', icon: Hammer, color: 'text-amber-700' },
    { name: 'Heizung', icon: Flame, color: 'text-red-500' },
    { name: 'Garten', icon: Trees, color: 'text-green-500' },
    { name: 'Sonstige', icon: Wrench, color: 'text-muted-foreground' }
  ];

  const steps = [
    {
      number: 1,
      title: 'Projekt beschreiben',
      description: 'Beschreiben Sie Ihr Projekt und legen Sie Ihr Budget fest',
      icon: FolderOpen
    },
    {
      number: 2,
      title: 'Angebote erhalten',
      description: 'Qualifizierte Handwerker bewerben sich auf Ihr Projekt',
      icon: Users
    },
    {
      number: 3,
      title: 'Handwerker beauftragen',
      description: 'Vergleichen Sie Angebote und wählen Sie den besten',
      icon: CheckCircle
    }
  ];

  const testimonials = [
    {
      name: 'Maria K.',
      location: 'Wien',
      rating: 5,
      text: 'Innerhalb von 3 Stunden hatte ich 5 Angebote! Super schnell und unkompliziert.',
      avatar: '🧑‍💼'
    },
    {
      name: 'Peter M.',
      location: 'Graz',
      rating: 5,
      text: 'Die Handwerker waren alle verifiziert und professionell. Absolut empfehlenswert!',
      avatar: '👨‍🔧'
    },
    {
      name: 'Anna S.',
      location: 'Salzburg',
      rating: 5,
      text: 'Endlich eine Plattform die funktioniert. Projekt erstellt, Handwerker gefunden, fertig!',
      avatar: '👩‍💼'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Finden Sie den perfekten Handwerker
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Österreichs führende Plattform für Handwerker-Vermittlung. 
              Schnell, zuverlässig und transparent.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                onClick={() => navigate('/kunde/projekt-erstellen')}
                className="px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <Hammer className="mr-2 h-5 w-5" />
                Auftrag erstellen
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate('/register?role=contractor')}
                className="px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <Wrench className="mr-2 h-5 w-5" />
                Handwerker werden
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <span>Kostenlos für Auftraggeber</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <span>Verifizierte Handwerker</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <span>Schnelle Antworten</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="bg-card border-y py-8">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                <span className="text-3xl font-bold text-primary">
                  {stats?.avgRating || 4.9}
                </span>
              </div>
              <p className="text-muted-foreground">Durchschnittsbewertung</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-3xl font-bold text-primary mb-2">
                {stats?.totalProjects?.toLocaleString() || '2.400+'}
              </div>
              <p className="text-muted-foreground">Erfolgreiche Projekte</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-3xl font-bold text-primary mb-2">
                {stats?.totalContractors?.toLocaleString() || '800+'}
              </div>
              <p className="text-muted-foreground">Verifizierte Handwerker</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">So funktioniert's</h2>
            <p className="text-xl text-muted-foreground">
              In nur 3 einfachen Schritten zum perfekten Handwerker
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="p-8 text-center hover:shadow-lg transition-shadow h-full">
                  <div className="mb-6 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <step.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div className="text-5xl font-bold text-primary/20 mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gewerke Grid */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Alle Gewerke abgedeckt</h2>
            <p className="text-xl text-muted-foreground">
              Finden Sie Experten für jede Art von Projekt
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {gewerke.map((gewerk, index) => {
              const Icon = gewerk.icon;
              return (
                <motion.div
                  key={gewerk.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer"
                  onClick={() => navigate(`/handwerker/projekte?trade=${gewerk.name}`)}
                >
                  <Card className="p-6 text-center hover:shadow-lg transition-all bg-card">
                    <Icon className={`h-12 w-12 mx-auto mb-3 ${gewerk.color}`} />
                    <p className="font-semibold">{gewerk.name}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Was unsere Kunden sagen</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-4xl">{testimonial.avatar}</div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.text}"</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Starten Sie jetzt Ihr nächstes Projekt
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Kostenlos, unverbindlich und in nur 2 Minuten
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/kunde/projekt-erstellen')}
              className="bg-background text-primary hover:bg-background/90 px-8 py-6 text-lg shadow-xl"
            >
              Jetzt Auftrag erstellen
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
