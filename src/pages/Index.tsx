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
  MessageSquare,
  TrendingUp,
  LogOut,
  User,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logoNew from "@/assets/bauconnect-logo-new.png";
import contractorHero from "@/assets/contractor-hero.png";
import { TopContractors } from "@/components/TopContractors";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/stores/authStore";
import { LoadingScreen } from "@/components/LoadingSpinner";
import { AnimatePresence, motion } from "framer-motion";
import { ContractorPromoBanner } from "@/components/ContractorPromoBanner";

const Index = () => {
  const navigate = useNavigate();
  const { user, role, signOut, initialized } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalContractors: 0,
    averageRating: 0,
  });


  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  // Preload hero image
  useEffect(() => {
    const img = new Image();
    img.src = contractorHero;
    img.onload = () => {
      setHeroImageLoaded(true);
    };
    img.onerror = () => {
      // Still show page even if image fails to load
      setHeroImageLoaded(true);
    };
    
    // Force loading screen to disappear after 1.5 seconds max
    const timeout = setTimeout(() => {
      setHeroImageLoaded(true);
    }, 1500);
    
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer für Timeline - memoized to prevent re-renders
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: "0px 0px -100px 0px",
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      const updates: { add: number[], remove: number[] } = { add: [], remove: [] };
      
      entries.forEach((entry) => {
        const index = parseInt(entry.target.getAttribute("data-index") || "0");
        
        if (entry.isIntersecting) {
          updates.add.push(index);
        } else {
          updates.remove.push(index);
        }
      });

      // Batch state updates
      if (updates.add.length > 0 || updates.remove.length > 0) {
        setVisibleItems((prev) => {
          let next = [...prev];
          
          // Remove items
          if (updates.remove.length > 0) {
            next = next.filter(i => !updates.remove.includes(i));
          }
          
          // Add new items
          updates.add.forEach(index => {
            if (!next.includes(index)) {
              next.push(index);
            }
          });
          
          return next.sort((a, b) => a - b);
        });
      }
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
          totalProjects: projectsCount || 0,
          totalContractors: contractorsCount || 0,
          averageRating: reviews && reviews.length > 0 ? Number(avgRating.toFixed(1)) : 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats({
          totalProjects: 0,
          totalContractors: 0,
          averageRating: 0,
        });
      }
    };
    fetchStats();
  }, []);

  // Live search for subcategories
  useEffect(() => {
    const searchSubcategories = async () => {
      if (searchQuery.trim().length < 1) {
        setSearchSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        console.log('🔍 Searching for:', searchQuery);
        const { data, error } = await supabase
          .from('service_categories')
          .select('*')
          .in('level', [1, 2])
          .ilike('name', `%${searchQuery}%`)
          .order('level', { ascending: true })
          .limit(5);

        console.log('📊 Search results:', data?.length || 0, 'items');
        console.log('📝 Results:', data);
        
        if (error) {
          console.error('❌ Search error:', error);
        }

        setSearchSuggestions(data || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Search error:', error);
      }
    };

    const debounce = setTimeout(searchSubcategories, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSearch = () => {
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      navigate("/kunde/projekt-erstellen", { state: { initialQuery: searchQuery } });
    } else {
      navigate("/kunde/projekt-erstellen");
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setShowSuggestions(false);
    if (suggestion.level === 1) {
      // Level 1 = Main category → only selectedGewerk
      navigate("/kunde/projekt-erstellen", { 
        state: { selectedGewerk: suggestion.id } 
      });
    } else {
      // Level 2 = Subcategory → both
      navigate("/kunde/projekt-erstellen", { 
        state: { 
          selectedGewerk: suggestion.parent_id,
          selectedSubcategoryId: suggestion.id 
        } 
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const quickCategories = [
    { id: "elektriker", name: "Elektriker", emoji: "⚡", color: "bg-yellow-500" },
    { id: "sanitar-heizung", name: "Sanitär", emoji: "💧", color: "bg-blue-600" },
    { id: "maler", name: "Maler", emoji: "🎨", color: "bg-purple-500" },
    { id: "dachdecker", name: "Dachdecker", emoji: "🏠", color: "bg-orange-500" },
    { id: "fassade", name: "Fassade", emoji: "🏗️", color: "bg-green-500" },
    { id: "bau", name: "Bau / Rohbau", emoji: "🧱", color: "bg-red-500" },
  ];

  // Trust signals now use real stats - only shown if data exists
  const hasRealStats = stats.totalProjects > 0 || stats.totalContractors > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Loading Screen - Show until hero image loads */}
      <AnimatePresence>
        {!heroImageLoaded && (
          <motion.div 
            className="fixed inset-0 z-[100]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <LoadingScreen />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - Fade in smoothly */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: heroImageLoaded ? 1 : 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
      {/* Minimalist Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100" : "bg-white"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20 md:h-22">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate("/")}>
              <img src={logoNew} alt="BauConnect24 Logo" className="h-12 md:h-14 lg:h-16 w-auto" />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate(role === 'customer' ? '/kunde/dashboard' : '/handwerker/dashboard')}
                    className="text-gray-600 hover:text-blue-600 font-medium"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-blue-600 font-medium"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Abmelden
                  </Button>
                </>
              ) : (
                <>
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
                    Registrieren
                  </Button>
                </>
              )}
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
              {user ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigate(role === 'customer' ? '/kunde/dashboard' : '/handwerker/dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full font-semibold"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full font-semibold"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Abmelden
                  </Button>
                </>
              ) : (
                <>
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
                    Registrieren
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Contractor Promo Banner - only for non-contractors */}
      {role !== 'contractor' && <div className="pt-20 md:pt-22"><ContractorPromoBanner /></div>}

      {/* Hero Section - MyHammer Style */}
      <section className={`${role !== 'contractor' ? 'pt-4' : 'pt-24'} pb-8 md:${role !== 'contractor' ? 'pt-6' : 'pt-28'} md:pb-10 lg:${role !== 'contractor' ? 'pt-8' : 'pt-32'} lg:pb-12 bg-gradient-to-b from-gray-50 to-white`}>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section with Background Image Overlay */}
            <div className="relative rounded-3xl overflow-hidden mb-0 h-[500px] md:h-[650px] lg:h-[750px] flex items-center bg-slate-900">
              {/* Background Image with Opacity */}
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 to-gray-900/50">
                <img 
                  src={contractorHero} 
                  alt="Professioneller Handwerker" 
                  className="w-full h-full object-cover opacity-50"
                  loading="eager"
                  decoding="async"
                />
              </div>

              {/* Content Overlay */}
              <div className="relative z-10 w-full px-3 md:px-12 py-8 md:py-16">
                <div className="max-w-4xl">
                  {/* Headline - 3 Zeilen, kein Glow */}
                  <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 md:mb-10 leading-tight">
                    <span className="text-white">Der einfachste Weg,</span><br />
                    <span className="text-blue-600">qualifizierte</span>{' '}
                    <span className="text-orange-600">Handwerker</span><br />
                    <span className="text-white">zu finden.</span>
                  </h1>

                  {/* Role-based content */}
                  {role === 'contractor' ? (
                    /* Contractor sees dashboard link */
                    <div className="max-w-xl bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 border-2 border-gray-100 text-center space-y-4">
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Willkommen zurück!</h2>
                      <p className="text-gray-600">
                        Schauen Sie sich Ihre verfügbaren Leads an
                      </p>
                      <Button
                        size="lg"
                        onClick={() => navigate('/handwerker/dashboard')}
                        className="h-14 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all"
                      >
                        <ArrowRight className="mr-2 h-5 w-5" />
                        Zu meinen Leads
                      </Button>
                    </div>
                  ) : (
                    /* Customer or unauthenticated user sees project creation */
                    <div className="max-w-xl bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 md:p-6 border-2 border-gray-100">
                      <div className="mb-3 md:mb-5">
                        <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">Beschreiben Sie Ihren Auftrag</h2>
                        <p className="text-xs md:text-base text-gray-600">
                          z.B.: Malerarbeiten, Badezimmer renovieren, Elektroinstallation
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400 z-10" />
                          <Input
                            type="text"
                            placeholder="z.B.: Malerarbeiten"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            onFocus={() => searchQuery.length >= 1 && setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            className="pl-10 md:pl-12 h-11 md:h-14 text-sm md:text-lg border-2 border-gray-200 focus:border-blue-600 rounded-xl"
                          />
                          
                          {/* Live Search Suggestions */}
                          {showSuggestions && searchSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                              <div className="p-2 bg-gray-50 border-b border-gray-200">
                                <p className="text-xs font-semibold text-muted-foreground uppercase">Passende Leistungen</p>
                              </div>
                              {searchSuggestions.map((suggestion) => {
                                const parentCategory = suggestion.level === 2 
                                  ? quickCategories.find(cat => cat.id === suggestion.parent_id)?.name 
                                  : suggestion.name;
                                
                                return (
                                  <button
                                    key={suggestion.id}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                                  >
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                      <span className="text-xl">🔨</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-sm text-gray-900">
                                        {parentCategory}{suggestion.level === 2 && ` / ${suggestion.name}`}
                                      </p>
                                      {suggestion.description && (
                                        <p className="text-xs text-muted-foreground truncate">{suggestion.description}</p>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <Button
                          size="lg"
                          onClick={handleSearch}
                          className="h-11 md:h-14 px-4 md:px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-sm md:text-lg shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all"
                        >
                          <ArrowRight className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5" />
                          Auftrag erstellen
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Category Selection - UNTER dem Hero-Bild */}
      {role !== 'contractor' && (
        <section className="py-8 md:py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <p className="text-sm md:text-base text-gray-600 mb-6 text-center font-medium">
                Oder wählen Sie direkt eine Kategorie:
              </p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 mb-10">
                {quickCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => navigate("/kunde/projekt-erstellen", { state: { selectedGewerk: cat.id } })}
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

              {/* Trust Signals - Only show if real data exists */}
              {hasRealStats && (
                <div className="flex flex-nowrap justify-center items-center gap-12 md:gap-20">
                  {stats.totalProjects > 0 && (
                    <div className="flex items-center gap-4">
                      <Hammer className="h-8 w-8 md:h-10 md:w-10 text-blue-600 flex-shrink-0" />
                      <div>
                        <div className="text-3xl md:text-4xl font-bold text-gray-900">{stats.totalProjects}</div>
                        <div className="text-sm md:text-base text-gray-600 whitespace-nowrap">Projekte</div>
                      </div>
                    </div>
                  )}
                  {stats.totalContractors > 0 && (
                    <div className="flex items-center gap-4">
                      <Users className="h-8 w-8 md:h-10 md:w-10 text-blue-600 flex-shrink-0" />
                      <div>
                        <div className="text-3xl md:text-4xl font-bold text-gray-900">{stats.totalContractors}</div>
                        <div className="text-sm md:text-base text-gray-600 whitespace-nowrap">Handwerker</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
                <div key={idx} className="flex flex-col items-center text-center gap-3 sm:gap-4">
                  {/* Bild oben */}
                  <div className="w-24 sm:w-32 md:w-40 lg:w-48">
                    <img src={step.image} alt={step.title} className="w-full h-auto" />
                  </div>

                  {/* Nummer Badge */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-lg sm:text-xl font-extrabold text-white">{step.num}</span>
                  </div>

                  {/* Titel */}
                  <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-gray-900">
                    {step.title}
                  </h3>

                  {/* Beschreibung */}
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Top Contractors Section */}
      <TopContractors />

      {/* INNOVATIVE SCROLL-TIMELINE - Warum BauConnect24 */}
      <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3">
              <span className="text-gray-900">Warum </span>
              <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                BauConnect24
              </span>
              <span className="text-gray-900">?</span>
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-gray-600">
              Die moderne Plattform für Ihre Handwerkerprojekte
            </p>
          </div>

          <div className="max-w-4xl mx-auto relative">
            {/* Gradient Timeline Line */}
            <div className="absolute left-4 md:left-6 lg:left-1/2 top-0 bottom-0 w-1 md:w-1.5 lg:w-2 bg-gradient-to-b from-blue-600 via-yellow-500 to-blue-600 rounded-full shadow-lg opacity-40 lg:opacity-100"></div>

            {/* Timeline Items */}
            <div className="space-y-6 md:space-y-10 lg:space-y-12">
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
                      className={`grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 lg:gap-8 items-center transition-all duration-700 ease-out ${
                        index % 2 === 0 ? "" : "lg:grid-flow-dense"
                      } ${visibleItems.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                    >
                      {/* Animated Dot */}
                      <div className="absolute left-4 md:left-6 lg:left-1/2 transform lg:-translate-x-1/2 z-10">
                        <div
                          className={`w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 ${
                            feature.color === "blue" ? "bg-blue-600" : "bg-yellow-500"
                          } rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
                            visibleItems.includes(index) ? "scale-100 rotate-0" : "scale-0 rotate-180"
                          }`}
                        >
                          <Icon className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-white" />
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
                          index % 2 === 0 ? "lg:col-start-2 lg:pl-6" : "lg:col-start-1 lg:pr-6 lg:text-right"
                        } pl-16 md:pl-20 lg:pl-0 pr-3`}
                      >
                        <Card
                          className={`p-5 md:p-6 border-2 transition-all duration-500 ${
                            visibleItems.includes(index)
                              ? feature.color === "blue"
                                ? "border-blue-600 shadow-xl shadow-blue-600/20 scale-100"
                                : "border-yellow-500 shadow-xl shadow-yellow-500/20 scale-100"
                              : "border-gray-100 scale-95"
                          } hover:shadow-2xl bg-white`}
                        >
                          <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
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

      {/* Contractor CTA - AUSGEBAUT mit mehr Infos */}
      <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-br from-yellow-50 via-white to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 lg:gap-16 items-center">
              {/* Bild */}
              <div className="relative order-2 lg:order-1">
                <div className="absolute -inset-3 bg-gradient-to-r from-yellow-400/20 to-blue-600/20 rounded-3xl blur-2xl"></div>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl max-w-lg mx-auto">
                  <img
                    src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80"
                    alt="Handwerker bei der Arbeit"
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full mb-6">
                  <Sparkles className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-bold text-yellow-700">Für Handwerker</span>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                  <span className="text-gray-900">Sind Sie </span>
                  <span className="text-yellow-600">Handwerker?</span>
                </h2>

                <p className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
                  Erweitern Sie Ihr Geschäft mit BauConnect24
                </p>

                <p className="text-base md:text-lg text-gray-600 mb-8 leading-relaxed">
                  Registrieren Sie sich kostenlos und erhalten Sie täglich qualifizierte Aufträge in Ihrer Region. Bauen
                  Sie Ihren Kundenstamm auf und steigern Sie Ihren Umsatz.
                </p>

                {/* Benefits für Handwerker */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {[
                    {
                      icon: Zap,
                      title: "Direkte Leads",
                      desc: "Qualifizierte Anfragen direkt auf Ihr Handy",
                    },
                    {
                      icon: Users,
                      title: "Mehr Kunden",
                      desc: "Erreichen Sie neue Auftraggeber",
                    },
                    {
                      icon: CheckCircle,
                      title: "100% Kostenlos",
                      desc: "Keine Gebühren für Registrierung",
                    },
                    {
                      icon: Clock,
                      title: "Flexibel",
                      desc: "Sie entscheiden, welche Aufträge",
                    },
                  ].map((benefit, idx) => {
                    const Icon = benefit.icon;
                    return (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">{benefit.title}</h4>
                          <p className="text-sm text-gray-600">{benefit.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    size="lg"
                    onClick={() => navigate("/register?role=contractor")}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold text-base md:text-lg px-8 py-6 shadow-2xl shadow-yellow-500/30 hover:shadow-yellow-500/40 transition-all group"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Kostenlos registrieren
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("/login")}
                    className="border-2 border-gray-300 hover:border-yellow-500 hover:bg-yellow-50 font-semibold text-base md:text-lg px-8 py-6"
                  >
                    Login
                  </Button>
                </div>
              </div>
            </div>
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
            onClick={() => navigate("/kunde/projekt-erstellen")}
            className="bg-white text-blue-600 hover:bg-gray-100 font-bold text-lg px-10 py-6 shadow-2xl hover:scale-105 transition-all"
          >
            <Hammer className="mr-2 h-6 w-6" />
            Jetzt Auftrag erstellen
            <ArrowRight className="ml-2 h-6 w-6" />
          </Button>
        </div>
      </section>

      <Footer />
      </motion.div> {/* End of heroImageLoaded wrapper */}
    </div>
  );
};

export default Index;
