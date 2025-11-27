import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { ProgressStepper } from "@/components/wizard/ProgressStepper";
import { ImageUpload } from "@/components/ImageUpload";
import { SingleImageUpload } from "@/components/SingleImageUpload";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

const GEWERKE = [
  { id: "elektriker", label: "Elektriker", icon: "⚡" },
  { id: "sanitar-heizung", label: "Sanitär-Heizung", icon: "🔧" },
  { id: "dachdecker", label: "Dachdecker", icon: "🏠" },
  { id: "fassade", label: "Fassade", icon: "🧱" },
  { id: "maler", label: "Maler", icon: "🎨" },
  { id: "bau", label: "Bau / Rohbau", icon: "🏗️" },
];

const RECHTSFORMEN = [
  "Einzelunternehmen",
  "GmbH",
  "AG",
  "OG",
  "KG",
];

const steps = [
  { id: 0, label: "Unternehmensdaten" },
  { id: 1, label: "Gewerke & Einsatzgebiet" },
  { id: 2, label: "Auftrags-Präferenzen" },
  { id: 3, label: "Qualifikationen" },
  { id: 4, label: "Zusammenfassung" },
];

export default function ContractorOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [contractorId, setContractorId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Step 1: Unternehmensdaten
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [rechtsform, setRechtsform] = useState("");
  const [uidNummer, setUidNummer] = useState("");
  const [website, setWebsite] = useState("");
  const [profileImage, setProfileImage] = useState("");

  // Step 2: Gewerke & Einsatzgebiet
  const [selectedGewerke, setSelectedGewerke] = useState<string[]>([]);
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [serviceRadius, setServiceRadius] = useState([50]);
  const [postalCodes, setPostalCodes] = useState("");

  // Step 3: Auftrags-Präferenzen
  const [minProjectValue, setMinProjectValue] = useState([2000]);
  const [acceptsUrgent, setAcceptsUrgent] = useState(true);
  const [teamSize, setTeamSize] = useState(1);
  const [capacityPerMonth, setCapacityPerMonth] = useState([5]);

  // Step 4: Qualifikationen
  const [gewerbescheinUrl, setGewerbescheinUrl] = useState("");
  const [versicherungUrl, setVersicherungUrl] = useState("");
  const [zertifikateUrls, setZertifikateUrls] = useState<string[]>([]);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);

  useEffect(() => {
    loadContractorProfile();
  }, []);

  const loadContractorProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    setContractorId(user.id);

    const { data: contractor } = await supabase
      .from("contractors")
      .select("*")
      .eq("id", user.id)
      .single();

    if (contractor) {
      setCompanyName(contractor.company_name || "");
      setDescription(contractor.description || "");
      setRechtsform(contractor.rechtsform || "");
      setUidNummer(contractor.uid_nummer || "");
      setWebsite(contractor.website || "");
      setProfileImage(contractor.profile_image_url || "");
      setSelectedGewerke(contractor.trades || []);
      setCity(contractor.city || "");
      setAddress(contractor.address || "");
      setServiceRadius([contractor.service_radius || 50]);
      setPostalCodes(contractor.postal_codes?.join(", ") || "");
      setMinProjectValue([contractor.min_project_value || 2000]);
      setAcceptsUrgent(contractor.accepts_urgent || true);
      setTeamSize(contractor.team_size || 1);
      setCapacityPerMonth([contractor.capacity_per_month || 5]);
      setGewerbescheinUrl(contractor.gewerbeschein_url || "");
      setVersicherungUrl(contractor.versicherung_url || "");
      setZertifikateUrls(contractor.zertifikate_urls || []);
      setPortfolioImages(contractor.portfolio_images || []);
    }
  };

  const toggleGewerk = (gewerkId: string) => {
    if (selectedGewerke.includes(gewerkId)) {
      setSelectedGewerke(selectedGewerke.filter(g => g !== gewerkId));
    } else {
      if (selectedGewerke.length < 3) {
        setSelectedGewerke([...selectedGewerke, gewerkId]);
      } else {
        toast({
          title: "Maximum erreicht",
          description: "Sie können maximal 3 Gewerke auswählen",
          variant: "destructive",
        });
      }
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 0:
        if (!companyName.trim()) {
          toast({ title: "Fehler", description: "Firmenname ist erforderlich", variant: "destructive" });
          return false;
        }
        const lineCount = description.split('\n').length;
        if (lineCount < 30) {
          toast({ title: "Fehler", description: `Beschreibung muss mindestens 30 Zeilen haben (aktuell: ${lineCount})`, variant: "destructive" });
          return false;
        }
        return true;
      case 1:
        if (selectedGewerke.length === 0) {
          toast({ title: "Fehler", description: "Wählen Sie mindestens 1 Gewerk aus", variant: "destructive" });
          return false;
        }
        if (!city.trim() || !address.trim()) {
          toast({ title: "Fehler", description: "Stadt und Adresse sind erforderlich", variant: "destructive" });
          return false;
        }
        if (!postalCodes.trim()) {
          toast({ title: "Fehler", description: "Mindestens eine Postleitzahl ist erforderlich", variant: "destructive" });
          return false;
        }
        return true;
      case 2:
        return true;
      case 3:
        if (!gewerbescheinUrl || !versicherungUrl) {
          toast({ title: "Fehler", description: "Gewerbeschein und Versicherungsnachweis sind erforderlich", variant: "destructive" });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!contractorId) return;

    setLoading(true);
    try {
      const postalCodesArray = postalCodes.split(",").map(pc => pc.trim()).filter(Boolean);

      const { error } = await supabase
        .from("contractors")
        .update({
          company_name: companyName,
          description,
          rechtsform,
          uid_nummer: uidNummer,
          website,
          profile_image_url: profileImage,
          trades: selectedGewerke,
          city,
          address,
          service_radius: serviceRadius[0],
          postal_codes: postalCodesArray,
          min_project_value: minProjectValue[0],
          accepts_urgent: acceptsUrgent,
          team_size: teamSize,
          capacity_per_month: capacityPerMonth[0],
          gewerbeschein_url: gewerbescheinUrl,
          versicherung_url: versicherungUrl,
          zertifikate_urls: zertifikateUrls,
          portfolio_images: portfolioImages,
          handwerker_status: "UNDER_REVIEW",
          updated_at: new Date().toISOString(),
        })
        .eq("id", contractorId);

      if (error) throw error;

      toast({
        title: "Profil gespeichert!",
        description: "Suche nach passenden Aufträgen...",
      });

      // Auto-backfill matches for newly completed profile
      try {
        const { data: backfillData } = await supabase.functions.invoke('backfill-contractor-matches');
        
        if (backfillData?.matchesCreated > 0) {
          toast({
            title: `🎉 ${backfillData.matchesCreated} passende Leads gefunden!`,
            description: "Sie können diese jetzt in Ihrem Dashboard ansehen.",
          });
        }
      } catch (backfillError) {
        console.error('Backfill error:', backfillError);
      }

      setTimeout(() => {
        navigate("/handwerker/dashboard");
      }, 1500);
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

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <Label>Profilbild</Label>
              <SingleImageUpload
                value={profileImage}
                onChange={setProfileImage}
                bucket="profile-images"
                folder={contractorId || ''}
              />
            </div>

            <div>
              <Label htmlFor="companyName">Firmenname *</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Sanitär Huber & Co"
              />
            </div>

            <div>
              <Label htmlFor="description">Unternehmensbeschreibung * (min. 30 Zeilen)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Experten für Heizung und Sanitär mit über 20 Jahren Erfahrung. Wir bieten professionelle Lösungen für Neubauten, Sanierungen und Wartungsarbeiten..."
                className="min-h-[480px]"
                rows={30}
              />
              <p className="mt-1 text-sm text-muted-foreground">
                {description.split('\n').length} / 30 Zeilen
              </p>
            </div>

            <div>
              <Label htmlFor="rechtsform">Rechtsform</Label>
              <Select value={rechtsform} onValueChange={setRechtsform}>
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie eine Rechtsform" />
                </SelectTrigger>
                <SelectContent>
                  {RECHTSFORMEN.map((form) => (
                    <SelectItem key={form} value={form}>{form}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="uidNummer">UID-Nummer (optional)</Label>
              <Input
                id="uidNummer"
                value={uidNummer}
                onChange={(e) => setUidNummer(e.target.value)}
                placeholder="ATU12345678"
              />
            </div>

            <div>
              <Label htmlFor="website">Website (optional)</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://www.beispiel.at"
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label>Gewerke auswählen * (1-3)</Label>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {GEWERKE.map((gewerk) => (
                  <div
                    key={gewerk.id}
                    className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:border-primary"
                    onClick={() => toggleGewerk(gewerk.id)}
                  >
                    <Checkbox
                      checked={selectedGewerke.includes(gewerk.id)}
                      onCheckedChange={() => toggleGewerk(gewerk.id)}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{gewerk.icon}</span>
                      <span className="font-medium">{gewerk.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="city">Stadt *</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Wien"
                />
              </div>
              <div>
                <Label htmlFor="address">Adresse *</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Hauptstraße 1"
                />
              </div>
            </div>

            <div>
              <Label>Service-Radius: {serviceRadius[0]} km</Label>
              <Slider
                value={serviceRadius}
                onValueChange={setServiceRadius}
                min={20}
                max={150}
                step={10}
                className="mt-2"
              />
              <p className="mt-1 text-sm text-muted-foreground">
                Sie sehen nur Aufträge innerhalb dieses Radius von Ihrer Adresse
              </p>
            </div>

            <div>
              <Label htmlFor="postalCodes">Postleitzahlen * (kommagetrennt)</Label>
              <Input
                id="postalCodes"
                value={postalCodes}
                onChange={(e) => setPostalCodes(e.target.value)}
                placeholder="1010, 1020, 1030"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label>Dringende Aufträge akzeptieren</Label>
                <p className="text-sm text-muted-foreground">
                  Erhalten Sie Benachrichtigungen für eilige Projekte
                </p>
              </div>
              <Switch
                checked={acceptsUrgent}
                onCheckedChange={setAcceptsUrgent}
              />
            </div>

            <div>
              <Label htmlFor="teamSize">Team-Größe</Label>
              <Input
                id="teamSize"
                type="number"
                value={teamSize}
                onChange={(e) => setTeamSize(parseInt(e.target.value) || 1)}
                min={1}
                max={50}
              />
            </div>

            <div>
              <Label>Kapazität pro Monat: {capacityPerMonth[0]} Aufträge</Label>
              <Slider
                value={capacityPerMonth}
                onValueChange={setCapacityPerMonth}
                min={1}
                max={20}
                step={1}
                className="mt-2"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label>Gewerbeschein *</Label>
              <SingleImageUpload
                value={gewerbescheinUrl}
                onChange={setGewerbescheinUrl}
                bucket="contractor-portfolios"
                folder={`${contractorId || ''}/documents`}
              />
            </div>

            <div>
              <Label>Versicherungsnachweis *</Label>
              <SingleImageUpload
                value={versicherungUrl}
                onChange={setVersicherungUrl}
                bucket="contractor-portfolios"
                folder={`${contractorId || ''}/documents`}
              />
            </div>

            <div>
              <Label>Zertifikate (optional, max. 5)</Label>
              {contractorId ? (
                <ImageUpload
                  bucket="contractor-portfolios"
                  folder={`${contractorId}/certificates`
                  }
                  maxImages={5}
                  onImagesChange={setZertifikateUrls}
                  existingImages={zertifikateUrls}
                />
              ) : (
                <p className="text-sm text-muted-foreground">Lädt...</p>
              )}
            </div>

            <div>
              <Label>Portfolio-Bilder (max. 10)</Label>
              {contractorId ? (
                <ImageUpload
                  bucket="contractor-portfolios"
                  folder={`${contractorId}/portfolio`}
                  maxImages={10}
                  onImagesChange={setPortfolioImages}
                  existingImages={portfolioImages}
                />
              ) : (
                <p className="text-sm text-muted-foreground">Lädt...</p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="rounded-lg bg-muted p-6">
              <h3 className="mb-4 text-lg font-semibold">Zusammenfassung Ihrer Angaben</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Unternehmensdaten</h4>
                  <p className="text-sm text-muted-foreground">{companyName}</p>
                  <p className="text-sm text-muted-foreground">{description.substring(0, 100)}...</p>
                </div>

                <div>
                  <h4 className="font-medium">Gewerke</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedGewerke.map(g => GEWERKE.find(gw => gw.id === g)?.label).join(", ")}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium">Einsatzgebiet</h4>
                  <p className="text-sm text-muted-foreground">
                    {city}, {address} | Radius: {serviceRadius[0]} km
                  </p>
                </div>

                <div>
                  <h4 className="font-medium">Präferenzen</h4>
                  <p className="text-sm text-muted-foreground">
                    Min. Projektvolumen: €{minProjectValue[0].toLocaleString()} | 
                    Team: {teamSize} Personen | 
                    Kapazität: {capacityPerMonth[0]} Aufträge/Monat
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
              <p className="text-sm">
                <strong>Hinweis:</strong> Ihr Profil wird nach Einreichung von unserem Team geprüft. 
                Sie werden per E-Mail benachrichtigt, sobald Ihr Profil freigegeben wurde.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold">Handwerker-Profil vervollständigen</h1>
            <p className="text-muted-foreground">
              Vervollständigen Sie Ihr Profil, um Aufträge zu erhalten
            </p>
          </div>

          <ProgressStepper steps={steps} currentStep={currentStep} />

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>{steps[currentStep].label}</CardTitle>
            </CardHeader>
            <CardContent>
              {renderStep()}

              <div className="mt-6 flex justify-between gap-4">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={loading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Zurück
                  </Button>
                )}

                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="ml-auto"
                  >
                    Weiter
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="ml-auto"
                  >
                    {loading ? (
                      "Wird eingereicht..."
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Profil einreichen
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
