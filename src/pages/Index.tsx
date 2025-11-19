import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Hammer,
  Star,
  Users,
  CheckCircle,
  Shield,
  Clock,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalContractors: 0,
    averageRating: 0,
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.3,
      rootMargin: "0px 0px -50px 0px",
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const index = parseInt(entry.target.getAttribute("data-index") || "0");

        if (entry.isIntersecting) {
          setVisibleItems((prev) => {
            if (!prev.includes(index)) {
              return [...prev, index].sort((a, b) => a - b);
            }
            return prev;
          });
        } else {
          setVisibleItems((prev) => prev.filter((i) => i !== index));
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const timelineItems = document.querySelectorAll(".timeline-item");
    timelineItems.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: projectsCount } = await supabase.from("projects").select("*", { count: "exact", head: true });
        const { count: contractorsCount } = await supabase
          .from("contractors")
          .select("*", { count: "exact", head: true });
        const { data: reviews } = await supabase.from("reviews").select("rating");

        const avgRating =
          reviews && reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 4.9;

        setStats({
          totalProjects: projectsCount || 3,
          totalContractors: contractorsCount || 0,
          averageRating: Number(avgRating.toFixed(1)),
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats({
          totalProjects: 3,
          totalContractors: 0,
          averageRating: 4.9,
        });
      }
    };

    fetchStats();
  }, []);

  const gewerke = [
    {
      id: "elektriker",
      name: "Elektriker",
      emoji: "⚡",
      description: "Elektroinstallationen & Smart Home",
      bgColor: "bg-yellow-500",
      hoverBorder: "hover:border-yellow-500",
    },
    {
      id: "sanitar",
      name: "Sanitär",
      emoji: "💧",
      description: "Heizung, Sanitär & Klima",
      bgColor: "bg-blue-600",
      hoverBorder: "hover:border-blue-600",
    },
    {
      id: "maler",
      name: "Maler",
      emoji: "🎨",
      description: "Innen- & Außenarbeiten",
      bgColor: "bg-purple-500",
      hoverBorder: "hover:border-purple-500",
    },
    {
      id: "dachdecker",
      name: "Dachdecker",
      emoji: "🏠",
      description: "Dächer & Dachfenster",
      bgColor: "bg-yellow-600",
      hoverBorder: "hover:border-yellow-600",
    },
    {
      id: "fassade",
      name: "Fassade",
      emoji: "🏗️",
      description: "Fassaden & Dämmung",
      bgColor: "bg-green-500",
      hoverBorder: "hover:border-green-500",
    },
    {
      id: "rohbau",
      name: "Rohbau",
      emoji: "🧱",
      description: "Maurer- & Betonarbeiten",
      bgColor: "bg-red-500",
      hoverBorder: "hover:border-red-500",
    },
  ];

  const steps = [
    {
      number: 1,
      title: "Projekt beschreiben",
      description: "Beschreiben Sie Ihr Projekt in wenigen Minuten",
      image: "/bc-home1.png",
    },
    {
      number: 2,
      title: "Angebote erhalten",
      description: "Qualifizierte Handwerker bewerben sich auf Ihr Projekt",
      image: "/bc-home2.png",
    },
    {
      number: 3,
      title: "Handwerker beauftragen",
      description: "Vergleichen Sie Angebote und wählen Sie den Besten",
      image: "/bc-home3.png",
    },
  ];

  const timelineFeatures = [
    {
      icon: Shield,
      title: "Verifizierte Profis",
      desc: "Alle Handwerker werden persönlich geprüft und verifiziert.",
    },
    {
      icon: Clock,
      title: "Blitzschnelle Antworten",
      desc: "Erhalten Sie innerhalb von 24 Stunden konkrete Angebote.",
    },
    {
      icon: CheckCircle,
      title: "100% Kostenlos",
      desc: "Keine versteckten Gebühren, keine Abofallen.",
    },
    {
      icon: Star,
      title: "Echte Bewertungen",
      desc: "Transparente Kundenmeinungen helfen bei der Auswahl.",
    },
    {
      icon: MessageSquare,
      title: "Direkter Kontakt",
      desc: "Kommunizieren Sie direkt mit Handwerkern.",
    },
    {
      icon: TrendingUp,
      title: "Faire Preise",
      desc: "Vergleichen Sie Angebote und finden Sie das beste Preis-Leistungs-Verhältnis.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar - BLAU-GELB */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate("/")}>
              <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Hammer className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <span className="text-lg md:text-xl font-bold">
                <span className="text-blue-600">Bau</span>
                <span className="text-gray-800">Connect</span>
                <span className="text-yellow-500">24</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <a href="#wie-funktionierts" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Wie funktioniert's
              </a>
              <a href="#gewerke" className="text-gray-600 hover:text-yellow-600 transition-colors font-medium">
                Gewerke
              </a>
              <a href="#vorteile" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Vorteile
              </a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate("/login")} className="hover:text-blue-600 font-medium">
                Anmelden
              </Button>
              <Button
                onClick={() => navigate("/register")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Registrieren
              </Button>
            </div>

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-xl">
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              <a
                href="#wie-funktionierts"
                className="text-gray-600 py-2 font-medium hover:text-blue-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Wie funktioniert's
              </a>
              <a
                href="#gewerke"
                className="text-gray-600 py-2 font-medium hover:text-yellow-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Gewerke
              </a>
              <a
                href="#vorteile"
                className="text-gray-600 py-2 font-medium hover:text-blue-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Vorteile
              </a>
              <div className="flex flex-col gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => navigate("/login")} className="w-full font-semibold">
                  Anmelden
                </Button>
                <Button onClick={() => navigate("/register")} className="w-full bg-blue-600 font-semibold">
                  Registrieren
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - BLAU-GELB Theme */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 bg-gradient-to-br from-blue-50 via-white to-yellow-50 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 md:mb-6 leading-[1.1] tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 to-yellow-500 bg-clip-text text-transparent">
                Handwerker finden.
              </span>
              <br />
              <span className="text-gray-900">Einfach gemacht.</span>
            </h1>

            <p className="text-base md:text-lg text-gray-600 mb-8 md:mb-10 max-w-2xl mx-auto">
              Verbinden Sie sich mit <span className="font-semibold text-blue-600">verifizierten Handwerkern</span> in
              Ihrer Nähe
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 md:mb-10">
              <Button
                size="lg"
                onClick={() => navigate("/projekt-erstellen")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all group"
              >
                <Hammer className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                Projekt starten
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/register")}
                className="border-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50 font-bold text-lg px-8 py-6 hover:scale-105 transition-all"
              >
                Als Handwerker registrieren
              </Button>
            </div>

            {/* Trust Elements - VIEL KLEINER & MINIMALISTISCH */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-gray-600 text-sm">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span>100% Kostenlos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-blue-600" />
                <span>Geprüfte Handwerker</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>24h Antwortzeit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - BLAU-GELB */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl mb-4 shadow-lg">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <div className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-2">{stats.averageRating}</div>
                <div className="text-gray-600 font-medium">Durchschnittsbewertung</div>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-4 shadow-lg">
                  <Hammer className="h-8 w-8 text-white" />
                </div>
                <div className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-2">{stats.totalProjects}</div>
                <div className="text-gray-600 font-medium">Aktive Projekte</div>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-yellow-500 rounded-2xl mb-4 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-2">{stats.totalContractors}+</div>
                <div className="text-gray-600 font-medium">Verifizierte Handwerker</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - CLEANE BILDDARSTELLUNG */}
      <section id="wie-funktionierts" className="py-20 md:py-28 bg-gradient-to-br from-blue-50 to-yellow-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4">
              <span className="text-gray-900">In nur </span>
              <span className="text-blue-600">3 Schritten</span>
            </h2>
            <p className="text-xl text-gray-600">zum perfekten Handwerker</p>
          </div>

          <div className="max-w-6xl mx-auto space-y-20">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "lg:grid-flow-dense" : ""
                }`}
              >
                {/* Clean Image Display */}
                <div className={`${index % 2 === 1 ? "lg:col-start-2" : ""}`}>
                  <div className="relative">
                    {/* Subtle glow effect */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-yellow-500/20 rounded-3xl blur-2xl"></div>

                    {/* Image container - minimal, clean */}
                    <div className="relative bg-white rounded-2xl p-8 shadow-xl">
                      <img src={step.image} alt={step.title} className="w-full h-auto rounded-lg" />
                    </div>
                  </div>
                </div>

                <div className={`${index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}`}>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-yellow-500 rounded-2xl mb-6 shadow-lg">
                    <span className="text-3xl font-extrabold text-white">{step.number}</span>
                  </div>

                  <h3 className="text-3xl md:text-4xl font-extrabold mb-4 text-gray-900">{step.title}</h3>
                  <p className="text-xl text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gewerke Section */}
      <section id="gewerke" className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4">
              <span className="text-gray-900">Unsere </span>
              <span className="text-blue-600">Gewerke</span>
            </h2>
            <p className="text-xl text-gray-600">Spezialisierte Handwerker für jedes Projekt</p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-6">
            {gewerke.map((gewerk) => (
              <Card
                key={gewerk.id}
                className={`p-6 cursor-pointer border-2 border-gray-100 ${gewerk.hoverBorder} hover:shadow-xl transition-all group`}
                onClick={() => navigate("/projekt-erstellen")}
              >
                <div
                  className={`w-16 h-16 ${gewerk.bgColor} rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform shadow-lg`}
                >
                  <span className="text-4xl">{gewerk.emoji}</span>
                </div>

                <h3 className="text-xl font-bold mb-2 text-gray-900 text-center">{gewerk.name}</h3>
                <p className="text-sm text-gray-600 text-center">{gewerk.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contractor Registration - BLAU-GELB */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-yellow-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative order-2 lg:order-1">
                <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/30 to-blue-600/30 rounded-3xl blur-2xl"></div>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80"
                    alt="Handwerker bei der Arbeit"
                    className="w-full h-auto"
                  />
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                  <span className="text-gray-900">Auf der Suche nach </span>
                  <span className="text-yellow-600">Aufträgen?</span>
                </h2>
                <p className="text-2xl font-bold text-gray-900 mb-4">Vergrößern Sie Ihren Betrieb mit BauConnect24</p>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Registrieren Sie sich kostenlos und erhalten Sie täglich Benachrichtigungen mit potenziellen
                  Aufträgen.
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate("/register")}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold text-lg px-8 py-6 shadow-xl hover:scale-105 transition-all group"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Kostenlos registrieren
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - KOMPAKTER */}
      <section id="vorteile" className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4">
              <span className="text-gray-900">Warum </span>
              <span className="text-blue-600">BauConnect24?</span>
            </h2>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {timelineFeatures.map((feature, index) => (
              <Card
                key={index}
                className="p-6 border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - BLAU-GELB */}
      <section className="py-20 md:py-28 bg-gradient-to-r from-blue-600 to-yellow-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <Sparkles className="h-16 w-16 mx-auto mb-6 animate-pulse" />
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">Bereit für Ihr Projekt?</h2>
          <p className="text-xl md:text-2xl mb-12 opacity-95">Finden Sie jetzt den perfekten Handwerker</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/projekt-erstellen")}
              className="bg-white text-blue-600 hover:bg-gray-100 font-bold text-lg px-10 py-6 shadow-2xl hover:scale-105 transition-all group"
            >
              <Hammer className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              Jetzt Projekt erstellen
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              size="lg"
              onClick={() => navigate("/register")}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-lg px-10 py-6 shadow-2xl hover:scale-105 transition-all"
            >
              Als Handwerker registrieren
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-yellow-500 rounded-lg flex items-center justify-center">
                <Hammer className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">BauConnect24</span>
            </div>

            <div className="text-center text-sm">© 2024 BauConnect24. Alle Rechte vorbehalten.</div>

            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">
                Impressum
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Datenschutz
              </a>
              <a href="#" className="hover:text-white transition-colors">
                AGB
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
