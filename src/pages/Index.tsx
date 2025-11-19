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

  // Intersection Observer for Timeline
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
      shadowColor: "shadow-yellow-500/50",
      hoverBg: "hover:bg-yellow-50",
      hoverBorder: "hover:border-yellow-500",
    },
    {
      id: "sanitar",
      name: "Sanitär",
      emoji: "💧",
      description: "Heizung, Sanitär & Klima",
      bgColor: "bg-blue-500",
      shadowColor: "shadow-blue-500/50",
      hoverBg: "hover:bg-blue-50",
      hoverBorder: "hover:border-blue-500",
    },
    {
      id: "maler",
      name: "Maler",
      emoji: "🎨",
      description: "Innen- & Außenarbeiten",
      bgColor: "bg-purple-500",
      shadowColor: "shadow-purple-500/50",
      hoverBg: "hover:bg-purple-50",
      hoverBorder: "hover:border-purple-500",
    },
    {
      id: "dachdecker",
      name: "Dachdecker",
      emoji: "🏠",
      description: "Dächer & Dachfenster",
      bgColor: "bg-orange-500",
      shadowColor: "shadow-orange-500/50",
      hoverBg: "hover:bg-orange-50",
      hoverBorder: "hover:border-orange-500",
    },
    {
      id: "fassade",
      name: "Fassade",
      emoji: "🏗️",
      description: "Fassaden & Dämmung",
      bgColor: "bg-green-500",
      shadowColor: "shadow-green-500/50",
      hoverBg: "hover:bg-green-50",
      hoverBorder: "hover:border-green-500",
    },
    {
      id: "rohbau",
      name: "Rohbau",
      emoji: "🧱",
      description: "Maurer- & Betonarbeiten",
      bgColor: "bg-red-500",
      shadowColor: "shadow-red-500/50",
      hoverBg: "hover:bg-red-50",
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
      desc: "Alle Handwerker werden von uns persönlich geprüft und verifiziert. Nur qualifizierte Fachkräfte mit nachgewiesener Erfahrung erhalten Zugang zur Plattform.",
      color: "blue",
    },
    {
      icon: Clock,
      title: "Blitzschnelle Antworten",
      desc: "Erhalten Sie innerhalb von 24 Stunden konkrete Angebote von interessierten, qualifizierten Handwerkern für Ihr spezifisches Projekt.",
      color: "orange",
    },
    {
      icon: CheckCircle,
      title: "100% Kostenlos",
      desc: "Keine versteckten Gebühren, keine Abofallen, keine Überraschungen. Die Nutzung der Plattform ist für Kunden komplett kostenlos - garantiert.",
      color: "blue",
    },
    {
      icon: Star,
      title: "Echte Bewertungen",
      desc: "Transparente, authentische Kundenmeinungen helfen Ihnen bei der Auswahl des richtigen Handwerkers. Nur verifizierte Bewertungen werden angezeigt.",
      color: "orange",
    },
    {
      icon: MessageSquare,
      title: "Direkter Kontakt",
      desc: "Kommunizieren Sie direkt mit Handwerkern ohne Mittelsmann. Schneller, persönlicher Austausch für beste Ergebnisse garantiert.",
      color: "blue",
    },
    {
      icon: TrendingUp,
      title: "Faire Preise",
      desc: "Vergleichen Sie mehrere qualifizierte Angebote und finden Sie das beste Preis-Leistungs-Verhältnis für Ihr individuelles Projekt.",
      color: "orange",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate("/")}>
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Hammer className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-blue-600">Bau</span>
                <span className="text-gray-800">Connect</span>
                <span className="text-orange-500">24</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#wie-funktionierts" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Wie funktioniert's
              </a>
              <a href="#gewerke" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">
                Gewerke
              </a>
              <a href="#vorteile" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Vorteile
              </a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/login")} className="hover:text-blue-600 font-medium">
                Anmelden
              </Button>
              <Button
                onClick={() => navigate("/register")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
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
              >
                Wie funktioniert's
              </a>
              <a href="#gewerke" className="text-gray-600 py-2 font-medium hover:text-orange-600 transition-colors">
                Gewerke
              </a>
              <a href="#vorteile" className="text-gray-600 py-2 font-medium hover:text-blue-600 transition-colors">
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

      {/* Hero Section - BOLD & MODERN */}
      <section className="relative pt-32 pb-24 md:pt-44 md:pb-32 bg-gradient-to-br from-blue-50 via-white to-orange-50 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            <Badge className="mb-8 bg-gradient-to-r from-blue-600 to-orange-500 text-white hover:from-blue-700 hover:to-orange-600 border-0 px-6 py-2 text-base font-semibold shadow-lg animate-fade-in">
              🇦🇹 Österreichs #1 Handwerker-Plattform
            </Badge>

            {/* BOLD TYPOGRAPHY */}
            <h1 className="text-6xl md:text-8xl font-extrabold mb-8 leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                Handwerker finden.
              </span>
              <br />
              <span className="text-gray-900">Einfach gemacht.</span>
            </h1>

            <p className="text-2xl md:text-3xl text-gray-600 mb-12 max-w-4xl mx-auto font-medium leading-relaxed">
              Verbinden Sie sich mit <span className="font-bold text-blue-600">verifizierten Handwerkern</span> in Ihrer
              Nähe.
              <br />
              <span className="font-semibold text-gray-900">Kostenlos · Transparent · Österreichweit</span>
            </p>

            {/* CTAs with Micro-Animations */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button
                size="lg"
                onClick={() => navigate("/projekt-erstellen")}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xl px-12 py-8 shadow-2xl shadow-blue-600/40 hover:shadow-blue-700/60 hover:scale-105 transition-all duration-300 font-bold group"
              >
                <Hammer className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                Projekt starten
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/register")}
                className="border-3 border-orange-500 text-orange-600 hover:bg-orange-50 text-xl px-12 py-8 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold group"
              >
                <Wrench className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                Als Handwerker registrieren
              </Button>
            </div>

            {/* Trust Badges with Animations */}
            <div className="flex flex-wrap items-center justify-center gap-12 text-gray-700">
              <div className="flex items-center gap-3 group">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <span className="font-semibold text-lg">100% Kostenlos</span>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <span className="font-semibold text-lg">Geprüfte Handwerker</span>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <span className="font-semibold text-lg">Schnelle Antworten</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - BOLD NUMBERS */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="text-center group">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/40 group-hover:scale-110 transition-transform duration-300">
                    <Star className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div className="text-7xl font-extrabold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-3">
                  {stats.averageRating}
                </div>
                <div className="text-gray-600 font-semibold text-lg">Durchschnittsbewertung</div>
              </div>

              <div className="text-center group">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/40 group-hover:scale-110 transition-transform duration-300">
                    <Hammer className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div className="text-7xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-3">
                  {stats.totalProjects}
                </div>
                <div className="text-gray-600 font-semibold text-lg">Aktive Projekte</div>
              </div>

              <div className="text-center group">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/30 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div className="text-7xl font-extrabold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent mb-3">
                  {stats.totalContractors}+
                </div>
                <div className="text-gray-600 font-semibold text-lg">Verifizierte Handwerker</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - ALTERNATING WITH SHADOWS */}
      <section id="wie-funktionierts" className="py-32 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="text-gray-900">In nur</span>{" "}
              <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                3 Schritten
              </span>
              <br />
              <span className="text-gray-900">zum perfekten Handwerker</span>
            </h2>
          </div>

          <div className="max-w-7xl mx-auto space-y-32">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${
                  index % 2 === 1 ? "lg:grid-flow-dense" : ""
                }`}
              >
                <div className={`${index % 2 === 1 ? "lg:col-start-2" : ""}`}>
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-orange-500 rounded-3xl opacity-20 group-hover:opacity-30 blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-white rounded-3xl p-10 shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                      <img src={step.image} alt={step.title} className="w-full h-auto" />
                    </div>
                  </div>
                </div>

                <div className={`${index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}`}>
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-orange-500 rounded-2xl mb-8 shadow-xl">
                    <span className="text-4xl font-extrabold text-white">{step.number}</span>
                  </div>

                  <h3 className="text-5xl md:text-6xl font-extrabold mb-6 text-gray-900 leading-tight">{step.title}</h3>
                  <p className="text-2xl text-gray-600 leading-relaxed font-medium">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gewerke Section - 6 GEWERKE WITH EMOJIS & SHADOWS */}
      <section id="gewerke" className="py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="text-gray-900">Unsere</span>{" "}
              <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                Gewerke
              </span>
            </h2>
            <p className="text-2xl text-gray-600 font-medium">Spezialisierte Handwerker für jedes Projekt</p>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-8">
            {gewerke.map((gewerk) => (
              <Card
                key={gewerk.id}
                className={`p-8 cursor-pointer border-2 border-gray-100 ${gewerk.hoverBorder} ${gewerk.hoverBg} hover:shadow-2xl transition-all duration-300 group`}
                onClick={() => navigate("/projekt-erstellen")}
              >
                <div
                  className={`w-20 h-20 ${gewerk.bgColor} rounded-3xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl ${gewerk.shadowColor}`}
                >
                  <span className="text-5xl">{gewerk.emoji}</span>
                </div>

                <h3 className="text-2xl font-bold mb-3 text-gray-900 text-center">{gewerk.name}</h3>
                <p className="text-base text-gray-600 text-center leading-relaxed">{gewerk.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contractor Registration Section */}
      <section className="py-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 to-blue-600 rounded-3xl opacity-30 blur-2xl group-hover:opacity-40 transition-opacity"></div>
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80"
                    alt="Handwerker bei der Arbeit"
                    className="w-full h-auto"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-5xl md:text-6xl font-extrabold mb-8 leading-tight">
                  <span className="text-gray-900">Auf der Suche nach</span>{" "}
                  <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                    Aufträgen?
                  </span>
                </h2>
                <p className="text-3xl font-bold text-gray-900 mb-6">Vergrößern Sie Ihren Betrieb mit BauConnect24</p>
                <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                  BauConnect24 ist der zuverlässige Weg, mehr Wunschaufträge zu erhalten. Registrieren Sie sich
                  kostenlos, um täglich Benachrichtigungen mit potenziellen Aufträgen zu erhalten.
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate("/register")}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xl px-10 py-8 shadow-2xl shadow-orange-500/50 hover:scale-105 transition-all duration-300 font-bold group"
                >
                  <Sparkles className="mr-3 h-6 w-6" />
                  Kostenlose Registrierung für Handwerker
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Timeline - SCROLL-TRIGGERED WITH BETTER VISIBILITY */}
      <section id="vorteile" className="py-32 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="text-gray-900">Warum</span>{" "}
              <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                BauConnect24?
              </span>
            </h2>
            <p className="text-2xl text-gray-600 font-medium">Die moderne Plattform für Ihre Handwerkerprojekte</p>
          </div>

          {/* Vertical Timeline */}
          <div className="max-w-6xl mx-auto relative">
            {/* Thick Gradient Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-2 bg-gradient-to-b from-blue-600 via-orange-500 to-blue-600 shadow-lg"></div>

            {/* Timeline Items */}
            <div className="space-y-24">
              {timelineFeatures.map((feature, index) => (
                <div key={index} className="timeline-item relative" data-index={index}>
                  <div
                    className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center transition-all duration-700 ${
                      index % 2 === 0 ? "" : "md:grid-flow-dense"
                    } ${visibleItems.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`}
                  >
                    {/* Large Timeline Dot with Multiple Pulse Rings */}
                    <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2">
                      <div
                        className={`w-16 h-16 ${
                          feature.color === "blue" ? "bg-blue-600" : "bg-orange-500"
                        } rounded-full flex items-center justify-center shadow-2xl ${
                          feature.color === "blue" ? "shadow-blue-600/60" : "shadow-orange-500/60"
                        } relative z-10 transition-all duration-500 ${
                          visibleItems.includes(index) ? "scale-100" : "scale-0"
                        }`}
                      >
                        <feature.icon className="h-8 w-8 text-white" />
                      </div>

                      {/* Multiple Animated Pulse Rings */}
                      {visibleItems.includes(index) && (
                        <>
                          <div
                            className={`absolute inset-0 ${
                              feature.color === "blue" ? "bg-blue-600" : "bg-orange-500"
                            } rounded-full animate-ping opacity-40`}
                          ></div>
                          <div
                            className={`absolute inset-0 ${
                              feature.color === "blue" ? "bg-blue-600" : "bg-orange-500"
                            } rounded-full animate-ping opacity-20`}
                            style={{ animationDelay: "0.5s" }}
                          ></div>
                        </>
                      )}
                    </div>

                    {/* Content Card with Strong Border */}
                    <div
                      className={`${
                        index % 2 === 0 ? "md:col-start-2 md:pl-20" : "md:col-start-1 md:pr-20 md:text-right"
                      } pl-24 md:pl-0`}
                    >
                      <div className="relative group">
                        <div
                          className={`absolute -inset-2 bg-gradient-to-r ${
                            feature.color === "blue" ? "from-blue-600 to-blue-700" : "from-orange-500 to-orange-600"
                          } rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`}
                        ></div>

                        <Card
                          className={`relative p-10 border-4 ${
                            visibleItems.includes(index)
                              ? feature.color === "blue"
                                ? "border-blue-600 shadow-2xl shadow-blue-600/30"
                                : "border-orange-500 shadow-2xl shadow-orange-500/30"
                              : "border-gray-100"
                          } hover:shadow-3xl transition-all duration-500 group bg-white`}
                        >
                          <div
                            className={`w-16 h-16 ${
                              feature.color === "blue" ? "bg-blue-600" : "bg-orange-500"
                            } rounded-2xl flex items-center justify-center mb-8 ${
                              index % 2 === 0 ? "" : "md:ml-auto"
                            } group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl ${
                              feature.color === "blue" ? "shadow-blue-600/50" : "shadow-orange-500/50"
                            }`}
                          >
                            <feature.icon className="h-8 w-8 text-white" />
                          </div>

                          <h3 className="text-3xl font-bold mb-5 text-gray-900">{feature.title}</h3>
                          <p className="text-gray-600 leading-relaxed text-xl">{feature.desc}</p>
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - BOLD */}
      <section className="py-32 bg-gradient-to-r from-blue-600 via-blue-700 to-orange-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <Sparkles className="h-20 w-20 mx-auto mb-8 animate-pulse" />
          <h2 className="text-5xl md:text-7xl font-extrabold mb-8">Bereit für Ihr Projekt?</h2>
          <p className="text-2xl md:text-3xl mb-16 opacity-95 font-medium">Finden Sie jetzt den perfekten Handwerker</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/projekt-erstellen")}
              className="bg-white text-blue-600 hover:bg-gray-100 text-xl px-12 py-8 shadow-2xl hover:scale-105 transition-all duration-300 font-bold group"
            >
              <Hammer className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
              Jetzt Projekt erstellen
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              size="lg"
              onClick={() => navigate("/register")}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xl px-12 py-8 shadow-2xl hover:scale-105 transition-all duration-300 font-bold"
            >
              Als Handwerker registrieren
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Hammer className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">BauConnect24</span>
            </div>

            <div className="text-center">© 2024 BauConnect24. Alle Rechte vorbehalten.</div>

            <div className="flex gap-8 text-base">
              <a href="#" className="hover:text-white transition-colors font-medium">
                Impressum
              </a>
              <a href="#" className="hover:text-white transition-colors font-medium">
                Datenschutz
              </a>
              <a href="#" className="hover:text-white transition-colors font-medium">
                AGB
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Add CSS for fade-in animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Index;
