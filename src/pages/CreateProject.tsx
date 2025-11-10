import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { ImageUpload } from "@/components/ImageUpload";
import { ProgressStepper } from "@/components/wizard/ProgressStepper";
import { SelectionCard } from "@/components/wizard/SelectionCard";
import { TradeSelectionGrid } from "@/components/wizard/TradeSelectionGrid";
import { tradeQuestions, commonQuestions } from "@/components/wizard/tradeQuestions";
import { ArrowLeft, ArrowRight, MapPin, Calendar, Image as ImageIcon, FileText, CheckCircle2, Hammer } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

const steps = [
  { id: 0, label: "Gewerk" },
  { id: 1, label: "Details" },
  { id: 2, label: "Standort" },
  { id: 3, label: "Zeitplan" },
  { id: 4, label: "Bilder" },
  { id: 5, label: "Zusammenfassung" }
];

interface ProjectData {
  trade: string;
  title: string;
  description: string;
  postal_code: string;
  city: string;
  address: string;
  budget_min?: number;
  budget_max?: number;
  urgency: 'sofort' | 'normal' | 'flexibel' | '';
  images: string[];
  tradeSpecificAnswers: Record<string, any>;
  preferred_start_date?: string;
  estimated_value?: number;
}

export default function CreateProject() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [wantsImages, setWantsImages] = useState(false);
  
  const [projectData, setProjectData] = useState<ProjectData>({
    trade: "",
    title: "",
    description: "",
    postal_code: "",
    city: "",
    address: "",
    urgency: "",
    images: [],
    tradeSpecificAnswers: {},
    estimated_value: undefined,
    preferred_start_date: undefined
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  const currentTradeQuestions = projectData.trade && tradeQuestions[projectData.trade] 
    ? tradeQuestions[projectData.trade] 
    : [];

  const handleNext = () => {
    // Validation for Step 0
    if (currentStep === 0 && !projectData.trade) {
      toast({
        title: "Bitte wählen Sie ein Gewerk",
        description: "Wählen Sie ein Gewerk aus, um fortzufahren",
        variant: "destructive",
      });
      return;
    }

    // Validation for Step 2
    if (currentStep === 2) {
      if (!projectData.postal_code || !projectData.city) {
        toast({
          title: "Pflichtfelder fehlen",
          description: "Bitte geben Sie PLZ und Stadt an",
          variant: "destructive",
        });
        return;
      }
    }

    // Validation for Step 3
    if (currentStep === 3 && !projectData.urgency) {
      toast({
        title: "Bitte wählen Sie einen Zeitplan",
        description: "Wann soll die Arbeit erledigt werden?",
        variant: "destructive",
      });
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    if (!userId) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Sie müssen angemeldet sein, um ein Projekt zu erstellen",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!projectData.title || !projectData.description) {
      toast({
        title: "Pflichtfelder fehlen",
        description: "Bitte füllen Sie Titel und Beschreibung aus",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Generate title from trade if not provided
      const finalTitle = projectData.title || `${projectData.trade} Projekt`;
      
      // Generate keywords from description
      const keywords = projectData.description
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3);

      const { error } = await supabase
        .from("projects")
        .insert([{
          customer_id: userId,
          title: finalTitle,
          description: projectData.description,
          trade: projectData.trade,
          postal_code: projectData.postal_code,
          city: projectData.city,
          address: projectData.address || null,
          budget_min: projectData.budget_min || null,
          budget_max: projectData.budget_max || null,
          urgency: projectData.urgency || 'normal',
          images: projectData.images,
          keywords: keywords,
          estimated_value: projectData.estimated_value || null,
          preferred_start_date: projectData.preferred_start_date || null,
          projekt_typ: finalTitle,
          fotos: projectData.images,
          status: "open",
          visibility: "public"
        }]);

      if (error) throw error;

      toast({
        title: "🎉 Projekt erfolgreich erstellt!",
        description: "Handwerker in Ihrer Nähe werden benachrichtigt",
      });

      navigate("/kunde/dashboard");
    } catch (error: any) {
      toast({
        title: "Fehler beim Erstellen",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProjectData = (key: string, value: any) => {
    setProjectData(prev => ({ ...prev, [key]: value }));
  };

  const updateTradeSpecificAnswer = (questionId: string, value: any) => {
    setProjectData(prev => ({
      ...prev,
      tradeSpecificAnswers: {
        ...prev.tradeSpecificAnswers,
        [questionId]: value
      }
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        // Trade Selection with Beautiful Grid
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <TradeSelectionGrid
              selectedTrade={projectData.trade}
              onTradeSelect={(trade) => updateProjectData("trade", trade)}
            />
          </motion.div>
        );

      case 1:
        // Trade-Specific Questions
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Details zu Ihrem {projectData.trade}-Projekt</h2>
              <p className="text-muted-foreground">
                Je genauer Ihre Angaben, desto besser können Handwerker Ihnen helfen
              </p>
            </div>

            {currentTradeQuestions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-4"
              >
                <Label className="text-lg font-semibold">
                  {question.label} {question.required && <span className="text-destructive">*</span>}
                </Label>

                {question.type === "multiselect" && question.options && (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {question.options.map((option) => {
                      const isSelected = (projectData.tradeSpecificAnswers[question.id] || []).includes(option.value);
                      const Icon = option.icon;
                      
                      return (
                        <SelectionCard
                          key={option.value}
                          icon={Icon ? <Icon className="h-8 w-8" /> : undefined}
                          label={option.label}
                          isSelected={isSelected}
                          onClick={() => {
                            const current = projectData.tradeSpecificAnswers[question.id] || [];
                            const updated = isSelected
                              ? current.filter((v: string) => v !== option.value)
                              : [...current, option.value];
                            updateTradeSpecificAnswer(question.id, updated);
                          }}
                        />
                      );
                    })}
                  </div>
                )}

                {question.type === "radio" && question.options && (
                  <RadioGroup
                    value={projectData.tradeSpecificAnswers[question.id]}
                    onValueChange={(value) => updateTradeSpecificAnswer(question.id, value)}
                  >
                    <div className="space-y-3">
                      {question.options.map((option) => {
                        const Icon = option.icon;
                        const isSelected = projectData.tradeSpecificAnswers[question.id] === option.value;
                        
                        return (
                          <div
                            key={option.value}
                            className={cn(
                              "flex items-center space-x-3 rounded-lg border-2 p-4 transition-all cursor-pointer hover:border-primary/50 hover:shadow-md",
                              isSelected
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border"
                            )}
                            onClick={() => updateTradeSpecificAnswer(question.id, option.value)}
                          >
                            <RadioGroupItem value={option.value} id={option.value} />
                            {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
                            <Label 
                              htmlFor={option.value} 
                              className="flex-1 cursor-pointer font-normal"
                            >
                              {option.label}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </RadioGroup>
                )}

                {question.type === "textarea" && (
                  <Textarea
                    value={projectData.tradeSpecificAnswers[question.id] || ""}
                    onChange={(e) => updateTradeSpecificAnswer(question.id, e.target.value)}
                    placeholder={question.placeholder}
                    rows={6}
                    className="resize-none"
                  />
                )}
              </motion.div>
            ))}

            {/* Additional Description */}
            {projectData.trade !== "Sonstige" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: currentTradeQuestions.length * 0.1 }}
                className="space-y-2"
              >
                <Label htmlFor="description" className="text-lg font-semibold">
                  Weitere Angaben <span className="text-sm font-normal text-muted-foreground">(optional)</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Beschreiben Sie weitere Details zu Ihrem Projekt
                </p>
                <Textarea
                  id="description"
                  value={projectData.description}
                  onChange={(e) => updateProjectData("description", e.target.value)}
                  placeholder="z.B. Raumgröße, spezielle Wünsche, Materialien..."
                  rows={5}
                  className="resize-none"
                />
              </motion.div>
            )}
          </motion.div>
        );

      case 2:
        // Location
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-primary/10">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl font-bold">Wo soll die Arbeit ausgeführt werden?</h2>
              <p className="text-muted-foreground">
                Handwerker in Ihrer Nähe werden automatisch benachrichtigt
              </p>
            </div>

            <Card className="p-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="postal_code">
                    Postleitzahl <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="postal_code"
                    value={projectData.postal_code}
                    onChange={(e) => updateProjectData("postal_code", e.target.value)}
                    placeholder="1010"
                    maxLength={4}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">
                    Stadt <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="city"
                    value={projectData.city}
                    onChange={(e) => updateProjectData("city", e.target.value)}
                    placeholder="Wien"
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Straße und Hausnummer <span className="text-sm font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="address"
                  value={projectData.address}
                  onChange={(e) => updateProjectData("address", e.target.value)}
                  placeholder="Musterstraße 123"
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">
                  Die genaue Adresse wird nur an beauftragte Handwerker weitergegeben
                </p>
              </div>

              <div className="border-t pt-6">
                <Label className="text-base font-semibold mb-4 block">
                  Budget <span className="text-sm font-normal text-muted-foreground">(optional)</span>
                </Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="budget_min" className="text-sm">Von (EUR)</Label>
                    <Input
                      id="budget_min"
                      type="number"
                      value={projectData.budget_min || ""}
                      onChange={(e) => updateProjectData("budget_min", e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="1000"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget_max" className="text-sm">Bis (EUR)</Label>
                    <Input
                      id="budget_max"
                      type="number"
                      value={projectData.budget_max || ""}
                      onChange={(e) => updateProjectData("budget_max", e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="5000"
                      className="h-12"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Die Budgetangabe hilft Handwerkern, passende Angebote zu erstellen
                </p>
              </div>
            </Card>
          </motion.div>
        );

      case 3:
        // Timing
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-primary/10">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl font-bold">Wann soll die Arbeit erledigt werden?</h2>
              <p className="text-muted-foreground">
                Dies hilft Handwerkern bei der Planung
              </p>
            </div>

            <RadioGroup
              value={projectData.urgency}
              onValueChange={(value) => updateProjectData("urgency", value as 'sofort' | 'normal' | 'flexibel')}
            >
              <div className="space-y-3 max-w-2xl mx-auto">
                {[
                  { value: "sofort", label: "🚨 Sofort / Notfall (innerhalb 24-48h)", description: "Dringender Auftrag - höhere Lead-Kosten" },
                  { value: "normal", label: "📅 Normal (innerhalb 1-2 Wochen)", description: "Standard-Zeitrahmen" },
                  { value: "flexibel", label: "🕐 Flexibel / Nach Absprache", description: "Kein fester Zeitplan" }
                ].map((option) => {
                  const isSelected = projectData.urgency === option.value;
                  
                  return (
                    <motion.div
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className={cn(
                          "flex items-start space-x-4 rounded-lg border-2 p-5 transition-all cursor-pointer hover:border-primary/50 hover:shadow-md",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border"
                        )}
                        onClick={() => updateProjectData("urgency", option.value as 'sofort' | 'normal' | 'flexibel')}
                      >
                        <RadioGroupItem value={option.value} id={option.value} className="flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <Label 
                            htmlFor={option.value} 
                            className="cursor-pointer font-medium text-base block mb-1"
                          >
                            {option.label}
                          </Label>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </RadioGroup>
          </motion.div>
        );

      case 4:
        // Images
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-primary/10">
                  <ImageIcon className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl font-bold">Fotos oder Baupläne hinzufügen</h2>
              <p className="text-muted-foreground">
                Bilder helfen Handwerkern, Ihr Projekt besser zu verstehen
              </p>
            </div>

            <Card className="p-8 max-w-2xl mx-auto space-y-6">
              <div className="flex items-start space-x-4">
                <Checkbox 
                  id="wants-images"
                  checked={wantsImages}
                  onCheckedChange={(checked) => setWantsImages(checked as boolean)}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <Label htmlFor="wants-images" className="text-base font-medium cursor-pointer">
                    Ja, ich möchte Bilder hochladen
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Laden Sie bis zu 25 Bilder hoch (JPG, PNG, max. 5MB pro Bild)
                  </p>
                </div>
              </div>

              {wantsImages && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-4 border-t"
                >
                  <ImageUpload
                    bucket="project-images"
                    folder={userId}
                    maxImages={25}
                    onImagesChange={(images) => updateProjectData("images", images)}
                  />
                </motion.div>
              )}

              {!wantsImages && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                  <span>Sie können auch später noch Bilder hinzufügen</span>
                </div>
              )}
            </Card>
          </motion.div>
        );

      case 5:
        // Summary
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-primary/10">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl font-bold">Fast geschafft!</h2>
              <p className="text-muted-foreground">
                Überprüfen Sie Ihre Angaben und geben Sie Ihrem Projekt einen Titel
              </p>
            </div>

            {/* Project Title */}
            <Card className="p-6 max-w-2xl mx-auto">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                  Projekttitel <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={projectData.title}
                  onChange={(e) => updateProjectData("title", e.target.value)}
                  placeholder="z.B. Tapezieren von 3 Zimmern in Wohnung"
                  className="h-12 text-lg"
                />
                <p className="text-xs text-muted-foreground">
                  Ein aussagekräftiger Titel hilft Handwerkern, Ihr Projekt schnell zu verstehen
                </p>
              </div>
            </Card>

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
              <Card className="p-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Hammer className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Projektdetails</h3>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Gewerk</p>
                  <p className="font-medium">{projectData.trade}</p>
                </div>

                {projectData.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Beschreibung</p>
                    <p className="text-sm line-clamp-3">{projectData.description}</p>
                  </div>
                )}
              </Card>

              <Card className="p-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Standort & Zeitplan</h3>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Standort</p>
                  <p className="font-medium">{projectData.postal_code} {projectData.city}</p>
                  {projectData.address && <p className="text-sm text-muted-foreground">{projectData.address}</p>}
                </div>

                {projectData.urgency && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Zeitplan</p>
                    <p className="font-medium">
                      {commonQuestions[0].options?.find(o => o.value === projectData.urgency)?.label}
                    </p>
                  </div>
                )}
              </Card>

              {((projectData.budget_min || projectData.budget_max) || projectData.images.length > 0) && (
                <Card className="p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <ImageIcon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">Zusatzinformationen</h3>
                  </div>

                  {(projectData.budget_min || projectData.budget_max) && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Budget</p>
                      <p className="font-medium">
                        {projectData.budget_min && `${projectData.budget_min.toLocaleString()} EUR`}
                        {projectData.budget_min && projectData.budget_max && " - "}
                        {projectData.budget_max && `${projectData.budget_max.toLocaleString()} EUR`}
                      </p>
                    </div>
                  )}

                  {projectData.images.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Bilder</p>
                      <p className="font-medium">{projectData.images.length} Bild(er) hochgeladen</p>
                    </div>
                  )}
                </Card>
              )}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <ProgressStepper steps={steps} currentStep={currentStep} />

          <div className="mt-12 min-h-[600px]">
            {renderStepContent()}
          </div>

          <div className="mt-12 flex justify-between gap-4 pb-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="gap-2 h-12 px-6"
              size="lg"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button 
                onClick={handleNext} 
                className="gap-2 h-12 px-6"
                size="lg"
              >
                Weiter
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={loading || !projectData.title}
                className="gap-2 h-12 px-8"
                size="lg"
              >
                {loading ? "Wird erstellt..." : "Projekt jetzt veröffentlichen"}
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
