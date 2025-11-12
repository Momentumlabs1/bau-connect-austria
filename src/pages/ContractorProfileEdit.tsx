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
import { Loader2 } from "lucide-react";

const profileSchema = z.object({
  company_name: z.string().min(2, "Firmenname ist erforderlich"),
  description: z.string().min(50, "Beschreibung muss mindestens 50 Zeichen lang sein"),
  city: z.string().min(2, "Stadt ist erforderlich"),
  address: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const availableTrades = [
  "elektriker",
  "sanitar-heizung",
  "maler",
  "dachdecker",
  "fassade"
];

const tradeLabels: Record<string, string> = {
  "elektriker": "Elektriker",
  "sanitar-heizung": "Sanitär & Heizung",
  "maler": "Maler",
  "dachdecker": "Dachdecker",
  "fassade": "Fassade"
};

export default function ContractorProfileEdit() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [selectedTrades, setSelectedTrades] = useState<string[]>([]);
  const [postalCodes, setPostalCodes] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string[]>([]);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      setUserId(user.id);

      const { data: profile, error } = await supabase
        .from("contractors")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        toast({
          title: "Fehler",
          description: "Profil konnte nicht geladen werden",
          variant: "destructive",
        });
        navigate("/handwerker/dashboard");
        return;
      }

      // Load existing data
      setValue("company_name", profile.company_name);
      setValue("description", profile.description || "");
      setValue("city", profile.city || "");
      setValue("address", profile.address || "");
      setSelectedTrades(profile.trades || []);
      setPostalCodes(profile.postal_codes?.join(", ") || "");
      setProfileImage(profile.profile_image_url ? [profile.profile_image_url] : []);
      setPortfolioImages(profile.portfolio_images || []);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

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

    setSaving(true);
    try {
      const { error } = await supabase
        .from("contractors")
        .update({
          company_name: data.company_name,
          description: data.description,
          city: data.city,
          address: data.address || null,
          trades: selectedTrades,
          postal_codes: postalCodeArray,
          profile_image_url: profileImage[0] || null,
          portfolio_images: portfolioImages,
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Profil aktualisiert!",
        description: "Ihre Änderungen wurden gespeichert.",
      });

      navigate("/handwerker/dashboard");
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Profil bearbeiten</CardTitle>
              <CardDescription>
                Aktualisieren Sie Ihre Unternehmensinformationen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="profileImage">Profilbild</Label>
                  <ImageUpload
                    bucket="profile-images"
                    folder={userId}
                    maxImages={1}
                    onImagesChange={setProfileImage}
                    existingImages={profileImage}
                  />
                </div>

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
                  <Label htmlFor="description">Unternehmensbeschreibung & Spezialisierung *</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Beschreiben Sie Ihr Unternehmen, Ihre Dienstleistungen und Ihre Spezialisierung..."
                    rows={6}
                  />
                  <p className="text-sm text-muted-foreground">
                    Erzählen Sie potenziellen Kunden über Ihre Erfahrung und Spezialisierung (mindestens 50 Zeichen)
                  </p>
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
                          {tradeLabels[trade]}
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
                  <Label>Portfolio-Bilder (max. 10)</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Zeigen Sie Ihre besten Arbeiten und überzeugen Sie potenzielle Kunden
                  </p>
                  <ImageUpload
                    bucket="contractor-portfolios"
                    folder={userId}
                    maxImages={10}
                    onImagesChange={setPortfolioImages}
                    existingImages={portfolioImages}
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/handwerker/dashboard")}
                    className="flex-1"
                  >
                    Abbrechen
                  </Button>
                  <Button type="submit" disabled={saving} className="flex-1">
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Wird gespeichert...
                      </>
                    ) : (
                      "Änderungen speichern"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
