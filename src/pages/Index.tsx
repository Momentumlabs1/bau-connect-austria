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
      gradient: "from-yellow-400 to-orange-500",
    },
    {
      id: "sanitar",
      name: "Sanitär",
      icon: Droplet,
      description: "Heizung, Sanitär & Klima",
      gradient: "from-blue-400 to-cyan-500",
    },
    {
      id: "maler",
      name: "Maler",
      icon: Paintbrush,
      description: "Innen- & Außenarbeiten",
      gradient: "from-purple-400 to-pink-500",
    },
    {
      id: "dachdecker",
      name: "Dachdecker",
      icon: Construction,
      description: "Dächer & Dachfenster",
      gradient: "from-orange-400 to-red-500",
    },
    {
      id: "fassade",
      name: "Fassade",
      icon: Wrench,
      description: "Fassaden & Dämmung",
      gradient: "from-green-400 to-emerald-500",
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
      description: "Alle Handwerker werden von uns geprüft und verifiziert",
    },
    {
      icon: Clock,
      title: "Schnelle Reaktion",
      description: "Angebote innerhalb von 24 Stunden",
    },
    {
      icon: CheckCircle,
      title: "100% Kostenlos",
      description: "Keine versteckten Gebühren für Kunden",
    },
    {
      icon: Star,
      title: "Echte Bewertungen",
      description: "Transparente Kundenmeinungen",
    },
    {
      icon: MessageSquare,
      title: "Direkter Kontakt",
      description: "Kommunikation ohne Mittelsmann",
    },
    {
      icon: TrendingUp,
      title: "Faire Preise",
      description: "Mehrere Angebote vergleichen",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/80 backdrop-blur-lg shadow-lg" : "bg-transparent"
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
              <a href="#wie-funktionierts" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Wie funktioniert's
              </a>
              <a href="#gewerke" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Gewerke
              </a>
              <a href="#vorteile" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Vorteile
              </a>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/login")} className="font-medium">
                Anmelden
              </Button>
              <Button
                onClick={() => navigate("/register")}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium"
              >
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
              <a
                href="#wie-funktionierts"
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium py-2"
              >
                Wie funktioniert's
              </a>
              <a href="#gewerke" className="text-gray-600 hover:text-blue-600 transition-colors font-medium py-2">
                Gewerke
              </a>
              <a href="#vorteile" className="text-gray-600 hover:text-blue-600 transition-colors font-medium py-2">
                Vorteile
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => navigate("/login")} className="w-full">
                  Anmelden
                </Button>
                <Button
                  onClick={() => navigate("/register")}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700"
                >
                  Registrieren
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Ultra Modern */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-orange-50 opacity-60"></div>

        {/* Animated Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div
          className="absolute top-40 right-10 w-72 h-72 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-8 animate-fade-in">
              <span className="text-2xl">🇦🇹</span>
              <span className="text-sm font-semibold text-blue-700">Österreichs #1 Handwerker-Plattform</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent animate-gradient bg-300%">
                Handwerker finden.
              </span>
              <br />
              <span className="text-gray-900">Einfach gemacht.</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Verbinden Sie sich mit <span className="font-semibold text-gray-900">verifizierten Handwerkern</span> in
              Ihrer Nähe.
              <br />
              <span className="text-lg">Kostenlos · Transparent · Österreichweit</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                size="lg"
                onClick={() => navigate("/projekt-erstellen")}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-2xl shadow-blue-500/50 hover:shadow-blue-600/60 transition-all duration-300 text-lg px-10 py-7 group"
              >
                <Hammer className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                Projekt starten
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/register")}
                className="border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 text-gray-700 hover:text-blue-600 text-lg px-10 py-7 group transition-all duration-300"
              >
                <Wrench className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                Als Handwerker registrieren
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">100% Kostenlos</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Geprüfte Handwerker</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Schnelle Antworten</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Glassmorphism */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                <div className="text-center group">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Star className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="text-5xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
                    {stats.averageRating}
                  </div>
                  <div className="text-gray-600 font-medium">Durchschnittsbewertung</div>
                </div>

                <div className="text-center group">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Hammer className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {stats.totalProjects}
                  </div>
                  <div className="text-gray-600 font-medium">Aktive Projekte</div>
                </div>

                <div className="text-center group">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                    {stats.totalContractors}
                  </div>
                  <div className="text-gray-600 font-medium">Verifizierte Handwerker</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - With Images */}
      <section id="wie-funktionierts" className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <Badge className="mb-4 px-4 py-1 text-sm">So einfach geht's</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">In nur 3 Schritten zum Handwerker</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Finden Sie den perfekten Handwerker für Ihr Projekt – schnell und unkompliziert
            </p>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {steps.map((step, index) => (
                <div key={step.number} className="relative">
                  {/* Connecting Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/4 left-full w-full h-1 bg-gradient-to-r from-blue-300 to-transparent -translate-x-1/2 z-0"></div>
                  )}

                  <Card className="relative z-10 p-8 hover:shadow-2xl transition-all duration-300 group border-2 border-transparent hover:border-blue-200 bg-white">
                    {/* Number Badge */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {step.number}
                    </div>

                    {/* Image */}
                    <div className="mb-6 flex justify-center">
                      <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-blue-50 to-orange-50 p-6 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <img src={step.image} alt={step.title} className="w-full h-full object-contain" />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-3 text-gray-900">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gewerke Section - Modern Cards */}
      <section id="gewerke" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <Badge className="mb-4 px-4 py-1 text-sm">Unsere Gewerke</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Handwerker für jeden Bedarf</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Von Elektrik bis Fassade – finden Sie spezialisierte Profis für Ihr Projekt
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {gewerke.map((gewerk) => (
              <Card
                key={gewerk.id}
                className="group cursor-pointer overflow-hidden border-2 border-transparent hover:border-blue-200 transition-all duration-300 hover:shadow-2xl"
                onClick={() => navigate("/projekt-erstellen")}
              >
                <div className="p-6">
                  {/* Icon with Gradient */}
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${gewerk.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}
                  >
                    <gewerk.icon className="h-8 w-8 text-white" />
                  </div>

                  <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                    {gewerk.name}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{gewerk.description}</p>
                </div>

                {/* Hover Effect Bar */}
                <div
                  className={`h-1 w-full bg-gradient-to-r ${gewerk.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}
                ></div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="vorteile" className="py-24 bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <Badge className="mb-4 px-4 py-1 text-sm">Ihre Vorteile</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Warum BauConnect24?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Die moderne und sichere Plattform für Ihre Handwerkerprojekte
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-8 hover:shadow-2xl transition-all duration-300 group border-2 border-transparent hover:border-blue-200 bg-white/80 backdrop-blur-sm"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Bold */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-orange-600"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAgNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">Bereit für Ihr Projekt?</h2>
            <p className="text-xl md:text-2xl mb-12 opacity-90">
              Finden Sie jetzt den perfekten Handwerker und starten Sie noch heute
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/projekt-erstellen")}
                className="bg-white text-blue-600 hover:bg-gray-100 shadow-2xl hover:shadow-white/30 transition-all duration-300 text-lg px-10 py-7 group"
              >
                <Hammer className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                Jetzt Projekt erstellen
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
