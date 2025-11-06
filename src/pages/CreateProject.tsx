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
import { tradeQuestions, commonQuestions } from "@/components/wizard/tradeQuestions";
import { ArrowLeft, ArrowRight, Search, X } from "lucide-react";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const trades = [
  { value: "Maler", label: "Maler", keywords: ["tapezieren", "streichen", "malerarbeiten", "renovieren", "tapete"] },
  { value: "Elektriker", label: "Elektriker", keywords: ["elektrik", "steckdose", "lichtschalter", "verkabelung"] },
  { value: "Sanitär", label: "Sanitär", keywords: ["klempner", "bad", "wc", "wasserhahn", "heizung"] },
  { value: "Bau", label: "Bau", keywords: ["bauarbeiten", "umbau", "neubau", "sanierung"] },
  { value: "Sonstige", label: "Sonstige", keywords: [] }
];

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
  urgency: string;
  images: string[];
  tradeSpecificAnswers: Record<string, any>;
}

export default function CreateProject() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  
  const [projectData, setProjectData] = useState<ProjectData>({
    trade: "",
    title: "",
    description: "",
    postal_code: "",
    city: "",
    address: "",
    urgency: "",
    images: [],
    tradeSpecificAnswers: {}
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
    if (currentStep === 0 && !projectData.trade) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie ein Gewerk",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 2) {
      if (!projectData.postal_code || !projectData.city) {
        toast({
          title: "Fehler",
          description: "Bitte geben Sie PLZ und Stadt an",
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStep === 3 && !projectData.urgency) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie einen Zeitplan",
        variant: "destructive",
      });
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!userId) {
      toast({
        title: "Fehler",
        description: "Sie müssen angemeldet sein",
        variant: "destructive",
      });
      return;
    }

    if (!projectData.title || !projectData.description) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("projects")
        .insert([{
          customer_id: userId,
          title: projectData.title,
          description: projectData.description,
          trade: projectData.trade,
          postal_code: projectData.postal_code,
          city: projectData.city,
          address: projectData.address || null,
          budget_min: projectData.budget_min || null,
          budget_max: projectData.budget_max || null,
          urgency: projectData.urgency,
          images: projectData.images,
          status: "open",
          visibility: "public"
        }]);

      if (error) throw error;

      toast({
        title: "Projekt erstellt!",
        description: "Ihr Projekt wurde veröffentlicht",
      });

      navigate("/kunde/dashboard");
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
        // Trade Selection with Search
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight">
                Der zuverlässige Weg, einen Handwerker zu beauftragen
              </h1>
            </div>

            <div className="mx-auto max-w-2xl">
              <Label className="text-lg">Beschreiben Sie Ihren Auftrag</Label>
              <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between h-14 text-lg mt-2"
                  >
                    {projectData.trade || "z. B.: Malerarbeiten"}
                    <Search className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Suchen Sie nach einem Gewerk..." 
                      value={searchValue}
                      onValueChange={setSearchValue}
                    />
                    <CommandList>
                      <CommandEmpty>Keine Ergebnisse gefunden.</CommandEmpty>
                      <CommandGroup heading="Passende Leistungen">
                        {trades
                          .filter(trade => 
                            trade.label.toLowerCase().includes(searchValue.toLowerCase()) ||
                            trade.keywords.some(keyword => 
                              keyword.toLowerCase().includes(searchValue.toLowerCase())
                            )
                          )
                          .map((trade) => (
                            <CommandItem
                              key={trade.value}
                              value={trade.value}
                              onSelect={() => {
                                updateProjectData("trade", trade.value);
                                setSearchOpen(false);
                                setSearchValue("");
                              }}
                            >
                              {trade.label}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        );

      case 1:
        // Trade-Specific Questions
        return (
          <div className="space-y-8 animate-fade-in">
            {currentTradeQuestions.map((question) => (
              <div key={question.id} className="space-y-4">
                <Label className="text-lg">
                  {question.label} {question.required && "*"}
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
                        return (
                          <div
                            key={option.value}
                            className={cn(
                              "flex items-center space-x-3 rounded-lg border-2 p-4 transition-all cursor-pointer hover:border-primary/50",
                              projectData.tradeSpecificAnswers[question.id] === option.value
                                ? "border-primary bg-primary/5"
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
              </div>
            ))}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-lg">
                Weitere Angaben (optional)
              </Label>
              <p className="text-sm text-muted-foreground">
                Bitte erzählen Sie uns weitere Einzelheiten zu Ihrem Auftrag; wenn möglich z. B. die betroffenen Räume und die Art der Tapete, die Sie sich wünschen.
              </p>
              <Textarea
                id="description"
                value={projectData.description}
                onChange={(e) => updateProjectData("description", e.target.value)}
                placeholder="Vermeiden Sie hier die Angabe von Kontaktdaten und nutzen stattdessen die Kontaktfunktionen."
                rows={6}
                className="resize-none"
              />
            </div>
          </div>
        );

      case 2:
        // Location
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold">Wo soll die Arbeit ausgeführt werden?</h2>
              <p className="text-muted-foreground mt-2">
                Handwerker in Ihrer Nähe werden benachrichtigt
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="postal_code">Postleitzahl *</Label>
                <Input
                  id="postal_code"
                  value={projectData.postal_code}
                  onChange={(e) => updateProjectData("postal_code", e.target.value)}
                  placeholder="1010"
                  maxLength={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Stadt *</Label>
                <Input
                  id="city"
                  value={projectData.city}
                  onChange={(e) => updateProjectData("city", e.target.value)}
                  placeholder="Wien"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse (optional)</Label>
              <Input
                id="address"
                value={projectData.address}
                onChange={(e) => updateProjectData("address", e.target.value)}
                placeholder="Musterstraße 123"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="budget_min">Budget Min (EUR)</Label>
                <Input
                  id="budget_min"
                  type="number"
                  value={projectData.budget_min || ""}
                  onChange={(e) => updateProjectData("budget_min", e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="1000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget_max">Budget Max (EUR)</Label>
                <Input
                  id="budget_max"
                  type="number"
                  value={projectData.budget_max || ""}
                  onChange={(e) => updateProjectData("budget_max", e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="5000"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        // Timing
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold">Wann soll die Arbeit erledigt werden?</h2>
              <p className="text-sm text-muted-foreground mt-2">(optional)</p>
            </div>

            <RadioGroup
              value={projectData.urgency}
              onValueChange={(value) => updateProjectData("urgency", value)}
            >
              <div className="space-y-3">
                {commonQuestions[0].options?.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg border-2 p-4 transition-all cursor-pointer hover:border-primary/50",
                      projectData.urgency === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    )}
                    onClick={() => updateProjectData("urgency", option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label 
                      htmlFor={option.value} 
                      className="flex-1 cursor-pointer font-normal"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        );

      case 4:
        // Images
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold">Fotos oder Baupläne</h2>
              <p className="text-sm text-muted-foreground mt-2">(optional)</p>
              <p className="text-sm text-muted-foreground mt-1">
                Indem Sie Bilder hinzufügen, können Handwerker Ihren Auftrag besser beurteilen und Ihnen ein besseres Angebot unterbreiten.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Checkbox 
                  id="has-images"
                  checked={projectData.images.length > 0}
                />
                <Label htmlFor="has-images" className="text-base font-normal">
                  Ja, ich möchte Bilder hochladen
                </Label>
              </div>

              {projectData.images.length > 0 && (
                <ImageUpload
                  bucket="project-images"
                  folder={userId}
                  maxImages={25}
                  onImagesChange={(images) => updateProjectData("images", images)}
                />
              )}

              <div className="flex items-center space-x-4">
                <Checkbox id="no-images" checked={projectData.images.length === 0} />
                <Label htmlFor="no-images" className="text-base font-normal">
                  Nein, vielleicht später
                </Label>
              </div>
            </div>
          </div>
        );

      case 5:
        // Summary
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold">Zusammenfassung</h2>
              <p className="text-muted-foreground mt-2">
                Bitte überprüfen Sie Ihre Angaben
              </p>
            </div>

            <div className="space-y-4 rounded-lg border bg-muted/50 p-6">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Gewerk</h3>
                <p className="text-lg">{projectData.trade}</p>
              </div>

              {projectData.description && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Beschreibung</h3>
                  <p>{projectData.description}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Standort</h3>
                <p>{projectData.postal_code} {projectData.city}</p>
                {projectData.address && <p className="text-sm text-muted-foreground">{projectData.address}</p>}
              </div>

              {(projectData.budget_min || projectData.budget_max) && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Budget</h3>
                  <p>
                    {projectData.budget_min && `${projectData.budget_min} EUR`}
                    {projectData.budget_min && projectData.budget_max && " - "}
                    {projectData.budget_max && `${projectData.budget_max} EUR`}
                  </p>
                </div>
              )}

              {projectData.urgency && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Zeitplan</h3>
                  <p>
                    {commonQuestions[0].options?.find(o => o.value === projectData.urgency)?.label}
                  </p>
                </div>
              )}

              {projectData.images.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Bilder</h3>
                  <p>{projectData.images.length} Bild(er) hochgeladen</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Projekttitel *</Label>
              <Input
                id="title"
                value={projectData.title}
                onChange={(e) => updateProjectData("title", e.target.value)}
                placeholder="z.B. Tapezieren von 3 Zimmern"
              />
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
        <div className="mx-auto max-w-4xl">
          <ProgressStepper steps={steps} currentStep={currentStep} />

          <div className="mt-8 min-h-[500px]">
            {renderStepContent()}
          </div>

          <div className="mt-8 flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext} className="gap-2">
                Weiter
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="gap-2">
                {loading ? "Wird erstellt..." : "Projekt veröffentlichen"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
