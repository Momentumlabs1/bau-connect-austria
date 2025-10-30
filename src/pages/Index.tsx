import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { CheckCircle, Search, MessageSquare, Wrench } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-6 text-4xl font-bold md:text-6xl">
            Finden Sie den perfekten Handwerker
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Österreichs führende Plattform für Handwerker-Vermittlung. 
            Schnell, zuverlässig und transparent.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" onClick={() => navigate("/register")} className="w-full sm:w-auto">
              Auftrag erstellen
            </Button>
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={() => navigate("/register")}
              className="w-full sm:w-auto"
            >
              <Wrench className="mr-2 h-5 w-5" />
              Handwerker werden
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">So funktioniert's</h2>
            <p className="text-muted-foreground">In nur 3 einfachen Schritten zum perfekten Handwerker</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>1. Projekt beschreiben</CardTitle>
                <CardDescription>
                  Beschreiben Sie Ihr Projekt und legen Sie Ihr Budget fest
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>2. Angebote erhalten</CardTitle>
                <CardDescription>
                  Qualifizierte Handwerker bewerben sich auf Ihr Projekt
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>3. Handwerker beauftragen</CardTitle>
                <CardDescription>
                  Vergleichen Sie Angebote und wählen Sie den besten Handwerker
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Bereit anzufangen?</h2>
          <p className="mb-8 text-lg opacity-90">
            Erstellen Sie jetzt kostenlos Ihr erstes Projekt
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate("/register")}
          >
            Jetzt starten
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
