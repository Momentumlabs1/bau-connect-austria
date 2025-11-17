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
  Sparkles,
  Target,
  Rocket,
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
      description: "Elektroinstallationen & Smart Home",
      color: "from-yellow-400 to-yellow-600",
      iconBg: "bg-yellow-500",
    },
    {
      id: "sanitar",
      name: "Sanitär",
      icon: Droplet,
      description: "Heizung, Sanitär & Klima",
      color: "from-cyan-400 to-blue-600",
      iconBg: "bg-cyan-500",
    },
    {
      id: "maler",
      name: "Maler",
      icon: Paintbrush,
      description: "Innen- & Außenarbeiten",
      color: "from-purple-400 to-purple-600",
      iconBg: "bg-purple-500",
    },
    {
      id: "dachdecker",
      name: "Dachdecker",
      icon: Construction,
      description: "Dächer & Dachfenster",
      color: "from-red-400 to-orange-600",
      iconBg: "bg-orange-500",
    },
    {
      id: "fassade",
      name: "Fassade",
      icon: Wrench,
      description: "Fassaden & Dämmung",
      color: "from-green-400 to-emerald-600",
      iconBg: "bg-green-500",
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
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-white"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-orange-500 rounded-xl flex items-center justify-center">
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
              <a href="#gewerke" className="text-gray-600 hover:text-orange-600 transition-colors">
                Gewerke
              </a>
              <a href="#vorteile" className="text-gray-600 hover:text-blue-600 transition-colors">
                Vorteile
              </a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/login")} className="hover:text-blue-600">
                Anmelden
              </Button>
              <Button
                onClick={() => navigate("/register")}
                className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white"
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
                <Button
                  onClick={() => navigate("/register")}
                  className="w-full bg-gradient-to-r from-blue-600 to-orange-500"
                >
                  Registrieren
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - WITH GRADIENT */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-orange-500 opacity-5"></div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto text-center">
            <Badge className="mb-6 bg-gradient-to-r from-blue-600 to-orange-500 text-white hover:from-blue-700 hover:to-orange-600 border-0">
              🇦🇹 Österreichs #1 Handwerker-Plattform
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                Handwerker finden.
              </span>
              <br />
              <span className="text-gray-900">Einfach gemacht.</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Verbinden Sie sich mit <span className="font-bold text-blue-600">verifizierten Handwerkern</span> in Ihrer
              Nähe.
              <br />
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                Kostenlos · Transparent · Österreichweit
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                onClick={() => navigate("/projekt-erstellen")}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg px-10 py-7 shadow-xl shadow-blue-500/30"
              >
                <Rocket className="mr-2 h-5 w-5" />
                Projekt starten
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                size="lg"
                onClick={() => navigate("/register")}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg px-10 py-7 shadow-xl shadow-orange-500/30"
              >
                <Hammer className="mr-2 h-5 w-5" />
                Als Handwerker registrieren
              </Button>
            </div>

            {/* Compact Stats Row */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">100% Kostenlos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Geprüfte Handwerker</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Schnelle Antworten</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - COMPACT WITH GRADIENT */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-orange-500">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center text-white">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-8 w-8" />
                </div>
                <div className="text-5xl font-bold mb-1">{stats.averageRating}</div>
                <div className="text-white/90 font-medium">Durchschnittsbewertung</div>
              </div>

              <div className="text-center text-white">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-8 w-8" />
                </div>
                <div className="text-5xl font-bold mb-1">{stats.totalProjects}</div>
                <div className="text-white/90 font-medium">Aktive Projekte</div>
              </div>

              <div className="text-center text-white">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-8 w-8" />
                </div>
                <div className="text-5xl font-bold mb-1">{stats.totalContractors}+</div>
                <div className="text-white/90 font-medium">Verifizierte Handwerker</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - INNOVATIVE DESIGN */}
      <section id="wie-funktionierts" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                In nur 3 einfachen Schritten
              </span>
              <br />
              <span className="text-gray-900">zum perfekten Handwerker</span>
            </h2>
          </div>

          <div className="max-w-6xl mx-auto space-y-24">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "lg:grid-flow-dense" : ""
                }`}
              >
                {/* Image */}
                <div className={`${index % 2 === 1 ? "lg:col-start-2" : ""} relative`}>
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-orange-500 rounded-3xl opacity-10 blur-xl"></div>
                  <div className="relative bg-gradient-to-br from-blue-50 to-orange-50 rounded-3xl p-8 shadow-2xl">
                    <img src={step.image} alt={step.title} className="w-full h-auto" />
                  </div>
                </div>

                {/* Content */}
                <div className={`${index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}`}>
                  {/* Modern Counter */}
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-orange-500 rounded-2xl mb-6 shadow-lg">
                    <span className="text-3xl font-bold text-white">{step.number}</span>
                  </div>

                  <h3 className="text-4xl font-bold mb-4 text-gray-900">{step.title}</h3>
                  <p className="text-xl text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gewerke Section - BETTER DESIGN WITH LOGICAL COLORS */}
      <section id="gewerke" className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="text-gray-900">Unsere</span>{" "}
              <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                Gewerke
              </span>
            </h2>
            <p className="text-xl text-gray-600">Spezialisierte Handwerker für jedes Projekt</p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {gewerke.map((gewerk) => (
              <div key={gewerk.id} className="group cursor-pointer" onClick={() => navigate("/projekt-erstellen")}>
                <div className="relative">
                  {/* Gradient Glow on Hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${gewerk.color} rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-300`}
                  ></div>

                  <Card className="relative p-6 bg-white border-2 border-gray-100 hover:border-transparent hover:shadow-2xl transition-all group-hover:scale-105">
                    <div
                      className={`w-16 h-16 ${gewerk.iconBg} rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg`}
                    >
                      <gewerk.icon className="h-8 w-8 text-white" />
                    </div>

                    <h3 className="text-lg font-bold mb-2 text-gray-900 text-center">{gewerk.name}</h3>
                    <p className="text-sm text-gray-600 text-center leading-relaxed">{gewerk.description}</p>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contractor Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 to-blue-600 rounded-3xl opacity-20 blur-2xl"></div>
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80"
                    alt="Handwerker bei der Arbeit"
                    className="w-full h-auto"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  <span className="text-gray-900">Auf der Suche nach</span>{" "}
                  <span className="bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
                    Aufträgen?
                  </span>
                </h2>
                <p className="text-2xl font-bold text-gray-900 mb-4">Vergrößern Sie Ihren Betrieb mit BauConnect24</p>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  BauConnect24 ist der zuverlässige Weg, mehr Wunschaufträge zu erhalten. Registrieren Sie sich
                  kostenlos, um täglich Benachrichtigungen mit potenziellen Aufträgen zu erhalten, die zu Ihren
                  Qualifikationen passen.
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate("/register")}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg px-8 py-6 shadow-xl shadow-orange-500/30"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Kostenlose Registrierung für Handwerker
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - EXCITING */}
      <section id="vorteile" className="py-24 bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="text-gray-900">Warum</span>{" "}
              <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                BauConnect24?
              </span>
            </h2>
            <p className="text-xl text-gray-600">Die moderne Plattform für Ihre Handwerkerprojekte</p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Verifizierte Profis",
                desc: "Alle Handwerker werden geprüft",
                gradient: "from-blue-600 to-blue-700",
              },
              {
                icon: Clock,
                title: "Schnelle Antworten",
                desc: "Angebote innerhalb 24h",
                gradient: "from-orange-500 to-orange-600",
              },
              {
                icon: CheckCircle,
                title: "100% Kostenlos",
                desc: "Keine versteckten Gebühren",
                gradient: "from-blue-600 to-orange-500",
              },
              {
                icon: Star,
                title: "Echte Bewertungen",
                desc: "Transparente Kundenmeinungen",
                gradient: "from-orange-500 to-blue-600",
              },
              {
                icon: MessageSquare,
                title: "Direkter Kontakt",
                desc: "Ohne Mittelsmann",
                gradient: "from-blue-600 to-blue-700",
              },
              {
                icon: TrendingUp,
                title: "Faire Preise",
                desc: "Angebote vergleichen",
                gradient: "from-orange-500 to-orange-600",
              },
            ].map((feature, index) => (
              <div key={index} className="group">
                <div className="relative">
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-300`}
                  ></div>

                  <Card className="relative p-8 bg-white/80 backdrop-blur-sm border-2 border-gray-100 hover:border-transparent hover:shadow-2xl transition-all group-hover:scale-105 h-full">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                    >
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600">{feature.desc}</p>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - EXCITING */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500"></div>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        ></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Sparkles className="h-16 w-16 mx-auto mb-6 animate-pulse" />
            <h2 className="text-5xl md:text-7xl font-bold mb-6">Bereit für Ihr Projekt?</h2>
            <p className="text-2xl md:text-3xl mb-12 opacity-90 font-light">
              Finden Sie jetzt den perfekten Handwerker
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/projekt-erstellen")}
                className="bg-white text-blue-600 hover:bg-gray-100 text-xl px-12 py-8 shadow-2xl"
              >
                <Rocket className="mr-2 h-6 w-6" />
                Jetzt Projekt erstellen
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>

              <Button
                size="lg"
                onClick={() => navigate("/register")}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xl px-12 py-8 shadow-2xl"
              >
                Als Handwerker registrieren
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
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
