import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Hammer,
  Star,
  Users,
  CheckCircle,
  Shield,
  Clock,
  ArrowRight,
  Menu,
  X,
  Sparkles,
  Search,
  Zap,
  Award,
  ThumbsUp,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalContractors: 0,
    averageRating: 0,
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer für Timeline
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: "0px 0px -100px 0px",
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
          totalContractors: contractorsCount || 156,
          averageRating: Number(avgRating.toFixed(1)),
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats({
          totalProjects: 3,
          totalContractors: 156,
          averageRating: 4.9,
        });
      }
    };
    fetchStats();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate("/projekt-erstellen", { state: { initialQuery: searchQuery } });
    } else {
      navigate("/projekt-erstellen");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const quickCategories = [
    { id: "elektriker", name: "Elektriker", emoji: "⚡", color: "bg-yellow-500" },
    { id: "sanitar", name: "Sanitär", emoji: "💧", color: "bg-blue-600" },
    { id: "maler", name: "Maler", emoji: "🎨", color: "bg-purple-500" },
    { id: "dachdecker", name: "Dachdecker", emoji: "🏠", color: "bg-orange-500" },
    { id: "fassade", name: "Fassade", emoji: "🏗️", color: "bg-green-500" },
    { id: "rohbau", name: "Rohbau", emoji: "🧱", color: "bg-red-500" },
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Geprüfte Handwerker",
      desc: "Alle Profis werden persönlich verifiziert",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: Clock,
      title: "Schnelle Angebote",
      desc: "Antworten innerhalb von 24 Stunden",
      gradient: "from-yellow-500 to-yellow-600",
    },
    {
      icon: CheckCircle,
      title: "100% Kostenlos",
      desc: "Keine versteckten Gebühren",
      gradient: "from-green-500 to-green-600",
    },
    {
      icon: Star,
      title: "Echte Bewertungen",
      desc: "Transparente Kundenmeinungen",
      gradient: "from-purple-500 to-purple-600",
    },
  ];

  const trustSignals = [
    { label: "Projekte vermittelt", value: "6.075+", icon: Hammer },
    { label: "Verifizierte Handwerker", value: "156+", icon: Users },
    { label: "Durchschnittsbewertung", value: "4.9★", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Minimalist Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100" : "bg-white"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate("/")}>
              <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:shadow-blue-600/40 transition-all">
                <Hammer className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <span className="text-lg md:text-xl font-bold">
                <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  BauConnect
                </span>
                <span className="text-yellow-500">24</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Button
                variant="ghost"
                onClick={() => navigate("/login")}
                className="text-gray-600 hover:text-blue-600 font-medium"
              >
                Anmelden
              </Button>
              <Button
                onClick={() => navigate("/register")}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg shadow-blue-600/30"
              >
                Als Handwerker registrieren
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
          <div className="md:hidden bg-white border-t border-gray-100 shadow-xl">
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  navigate("/login");
                  setMobileMenuOpen(false);
                }}
                className="w-full font-semibold"
              >
                Anmelden
              </Button>
              <Button
                onClick={() => {
                  navigate("/register");
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 font-semibold"
              >
                Als Handwerker registrieren
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - MyHammer Style */}
      <section className="pt-24 pb-12 md:pt-28 md:pb-16 lg:pt-32 lg:pb-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Headline */}
            <div className="text-center mb-8 md:mb-10">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-4 md:mb-5 leading-tight">
                <span className="text-gray-900">Der zuverlässige Weg,</span>
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  {" "}
                  einen Handwerker zu beauftragen
                </span>
              </h1>
            </div>

            {/* Main Search Box - Prominent wie MyHammer */}
            <div className="mb-8 md:mb-10">
              <Card className="p-6 md:p-8 shadow-2xl border-2 border-gray-100 bg-white">
                <div className="mb-4">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Beschreiben Sie Ihren Auftrag</h2>
                  <p className="text-sm text-gray-600">
                    z.B.: Malerarbeiten, Badezimmer renovieren, Elektroinstallation
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="z.B.: Malerarbeiten"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pl-12 h-14 text-base md:text-lg border-2 border-gray-200 focus:border-blue-600 rounded-xl"
                    />
                  </div>
                  <Button
                    size="lg"
                    onClick={handleSearch}
                    className="h-14 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-base md:text-lg shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all"
                  >
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Auftrag erstellen
                  </Button>
                </div>
              </Card>
            </div>

            {/* Quick Category Selection */}
            <div className="mb-8">
              <p className="text-sm md:text-base text-gray-600 mb-4 text-center font-medium">
                Oder wählen Sie direkt eine Kategorie:
              </p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
                {quickCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => navigate("/projekt-erstellen")}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border-2 border-gray-100 hover:border-blue-600 hover:shadow-lg transition-all group"
                  >
                    <div
                      className={`w-12 h-12 md:w-14 md:h-14 ${cat.color} rounded-xl flex items-center justify-center text-2xl md:text-3xl shadow-md group-hover:scale-110 transition-transform`}
                    >
                      {cat.emoji}
                    </div>
                    <span className="text-xs md:text-sm font-semibold text-gray-700 text-center">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Trust Signals - Mini Stats */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm text-gray-600">
              {trustSignals.map((signal, idx) => {
                const Icon = signal.icon;
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-gray-900">{signal.value}</span>
                    <span className="hidden sm:inline">{signal.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - DIREKT NACH HERO */}
      <section className="py-12 md:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3">
                <span className="text-gray-900">So einfach </span>
                <span className="text-blue-600">funktioniert's</span>
              </h2>
              <p className="text-base md:text-lg text-gray-600">In nur 3 Schritten zum perfekten Handwerker</p>
            </div>

            <div className="space-y-16 md:space-y-20">
              {[
                {
                  num: 1,
                  title: "Auftrag beschreiben",
                  desc: "Beschreiben Sie Ihr Projekt in wenigen Minuten mit unserem einfachen Formular",
                  image: "/bc-home1.png",
                },
                {
                  num: 2,
                  title: "Angebote vergleichen",
                  desc: "Erhalten Sie kostenlose Angebote von qualifizierten Handwerkern in Ihrer Nähe",
                  image: "/bc-home2.png",
                },
                {
                  num: 3,
                  title: "Handwerker beauftragen",
                  desc: "Wählen Sie den besten Handwerker basierend auf Bewertungen und Preis",
                  image: "/bc-home3.png",
                },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                    idx % 2 === 1 ? "lg:grid-flow-dense" : ""
                  }`}
                >
                  {/* Bild */}
                  <div className={`${idx % 2 === 1 ? "lg:col-start-2" : ""}`}>
                    <div className="relative max-w-lg mx-auto">
                      {/* Gradient Glow */}
                      <div className="absolute -inset-3 bg-gradient-to-r from-blue-600/20 to-yellow-500/20 rounded-3xl blur-2xl"></div>

                      {/* Bild Container */}
                      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                        <img src={step.image} alt={step.title} className="w-full h-auto" />
                      </div>
                    </div>
                  </div>

                  {/* Text */}
                  <div className={`text-center lg:text-left ${idx % 2 === 1 ? "lg:col-start-1" : ""}`}>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-6 shadow-2xl shadow-blue-600/30">
                      <span className="text-3xl font-extrabold text-white">{step.num}</span>
                    </div>

                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-4 text-gray-900">{step.title}</h3>
                    <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-md lg:max-w-none mx-auto">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* INNOVATIVE SCROLL-TIMELINE - Warum BauConnect24 */}
      <section className="py-12 md:py-20 lg:py-28 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-3 md:mb-4">
              <span className="text-gray-900">Warum </span>
              <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                BauConnect24
              </span>
              <span className="text-gray-900">?</span>
            </h2>
            <p className="text-sm md:text-base lg:text-xl text-gray-600">
              Die moderne Plattform für Ihre Handwerkerprojekte
            </p>
          </div>

          <div className="max-w-4xl lg:max-w-5xl mx-auto relative">
            {/* Gradient Timeline Line */}
            <div className="absolute left-4 md:left-6 lg:left-1/2 top-0 bottom-0 w-1 md:w-1.5 lg:w-2 bg-gradient-to-b from-blue-600 via-yellow-500 to-blue-600 rounded-full shadow-lg lg:shadow-xl opacity-40 lg:opacity-100"></div>

            {/* Timeline Items */}
            <div className="space-y-8 md:space-y-12 lg:space-y-16">
              {[
                {
                  icon: Shield,
                  title: "Verifizierte Profis",
                  desc: "Alle Handwerker werden persönlich geprüft und verifiziert.",
                  color: "blue",
                },
                {
                  icon: Clock,
                  title: "24h Antworten",
                  desc: "Schnelle Angebote von qualifizierten Profis in Ihrer Nähe.",
                  color: "yellow",
                },
                {
                  icon: CheckCircle,
                  title: "100% Kostenlos",
                  desc: "Keine versteckten Gebühren oder Abofallen für Auftraggeber.",
                  color: "blue",
                },
                {
                  icon: Star,
                  title: "Echte Bewertungen",
                  desc: "Transparente, verifizierte Kundenmeinungen und Ratings.",
                  color: "yellow",
                },
                {
                  icon: MessageSquare,
                  title: "Direkter Kontakt",
                  desc: "Kommunizieren Sie direkt mit Handwerkern ohne Umwege.",
                  color: "blue",
                },
                {
                  icon: TrendingUp,
                  title: "Faire Preise",
                  desc: "Vergleichen Sie Angebote für den besten Preis-Leistung.",
                  color: "yellow",
                },
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="timeline-item relative" data-index={index}>
                    <div
                      className={`grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-center transition-all duration-700 ease-out ${
                        index % 2 === 0 ? "" : "lg:grid-flow-dense"
                      } ${visibleItems.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                    >
                      {/* Animated Dot */}
                      <div className="absolute left-4 md:left-6 lg:left-1/2 transform lg:-translate-x-1/2 z-10">
                        <div
                          className={`w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 ${
                            feature.color === "blue" ? "bg-blue-600" : "bg-yellow-500"
                          } rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
                            visibleItems.includes(index) ? "scale-100 rotate-0" : "scale-0 rotate-180"
                          }`}
                        >
                          <Icon className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-white" />
                        </div>

                        {/* Pulse Effect */}
                        {visibleItems.includes(index) && (
                          <>
                            <div
                              className={`absolute inset-0 ${
                                feature.color === "blue" ? "bg-blue-600" : "bg-yellow-500"
                              } rounded-full animate-ping opacity-40`}
                            ></div>
                            <div
                              className={`absolute inset-0 ${
                                feature.color === "blue" ? "bg-blue-600" : "bg-yellow-500"
                              } rounded-full animate-ping opacity-20`}
                              style={{ animationDelay: "0.3s" }}
                            ></div>
                          </>
                        )}
                      </div>

                      {/* Content Card */}
                      <div
                        className={`${
                          index % 2 === 0 ? "lg:col-start-2 lg:pl-8" : "lg:col-start-1 lg:pr-8 lg:text-right"
                        } pl-16 md:pl-20 lg:pl-0 pr-4`}
                      >
                        <Card
                          className={`p-5 md:p-6 lg:p-8 border-2 transition-all duration-500 ${
                            visibleItems.includes(index)
                              ? feature.color === "blue"
                                ? "border-blue-600 shadow-xl shadow-blue-600/20 scale-100"
                                : "border-yellow-500 shadow-xl shadow-yellow-500/20 scale-100"
                              : "border-gray-100 scale-95"
                          } hover:shadow-2xl bg-white`}
                        >
                          <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 md:mb-3 text-gray-900">
                            {feature.title}
                          </h3>
                          <p className="text-sm md:text-base text-gray-600 leading-relaxed">{feature.desc}</p>
                        </Card>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits - Clean Cards */}
      <section className="py-12 md:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <Card
                    key={idx}
                    className="p-6 hover:shadow-xl transition-all border-2 border-gray-50 hover:border-blue-100"
                  >
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${benefit.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-sm text-gray-600">{benefit.desc}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Reviews Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                <span className="text-4xl md:text-5xl font-extrabold text-gray-900">4.9</span>
              </div>
              <p className="text-lg text-gray-600 mb-2">Hervorragend bewertet</p>
              <div className="flex items-center justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  text: "Schnelle Reaktion und professionelle Arbeit. Sehr zufrieden!",
                  author: "Michael S.",
                  rating: 5,
                },
                {
                  text: "Einfacher Prozess, faire Preise. Würde ich wieder nutzen.",
                  author: "Sarah K.",
                  rating: 5,
                },
                {
                  text: "Toller Service, kompetente Handwerker. Top!",
                  author: "Thomas M.",
                  rating: 5,
                },
              ].map((review, idx) => (
                <Card key={idx} className="p-6 border-2 border-gray-50">
                  <div className="flex gap-1 mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{review.text}"</p>
                  <p className="text-sm font-semibold text-gray-900">{review.author}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contractor CTA */}
      <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-yellow-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-yellow-500/30">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
              <span className="text-gray-900">Sind Sie Handwerker?</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Erhalten Sie täglich qualifizierte Aufträge und bauen Sie Ihr Geschäft aus. Kostenlose Registrierung in
              unter 5 Minuten.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/register")}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold text-lg px-10 py-6 shadow-2xl shadow-yellow-500/30 hover:shadow-yellow-500/40 transition-all"
            >
              <Zap className="mr-2 h-6 w-6" />
              Jetzt kostenlos registrieren
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-r from-blue-600 to-blue-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6">Bereit für Ihr Projekt?</h2>
          <p className="text-xl md:text-2xl mb-10 opacity-95 max-w-2xl mx-auto">
            Finden Sie jetzt den perfekten Handwerker für Ihr Vorhaben
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/projekt-erstellen")}
            className="bg-white text-blue-600 hover:bg-gray-100 font-bold text-lg px-10 py-6 shadow-2xl hover:scale-105 transition-all"
          >
            <Hammer className="mr-2 h-6 w-6" />
            Jetzt Auftrag erstellen
            <ArrowRight className="ml-2 h-6 w-6" />
          </Button>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Hammer className="h-5 w-5 text-white" />
              </div>
              <span className="text-base font-bold text-white">BauConnect24</span>
            </div>

            <div className="text-sm">© 2024 BauConnect24 - Alle Rechte vorbehalten</div>

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
