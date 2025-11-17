import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Hammer,
  Zap,
  Droplet,
  Paintbrush,
  Construction,
  Wrench,
  Star,
  Users,
  CheckCircle,
  Shield,
  Clock,
  TrendingUp,
  MessageSquare,
  Award,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      icon: Zap,
      emoji: "⚡",
      description: "Elektroinstallationen & Smart Home",
      bgColor: "bg-yellow-500",
      hoverBg: "hover:bg-yellow-50",
      hoverBorder: "hover:border-yellow-500",
    },
    {
      id: "sanitar",
      name: "Sanitär",
      icon: Droplet,
      emoji: "💧",
      description: "Heizung, Sanitär & Klima",
      bgColor: "bg-blue-500",
      hoverBg: "hover:bg-blue-50",
      hoverBorder: "hover:border-blue-500",
    },
    {
      id: "maler",
      name: "Maler",
      icon: Paintbrush,
      emoji: "🎨",
      description: "Innen- & Außenarbeiten",
      bgColor: "bg-purple-500",
      hoverBg: "hover:bg-purple-50",
      hoverBorder: "hover:border-purple-500",
    },
    {
      id: "dachdecker",
      name: "Dachdecker",
      icon: Construction,
      emoji: "🏠",
      description: "Dächer & Dachfenster",
      bgColor: "bg-orange-500",
      hoverBg: "hover:bg-orange-50",
      hoverBorder: "hover:border-orange-500",
    },
    {
      id: "fassade",
      name: "Fassade",
      icon: Wrench,
      emoji: "🏗️",
      description: "Fassaden & Dämmung",
      bgColor: "bg-green-500",
      hoverBg: "hover:bg-green-50",
      hoverBorder: "hover:border-green-500",
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

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar - SIMPLE */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white shadow-sm" : "bg-white"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Hammer className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-blue-600">Bau</span>
                <span className="text-gray-800">Connect</span>
                <span className="text-orange-500">24</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#wie-funktionierts" className="text-gray-600 hover:text-blue-600 transition-colors">
                Wie funktioniert's
              </a>
              <a href="#gewerke" className="text-gray-600 hover:text-blue-600 transition-colors">
                Gewerke
              </a>
              <a href="#vorteile" className="text-gray-600 hover:text-blue-600 transition-colors">
                Vorteile
              </a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/login")}>
                Anmelden
              </Button>
              <Button onClick={() => navigate("/register")} className="bg-blue-600 hover:bg-blue-700 text-white">
                Registrieren
              </Button>
            </div>

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <a href="#wie-funktionierts" className="text-gray-600 py-2">
                Wie funktioniert's
              </a>
              <a href="#gewerke" className="text-gray-600 py-2">
                Gewerke
              </a>
              <a href="#vorteile" className="text-gray-600 py-2">
                Vorteile
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => navigate("/login")} className="w-full">
                  Anmelden
                </Button>
                <Button onClick={() => navigate("/register")} className="w-full bg-blue-600">
                  Registrieren
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - CLEAN & SIMPLE */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <Badge className="mb-6 bg-blue-600 text-white hover:bg-blue-700">
              🇦🇹 Österreichs #1 Handwerker-Plattform
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-blue-600">Handwerker finden.</span>
              <br />
              <span className="text-gray-900">Einfach gemacht.</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Verbinden Sie sich mit verifizierten Handwerkern in Ihrer Nähe.
              <br />
              <span className="font-semibold text-gray-900">Kostenlos · Transparent · Österreichweit</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                size="lg"
                onClick={() => navigate("/projekt-erstellen")}
                className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-10 py-7"
              >
                <Hammer className="mr-2 h-5 w-5" />
                Projekt starten
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/register")}
                className="border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 text-lg px-10 py-7"
              >
                <Wrench className="mr-2 h-5 w-5" />
                Als Handwerker registrieren
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span>100% Kostenlos</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>Geprüfte Handwerker</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span>Schnelle Antworten</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - CLEAN WHITE */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Star className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="text-5xl font-bold text-gray-900 mb-2">{stats.averageRating}</div>
                <div className="text-gray-600">Durchschnittsbewertung</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Hammer className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-5xl font-bold text-gray-900 mb-2">{stats.totalProjects}</div>
                <div className="text-gray-600">Aktive Projekte</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-5xl font-bold text-gray-900 mb-2">{stats.totalContractors}+</div>
                <div className="text-gray-600">Verifizierte Handwerker</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - ALTERNATING LAYOUT */}
      <section id="wie-funktionierts" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 text-gray-900">
              In nur 3 einfachen Schritten
              <br />
              zum perfekten Handwerker
            </h2>
          </div>

          <div className="max-w-6xl mx-auto space-y-20">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "lg:grid-flow-dense" : ""
                }`}
              >
                {/* Image */}
                <div className={`${index % 2 === 1 ? "lg:col-start-2" : ""}`}>
                  <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <img src={step.image} alt={step.title} className="w-full h-auto" />
                  </div>
                </div>

                {/* Content */}
                <div className={`${index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}`}>
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-xl mb-6">
                    <span className="text-2xl font-bold text-white">{step.number}</span>
                  </div>

                  <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">{step.title}</h3>
                  <p className="text-lg md:text-xl text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gewerke Section - ALL BLUE ICONS */}
      <section id="gewerke" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 text-gray-900">Unsere Gewerke</h2>
            <p className="text-xl text-gray-600">Spezialisierte Handwerker für Ihre Projekte</p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {gewerke.map((gewerk) => (
              <Card
                key={gewerk.id}
                className={`p-6 cursor-pointer border-2 border-gray-100 ${gewerk.hoverBorder} ${gewerk.hoverBg} hover:shadow-xl transition-all group`}
                onClick={() => navigate("/projekt-erstellen")}
              >
                <div
                  className={`w-16 h-16 ${gewerk.bgColor} rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform shadow-lg`}
                >
                  <span className="text-3xl">{gewerk.emoji}</span>
                </div>

                <h3 className="text-lg font-bold mb-2 text-gray-900 text-center">{gewerk.name}</h3>
                <p className="text-sm text-gray-600 text-center leading-relaxed">{gewerk.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contractor Registration Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80"
                  alt="Handwerker bei der Arbeit"
                  className="w-full h-auto"
                />
              </div>

              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Auf der Suche nach Aufträgen?</h2>
                <p className="text-xl font-semibold text-gray-900 mb-4">
                  Vergrößern Sie Ihren Betrieb mit BauConnect24
                </p>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  BauConnect24 ist der zuverlässige Weg, mehr Wunschaufträge zu erhalten. Registrieren Sie sich
                  kostenlos, um täglich Benachrichtigungen mit potenziellen Aufträgen zu erhalten.
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate("/register")}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-6"
                >
                  Kostenlose Registrierung für Handwerker
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - ALL BLUE ICONS */}
      <section id="vorteile" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 text-gray-900">Warum BauConnect24?</h2>
            <p className="text-xl text-gray-600">Die moderne Plattform für Ihre Handwerkerprojekte</p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Verifizierte Profis", desc: "Alle Handwerker werden geprüft" },
              { icon: Clock, title: "Schnelle Antworten", desc: "Angebote innerhalb 24h" },
              { icon: CheckCircle, title: "100% Kostenlos", desc: "Keine versteckten Gebühren" },
              { icon: Star, title: "Echte Bewertungen", desc: "Transparente Kundenmeinungen" },
              { icon: MessageSquare, title: "Direkter Kontakt", desc: "Ohne Mittelsmann" },
              { icon: TrendingUp, title: "Faire Preise", desc: "Angebote vergleichen" },
            ].map((feature, index) => (
              <Card
                key={index}
                className="p-8 border-2 border-gray-100 hover:border-blue-600 hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - SIMPLE BLUE */}
      <section className="py-24 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Bereit für Ihr Projekt?</h2>
          <p className="text-xl md:text-2xl mb-12 opacity-90">Finden Sie jetzt den perfekten Handwerker</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/projekt-erstellen")}
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-10 py-7"
            >
              <Hammer className="mr-2 h-5 w-5" />
              Jetzt Projekt erstellen
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button
              size="lg"
              onClick={() => navigate("/register")}
              className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-10 py-7"
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
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Hammer className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">BauConnect24</span>
            </div>

            <div className="text-sm text-center">© 2024 BauConnect24. Alle Rechte vorbehalten.</div>

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
