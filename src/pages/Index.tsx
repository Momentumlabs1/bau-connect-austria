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
      description: "Elektroinstallationen & Smart Home",
    },
    {
      id: "sanitar",
      name: "Sanitär",
      icon: Droplet,
      description: "Heizung, Sanitär & Klima",
    },
    {
      id: "maler",
      name: "Maler",
      icon: Paintbrush,
      description: "Innen- & Außenarbeiten",
    },
    {
      id: "dachdecker",
      name: "Dachdecker",
      icon: Construction,
      description: "Dächer & Dachfenster",
    },
    {
      id: "fassade",
      name: "Fassade",
      icon: Wrench,
      description: "Fassaden & Dämmung",
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

  const features = [
    {
      icon: Shield,
      title: "Verifizierte Profis",
      description: "Alle Handwerker werden von uns geprüft",
    },
    {
      icon: Clock,
      title: "Schnelle Antworten",
      description: "Angebote innerhalb von 24 Stunden",
    },
    {
      icon: CheckCircle,
      title: "100% Kostenlos",
      description: "Keine versteckten Gebühren",
    },
    {
      icon: Star,
      title: "Echte Bewertungen",
      description: "Transparente Kundenmeinungen",
    },
    {
      icon: MessageSquare,
      title: "Direkter Kontakt",
      description: "Ohne Mittelsmann",
    },
    {
      icon: TrendingUp,
      title: "Faire Preise",
      description: "Angebote vergleichen",
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
            {/* Logo */}
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

            {/* Desktop Menu */}
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

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/login")}>
                Anmelden
              </Button>
              <Button onClick={() => navigate("/register")} className="bg-blue-600 hover:bg-blue-700 text-white">
                Registrieren
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100">
              🇦🇹 Österreichs #1 Handwerker-Plattform
            </Badge>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-blue-600">Handwerker finden.</span>
              <br />
              <span className="text-gray-900">Einfach gemacht.</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Verbinden Sie sich mit verifizierten Handwerkern in Ihrer Nähe.
              <br />
              <span className="font-semibold text-gray-900">Kostenlos · Transparent · Österreichweit</span>
            </p>

            {/* CTA Buttons */}
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
                className="border-2 text-lg px-10 py-7"
              >
                <Wrench className="mr-2 h-5 w-5" />
                Als Handwerker registrieren
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span>100% Kostenlos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span>Geprüfte Handwerker</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span>Schnelle Antworten</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <Star className="h-10 w-10 text-orange-500" />
                </div>
                <div className="text-5xl font-bold text-blue-600 mb-2">{stats.averageRating}</div>
                <div className="text-gray-600">Durchschnittsbewertung</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <Hammer className="h-10 w-10 text-blue-600" />
                </div>
                <div className="text-5xl font-bold text-blue-600 mb-2">{stats.totalProjects}</div>
                <div className="text-gray-600">Aktive Projekte</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <Users className="h-10 w-10 text-blue-600" />
                </div>
                <div className="text-5xl font-bold text-blue-600 mb-2">{stats.totalContractors}</div>
                <div className="text-gray-600">Verifizierte Handwerker</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - ORIGINAL IMAGE SIZE */}
      <section id="wie-funktionierts" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              In nur 3 einfachen Schritten zum perfekten Handwerker
            </h2>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step) => (
                <div key={step.number} className="relative">
                  <Card className="p-8 bg-white border-2 border-gray-200 hover:border-blue-600 hover:shadow-lg transition-all">
                    {/* Number Badge */}
                    <div className="absolute -top-5 -left-5 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {step.number}
                    </div>

                    {/* Image - ORIGINAL SIZE */}
                    <div className="mb-6 bg-gray-50 rounded-lg p-6 flex items-center justify-center">
                      <img src={step.image} alt={step.title} className="max-w-full h-auto" />
                    </div>

                    <h3 className="text-2xl font-bold mb-3 text-gray-900">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gewerke Section - SIMPLE CARDS */}
      <section id="gewerke" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Unsere Gewerke</h2>
            <p className="text-xl text-gray-600">Spezialisierte Handwerker für Ihre Projekte</p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {gewerke.map((gewerk) => (
              <Card
                key={gewerk.id}
                className="p-6 cursor-pointer border-2 border-gray-200 hover:border-blue-600 hover:shadow-lg transition-all bg-white"
                onClick={() => navigate("/projekt-erstellen")}
              >
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <gewerk.icon className="h-7 w-7 text-white" />
                </div>

                <h3 className="text-lg font-bold mb-2 text-gray-900 text-center">{gewerk.name}</h3>
                <p className="text-sm text-gray-600 text-center">{gewerk.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - SIMPLE CARDS */}
      <section id="vorteile" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Warum BauConnect24?</h2>
            <p className="text-xl text-gray-600">Die moderne Plattform für Ihre Handwerkerprojekte</p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-8 bg-white border-2 border-gray-200 hover:border-blue-600 hover:shadow-lg transition-all"
              >
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
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
              variant="outline"
              onClick={() => navigate("/register")}
              className="border-2 border-white text-white hover:bg-white/10 text-lg px-10 py-7"
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
