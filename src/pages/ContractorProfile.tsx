import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { ImageUpload } from "@/components/ImageUpload";

const profileSchema = z.object({
  company_name: z.string().min(2, "Firmenname ist erforderlich"),
  description: z.string().min(100, "Beschreibung muss mindestens 100 Zeichen lang sein"),
  city: z.string().min(2, "Stadt ist erforderlich"),
  address: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const availableTrades = [
  "Elektriker",
  "Sanitär",
  "Maler",
  "Bau",
  "Sonstige"
];

export default function ContractorProfile() {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [selectedTrades, setSelectedTrades] = useState<string[]>([]);
  const [postalCodes, setPostalCodes] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string[]>([]);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        // Check if profile already exists
        supabase
          .from("contractors")
          .select("*")
          .eq("id", data.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              toast({
                title: "Profil bereits vorhanden",
                description: "Sie werden zum Dashboard weitergeleitet",
              });
              navigate("/handwerker/dashboard");
            }
          });
      }
    });
  }, [navigate, toast]);

  const handleTradeChange = (trade: string, checked: boolean) => {
    if (checked) {
      setSelectedTrades([...selectedTrades, trade]);
    } else {
      setSelectedTrades(selectedTrades.filter(t => t !== trade));
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    if (selectedTrades.length === 0) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie mindestens ein Gewerk",
        variant: "destructive",
      });
      return;
    }

    const postalCodeArray = postalCodes
      .split(",")
      .map(pc => pc.trim())
      .filter(pc => /^\d{4}$/.test(pc));

    if (postalCodeArray.length === 0) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie mindestens eine gültige PLZ ein (Format: 1010, 1020, ...)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("contractors")
        .insert({
          id: userId,
          company_name: data.company_name,
          description: data.description,
          city: data.city,
          address: data.address || null,
          trades: selectedTrades,
          postal_codes: postalCodeArray,
          profile_image_url: profileImage[0] || null,
          portfolio_images: portfolioImages,
          verified: false,
          rating: 0,
          total_reviews: 0,
          free_leads_remaining: 3,
          subscription_tier: "free",
          availability_status: "available"
        });

      if (error) throw error;

      toast({
        title: "Profil erstellt!",
        description: "Ihr Profil wird nun geprüft. Sie erhalten eine Benachrichtigung sobald es freigeschaltet wurde.",
      });

      navigate("/handwerker/dashboard");
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Handwerker-Profil erstellen</CardTitle>
              <CardDescription>
                Vervollständigen Sie Ihr Profil um Aufträge zu erhalten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Firmenname *</Label>
                  <Input
                    id="company_name"
                    {...register("company_name")}
                    placeholder="Mustermann GmbH"
                  />
                  {errors.company_name && (
                    <p className="text-sm text-destructive">{errors.company_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Unternehmensbeschreibung *</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Beschreiben Sie Ihr Unternehmen und Ihre Dienstleistungen..."
                    rows={5}
                  />
                  <p className="text-sm text-muted-foreground">Mindestens 100 Zeichen</p>
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Gewerke * (mindestens 1)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {availableTrades.map(trade => (
                      <div key={trade} className="flex items-center space-x-2">
                        <Checkbox
                          id={trade}
                          checked={selectedTrades.includes(trade)}
                          onCheckedChange={(checked) => handleTradeChange(trade, checked as boolean)}
                        />
                        <Label htmlFor={trade} className="font-normal cursor-pointer">
                          {trade}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_codes">Einsatzgebiete (PLZ) *</Label>
                  <Input
                    id="postal_codes"
                    value={postalCodes}
                    onChange={(e) => setPostalCodes(e.target.value)}
                    placeholder="1010, 1020, 1030"
                  />
                  <p className="text-sm text-muted-foreground">
                    Kommagetrennte Liste der Postleitzahlen, in denen Sie tätig sind
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">Stadt *</Label>
                    <Input
                      id="city"
                      {...register("city")}
                      placeholder="Wien"
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive">{errors.city.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      {...register("address")}
                      placeholder="Musterstraße 123"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Profilbild</Label>
                  <ImageUpload
                    bucket="profile-images"
                    folder={userId}
                    maxImages={1}
                    onImagesChange={setProfileImage}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Portfolio-Bilder (max. 10)</Label>
                  <ImageUpload
                    bucket="contractor-portfolios"
                    folder={userId}
                    maxImages={10}
                    onImagesChange={setPortfolioImages}
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Wird erstellt..." : "Profil zur Prüfung einreichen"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
