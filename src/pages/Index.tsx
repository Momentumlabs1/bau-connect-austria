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
  FolderOpen,
  Shield,
  Clock,
  TrendingUp,
  MessageSquare,
  Award,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalContractors: 0,
    averageRating: 0,
  });

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
      description: "Elektroinstallationen, Smart Home, Photovoltaik",
      color: "text-yellow-500",
    },
    {
      id: "sanitar",
      name: "Sanitär",
      icon: Droplet,
      description: "Heizung, Sanitär, Klima",
      color: "text-blue-500",
    },
    {
      id: "maler",
      name: "Maler",
      icon: Paintbrush,
      description: "Innen- und Außenarbeiten, Fassaden",
      color: "text-purple-500",
    },
    {
      id: "dachdecker",
      name: "Dachdecker",
      icon: Construction,
      description: "Dächer, Dachfenster, Reparaturen",
      color: "text-orange-500",
    },
    {
      id: "fassade",
      name: "Fassade",
      icon: Wrench,
      description: "Fassadenarbeiten, Wärmedämmung",
      color: "text-green-500",
    },
  ];

  const steps = [
    {
      number: 1,
      title: "Projekt beschreiben",
      description: "Beschreiben Sie Ihr Projekt und legen Sie Ihr Budget fest",
      icon: FolderOpen,
      image: "/bc-home1.png",
    },
    {
      number: 2,
      title: "Angebote erhalten",
      description: "Qualifizierte Handwerker bewerben sich auf Ihr Projekt",
      icon: Users,
      image: "/bc-home2.png",
    },
    {
      number: 3,
      title: "Handwerker beauftragen",
      description: "Vergleichen Sie Angebote und wählen Sie den besten",
      icon: CheckCircle,
      image: "/bc-home3.png",
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "Verifizierte Profis",
      description: "Alle Handwerker werden geprüft",
    },
    {
      icon: Clock,
      title: "Schnelle Antworten",
      description: "Angebote innerhalb 24h",
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAgNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100">
              🇦🇹 Österreichs #1 Handwerker-Plattform
            </Badge>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
              Handwerker finden.
              <br />
              Einfach gemacht.
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Verbinden Sie sich mit verifizierten Handwerkern in Ihrer Nähe.
              <br />
              <span className="font-semibold">Kostenlos. Transparent. Österreichweit.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                onClick={() => navigate("/projekt-erstellen")}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-6"
              >
                <Hammer className="mr-2 h-5 w-5" />
                Projekt starten
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/register")}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-lg px-8 py-6"
              >
                <Wrench className="mr-2 h-5 w-5" />
                Als Handwerker registrieren
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>100% Kostenlos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Verifizierte Profis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Schnelle Reaktion</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">{stats.averageRating}</div>
              <div className="text-gray-600">Durchschnittsbewertung</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <FolderOpen className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">{stats.totalProjects}</div>
              <div className="text-gray-600">Projekte</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">{stats.totalContractors}</div>
              <div className="text-gray-600">Handwerker</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why BauConnect24 */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Warum <span className="text-blue-600">Bau</span>
              <span className="text-gray-800">Connect</span>
              <span className="text-orange-500">24</span>?
            </h2>
            <p className="text-xl text-gray-600">Die moderne Art, Handwerker zu finden</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 cursor-pointer group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors duration-300">
                  <feature.icon className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">In nur 3 einfachen Schritten zum perfekten Handwerker</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="mb-6 flex justify-center">
                  {step.image ? (
                    <div className="w-32 h-32 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden p-4">
                      <img src={step.image} alt={step.title} className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <step.icon className="h-8 w-8 text-primary" />
                    </div>
                  )}
                </div>

                <div className="mb-4 flex justify-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center text-white font-bold text-xl">
                    {step.number}
                  </div>
                </div>

                <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gewerke Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Unsere Gewerke</h2>
            <p className="text-xl text-gray-600">Spezialisierte Handwerker für Ihre Projekte</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {gewerke.map((gewerk) => (
              <Card
                key={gewerk.id}
                className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-blue-600"
                onClick={() => navigate("/projekt-erstellen")}
              >
                <div
                  className={`w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <gewerk.icon className={`h-8 w-8 ${gewerk.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{gewerk.name}</h3>
                <p className="text-sm text-gray-600">{gewerk.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Bereit, Ihr Projekt zu starten?</h2>
          <p className="text-xl mb-8 opacity-90">Finden Sie jetzt den perfekten Handwerker für Ihr Vorhaben</p>
          <Button
            size="lg"
            onClick={() => navigate("/projekt-erstellen")}
            className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-6"
          >
            <Hammer className="mr-2 h-5 w-5" />
            Jetzt Projekt erstellen
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
