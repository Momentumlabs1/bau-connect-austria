import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  Hammer,
  Zap,
  Droplet,
  Paintbrush,
  Construction,
  Wrench,
  ChevronRight,
  Star,
  CheckCircle2,
  Users,
  FolderOpen,
  Shield,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";

// Animated Counter Component
const AnimatedCounter = ({
  end,
  duration = 2000,
  decimals = 0,
  suffix = "",
}: {
  end: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(end * easeOutQuart);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, isInView]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
};

export default function Index() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();

  // Parallax effects
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Check auth and redirect
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profile?.role === "customer") {
          navigate("/kunde/dashboard");
        } else if (profile?.role === "contractor") {
          navigate("/handwerker/dashboard");
        }
      }
    };
    checkAuth();
  }, [navigate]);

  // Fetch live stats
  const { data: stats } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: async () => {
      const [projects, contractors] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("contractors").select("id", { count: "exact", head: true }),
      ]);

      return {
        totalProjects: projects.count || 0,
        totalContractors: contractors.count || 0,
        avgRating: 4.9,
      };
    },
  });

  // Fetch top contractors
  const { data: topContractors } = useQuery({
    queryKey: ["top-contractors"],
    queryFn: async () => {
      const { data } = await supabase
        .from("contractors")
        .select("id, company_name, rating, total_reviews, trades, profile_image_url, city")
        .eq("verified", true)
        .gt("rating", 0)
        .order("rating", { ascending: false })
        .limit(3);

      return data || [];
    },
  });

  const gewerke = [
    { id: "elektriker", name: "Elektriker", icon: Zap, color: "from-yellow-500 to-orange-500" },
    { id: "sanitar-heizung", name: "Sanitär", icon: Droplet, color: "from-blue-500 to-cyan-500" },
    { id: "maler", name: "Maler", icon: Paintbrush, color: "from-purple-500 to-pink-500" },
    { id: "dachdecker", name: "Dachdecker", icon: Construction, color: "from-orange-500 to-red-500" },
    { id: "fassade", name: "Fassade", icon: Hammer, color: "from-amber-600 to-yellow-600" },
  ];

  const features = [
    {
      icon: Shield,
      title: "Verifizierte Profis",
      description: "Alle Handwerker werden geprüft",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Clock,
      title: "Schnelle Antworten",
      description: "Angebote innerhalb 24h",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: CheckCircle2,
      title: "100% Kostenlos",
      description: "Keine versteckten Gebühren",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Star,
      title: "Echte Bewertungen",
      description: "Transparente Kundenmeinungen",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Users,
      title: "Direkter Kontakt",
      description: "Ohne Mittelsmann",
      color: "from-indigo-500 to-blue-500",
    },
    {
      icon: TrendingUp,
      title: "Faire Preise",
      description: "Angebote vergleichen",
      color: "from-red-500 to-rose-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <motion.div
            animate={{ x: [0, 100, 0], y: [0, -100, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"
          />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="container relative z-10 mx-auto px-4 text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-sm font-medium">Österreichs #1 Handwerker-Plattform</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient bg-300%">
              Handwerker finden.
            </span>
            <br />
            <span className="text-foreground">Einfach gemacht.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto"
          >
            Verbinden Sie sich mit verifizierten Handwerkern in Ihrer Nähe.
            <br />
            <span className="font-semibold text-foreground">Kostenlos. Transparent. Österreichweit.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button
              size="lg"
              onClick={() => navigate("/kunde/projekt-erstellen")}
              className="group px-8 py-7 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
            >
              <Hammer className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              Projekt starten
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/register?role=contractor")}
              className="group px-8 py-7 text-lg font-semibold rounded-2xl border-2 backdrop-blur-sm hover:bg-primary/5"
            >
              <Wrench className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              Als Handwerker registrieren
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-6 text-sm"
          >
            {["100% Kostenlos", "Verifizierte Profis", "Schnelle Reaktion"].map((text, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border"
              >
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="font-medium">{text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* STATS SECTION */}
      <section className="py-20 px-4 bg-card border-y">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
                <span className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  <AnimatedCounter end={stats?.avgRating || 4.9} decimals={1} />
                </span>
              </div>
              <p className="text-muted-foreground text-lg">Durchschnittsbewertung</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                <AnimatedCounter end={stats?.totalProjects || 0} />
              </div>
              <p className="text-muted-foreground text-lg">Projekte</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                <AnimatedCounter end={stats?.totalContractors || 0} />
              </div>
              <p className="text-muted-foreground text-lg">Handwerker</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Warum{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                BauConnect24
              </span>
              ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Die moderne Art, Handwerker zu finden</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                <Card className="relative h-full p-8 bg-card/50 backdrop-blur-sm border-2 hover:border-primary/50 transition-all overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity`}
                  />

                  <div className="relative mb-6">
                    <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>

                  <div className="absolute top-0 -left-full h-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:left-full transition-all duration-1000" />
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GEWERKE GRID */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Unsere Gewerke</h2>
            <p className="text-xl text-muted-foreground">Spezialisierte Handwerker für Ihre Projekte</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {gewerke.map((gewerk, i) => {
              const Icon = gewerk.icon;
              return (
                <motion.div
                  key={gewerk.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="cursor-pointer"
                  onClick={() => navigate(`/kunde/projekt-erstellen?gewerk=${gewerk.id}`)}
                >
                  <Card className="relative p-8 text-center bg-card/50 backdrop-blur-sm border-2 hover:border-primary/50 hover:shadow-2xl transition-all group overflow-hidden">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${gewerk.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                    />
                    <div className="relative">
                      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${gewerk.color} mb-4 shadow-lg`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg">{gewerk.name}</h3>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TOP CONTRACTORS */}
      {topContractors && topContractors.length > 0 && (
        <section className="py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold mb-4">Top-bewertete Handwerker</h2>
              <p className="text-xl text-muted-foreground">Unsere verifizierten Profis</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {topContractors.map((contractor, i) => (
                <motion.div
                  key={contractor.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  whileHover={{ y: -8 }}
                  onClick={() => navigate(`/handwerker/${contractor.id}`)}
                  className="cursor-pointer"
                >
                  <Card className="p-8 h-full hover:shadow-2xl transition-all bg-card/50 backdrop-blur-sm border-2 hover:border-primary/50">
                    <div className="flex flex-col items-center text-center">
                      {contractor.profile_image_url ? (
                        <img
                          src={contractor.profile_image_url}
                          alt={contractor.company_name}
                          className="w-24 h-24 rounded-full object-cover mb-4 ring-4 ring-primary/20"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 ring-4 ring-primary/20">
                          <Wrench className="h-12 w-12 text-white" />
                        </div>
                      )}
                      <h3 className="font-semibold text-xl mb-1">{contractor.company_name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{contractor.city}</p>
                      <div className="flex items-center gap-1 mb-4">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-lg">{contractor.rating?.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">({contractor.total_reviews})</span>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {contractor.trades?.slice(0, 2).map((trade: string) => (
                          <Badge key={trade} variant="secondary">
                            {gewerke.find((g) => g.id === trade)?.name || trade}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      <section className="py-24 px-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-5xl font-bold mb-6">Starten Sie jetzt Ihr Projekt</h2>
            <p className="text-2xl mb-10 opacity-90">Kostenlos, unverbindlich und in nur 2 Minuten</p>
            <Button
              size="lg"
              onClick={() => navigate("/kunde/projekt-erstellen")}
              className="group bg-background text-primary hover:bg-background/90 px-10 py-8 text-xl shadow-2xl rounded-2xl"
            >
              Jetzt Auftrag erstellen
              <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
