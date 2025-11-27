import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { ImageUpload } from "@/components/ImageUpload";
import { ProgressStepper } from "@/components/wizard/ProgressStepper";
import { SelectionCard } from "@/components/wizard/SelectionCard";
import { ArrowLeft, ArrowRight, MapPin, Calendar, Image as ImageIcon, FileText, CheckCircle2, Hammer, Star, MessageSquare, Zap, Droplet, Home, Paintbrush, User } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthDialog } from "@/components/AuthDialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, differenceInDays } from "date-fns";
import { de } from "date-fns/locale";

// Icon mapping for service categories
const iconMap: Record<string, any> = {
  'Zap': Zap,
  'Droplet': Droplet,
  'Home': Home,
  'Paintbrush': Paintbrush,
  'Hammer': Hammer
};

const steps = [
  { id: 0, label: "Kategorie" },
  { id: 1, label: "Details" },
  { id: 2, label: "Standort" },
  { id: 3, label: "Zeitplan" },
  { id: 4, label: "Bilder" },
  { id: 5, label: "Zusammenfassung" }
];

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  parent_id: string | null;
}

interface CategoryQuestion {
  id: string;
  question_text: string;
  question_type: string;
  options: any;
  required: boolean;
  help_text: string | null;
  sort_order: number;
}

interface ProjectData {
  gewerk_id: string;
  subcategory_id: string;
  title: string;
  description: string;
  postal_code: string;
  city: string;
  address: string;
  budget_min?: number;
  budget_max?: number;
  urgency: 'high' | 'medium' | 'low' | '';
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
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string>("");
  const [matchedContractors, setMatchedContractors] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Guest data for inline registration
  const [guestData, setGuestData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    acceptTerms: false
  });
  
  // Categories state
  const [mainCategories, setMainCategories] = useState<ServiceCategory[]>([]);
  const [subCategories, setSubCategories] = useState<ServiceCategory[]>([]);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>("");
  const [categoryQuestions, setCategoryQuestions] = useState<CategoryQuestion[]>([]);
  
  const [projectData, setProjectData] = useState<ProjectData>({
    gewerk_id: "",
    subcategory_id: "",
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
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
    loadCategories();
    
    // Check for pre-selected category from search
    const state = location.state as any;
    if (state?.selectedGewerk && state?.selectedSubcategoryId) {
      setProjectData(prev => ({
        ...prev,
        gewerk_id: state.selectedGewerk,
        subcategory_id: state.selectedSubcategoryId
      }));
      setSelectedMainCategory(state.selectedGewerk);
      loadSubCategories(state.selectedGewerk);
      setCurrentStep(1); // Skip to details step
    } else if (state?.selectedGewerk) {
      setProjectData(prev => ({ ...prev, gewerk_id: state.selectedGewerk }));
      setSelectedMainCategory(state.selectedGewerk);
      loadSubCategories(state.selectedGewerk);
      setCurrentStep(0); // Show subcategory selection with tab pre-selected
    }
  }, [location]);

  // Auto-select first category when categories load (only if no category is pre-selected)
  useEffect(() => {
    if (mainCategories.length > 0 && !selectedMainCategory) {
      const firstCategory = mainCategories[0];
      setSelectedMainCategory(firstCategory.id);
      updateProjectData("gewerk_id", firstCategory.id);
    }
  }, [mainCategories]);

  useEffect(() => {
    if (selectedMainCategory) {
      loadSubCategories(selectedMainCategory);
    }
  }, [selectedMainCategory]);

  useEffect(() => {
    if (projectData.subcategory_id) {
      loadCategoryQuestions(projectData.subcategory_id);
    }
  }, [projectData.subcategory_id]);

  useEffect(() => {
    if (projectData.subcategory_id) {
      loadCategoryQuestions(projectData.subcategory_id);
    }
  }, [projectData.subcategory_id]);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('service_categories')
      .select('*')
      .eq('level', 1)
      .eq('active', true)
      .order('sort_order');
    
    if (data) setMainCategories(data);
  };

  const loadSubCategories = async (parentId: string) => {
    console.log("Loading subcategories for parent:", parentId);
    setLoadingSubCategories(true);
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .eq('parent_id', parentId)
      .eq('level', 2)
      .eq('active', true)
      .order('sort_order');
    
    if (error) {
      console.error("Error loading subcategories:", error);
      setLoadingSubCategories(false);
      return;
    }
    
    console.log("Loaded subcategories:", data);
    setSubCategories(data || []);
    setLoadingSubCategories(false);
  };

  const loadCategoryQuestions = async (categoryId: string) => {
    const { data } = await supabase
      .from('category_questions')
      .select('*')
      .eq('category_id', categoryId)
      .order('sort_order');
    
    if (data) setCategoryQuestions(data);
  };

  const currentTradeQuestions = categoryQuestions;

  const handleNext = () => {
    // Validation for Step 0 - Category and subcategory selection
    if (currentStep === 0) {
      if (!selectedMainCategory) {
        toast({
          title: "Bitte wählen Sie eine Kategorie",
          description: "Wählen Sie zunächst eine Kategorie aus den Tabs",
          variant: "destructive",
        });
        return;
      }
      if (!projectData.subcategory_id) {
        toast({
          title: "Bitte wählen Sie eine Unterkategorie",
          description: "Wählen Sie eine spezifische Dienstleistung aus",
          variant: "destructive",
        });
        return;
      }
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
    if (currentStep === 3 && !selectedDate) {
      toast({
        title: "Bitte wählen Sie ein Datum",
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

  const handlePublish = () => {
    // Check if user is logged in
    if (!userId) {
      setShowAuthDialog(true);
      return;
    }
    
    // User is logged in, submit project
    handleSubmit();
  };

  const handleAuthSuccess = async () => {
    // After successful auth, close dialog and submit project
    setShowAuthDialog(false);
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      // Submit project now that user is logged in
      setTimeout(() => handleSubmit(), 500);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    await handleAuthSuccess();
    return true;
  };

  const handleRegister = async (email: string, password: string, firstName: string, lastName: string, phone: string, acceptTerms: boolean) => {
    if (!acceptTerms) {
      toast({
        title: "AGB nicht akzeptiert",
        description: "Bitte akzeptieren Sie die AGB und Datenschutzerklärung",
        variant: "destructive",
      });
      return false;
    }

    if (password.length < 6) {
      toast({
        title: "Passwort zu kurz",
        description: "Das Passwort muss mindestens 6 Zeichen lang sein",
        variant: "destructive",
      });
      return false;
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { role: 'customer' }
      }
    });

    if (authError) {
      toast({
        title: "Registrierung fehlgeschlagen",
        description: authError.message,
        variant: "destructive",
      });
      return false;
    }

    if (!authData.user) {
      toast({
        title: "Registrierung fehlgeschlagen",
        description: "Konto konnte nicht erstellt werden",
        variant: "destructive",
      });
      return false;
    }

    // Update profile
    await supabase.from('profiles').update({
      first_name: firstName,
      last_name: lastName,
      phone: phone
    }).eq('id', authData.user.id);

    // Set user role
    await supabase.from('user_roles').insert({
      user_id: authData.user.id,
      role: 'customer'
    });

    await handleAuthSuccess();
    return true;
  };

  const handleSubmit = async () => {
    if (!userId) {
      toast({
        title: "Fehler",
        description: "Sie müssen angemeldet sein um ein Projekt zu erstellen",
        variant: "destructive",
      });
      return;
    }

    if (!projectData.title) {
      toast({
        title: "Pflichtfelder fehlen",
        description: "Bitte geben Sie einen Projekttitel ein",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Generate comprehensive description from trade-specific answers
      let generatedDescription = projectData.description || "";
      
      // Add trade-specific answers to description
      if (Object.keys(projectData.tradeSpecificAnswers).length > 0) {
        const answerTexts: string[] = [];
        Object.entries(projectData.tradeSpecificAnswers).forEach(([key, value]) => {
          if (Array.isArray(value) && value.length > 0) {
            answerTexts.push(`${value.join(', ')}`);
          } else if (typeof value === 'string' && value) {
            answerTexts.push(value);
          }
        });
        
        if (answerTexts.length > 0) {
          generatedDescription = answerTexts.join('. ') + (generatedDescription ? '. ' + generatedDescription : '');
        }
      }

      // Ensure minimum description length
      if (!generatedDescription || generatedDescription.length < 20) {
        generatedDescription = `${projectData.title}. Weitere Details werden mit dem Handwerker besprochen.`;
      }
      
      // Generate keywords from description and title
      const keywords = (generatedDescription + ' ' + projectData.title)
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3)
        .filter((word, index, self) => self.indexOf(word) === index) // unique
        .slice(0, 20); // max 20 keywords

      const { data: newProject, error } = await supabase
        .from("projects")
        .insert([{
          customer_id: userId,
          title: projectData.title,
          description: generatedDescription,
          gewerk_id: projectData.gewerk_id,
          subcategory_id: projectData.subcategory_id || null,
          postal_code: projectData.postal_code,
          city: projectData.city,
          address: projectData.address || null,
          budget_min: projectData.budget_min || null,
          budget_max: projectData.budget_max || null,
          urgency: projectData.urgency || 'medium',
          images: projectData.images,
          keywords: keywords,
          estimated_value: projectData.estimated_value || null,
          preferred_start_date: projectData.preferred_start_date || null,
          projekt_typ: projectData.title,
          fotos: projectData.images,
          funnel_answers: projectData.tradeSpecificAnswers,
          status: "open",
          visibility: "public"
        }])
        .select()
        .single();

      if (error) throw error;

      // Trigger contractor matching
      console.log('🎯 Triggering contractor matching for project:', newProject.id);
      try {
        const { data: matchResult, error: matchError } = await supabase.functions.invoke(
          'match-contractors',
          {
            body: { projectId: newProject.id }
          }
        );

        if (matchError) {
          console.error('❌ Matching error:', matchError);
          toast({
            title: "Projekt erstellt",
            description: "Handwerker-Matching läuft im Hintergrund",
          });
        } else {
          console.log('✅ Matching complete:', matchResult);
          toast({
            title: "🎉 Projekt erfolgreich erstellt!",
            description: `${matchResult.matches || 0} Handwerker wurden benachrichtigt`,
          });
        }
      } catch (matchErr) {
        console.error('💥 Failed to trigger matching:', matchErr);
        toast({
          title: "Projekt erstellt",
          description: "Handwerker-Matching läuft im Hintergrund",
        });
      }

      // Wait a moment for matches to be created
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Load MATCHED contractors from matches table
      console.log('📋 Loading matched contractors from matches...');
      const { data: matchesData } = await supabase
        .from('matches')
        .select(`
          *,
          contractor:contractors(*)
        `)
        .eq('project_id', newProject.id)
        .order('score', { ascending: false })
        .limit(5);

      const matchedContractorsList = matchesData
        ?.map(match => match.contractor)
        .filter(Boolean) || [];

      console.log(`✅ Loaded ${matchedContractorsList.length} matched contractors`);
      setMatchedContractors(matchedContractorsList);
      setCreatedProjectId(newProject.id);
      setShowSuccessDialog(true);
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

  const startConversation = async (contractorId: string) => {
    try {
      console.log('💬 Starting conversation with contractor:', contractorId);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('❌ No session found');
        toast({
          title: "Anmeldung erforderlich",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }

      console.log('🔍 Checking for existing conversation...');
      
      // Check if conversation exists
      const { data: existing, error: fetchError } = await supabase
        .from('conversations')
        .select('id')
        .eq('project_id', createdProjectId)
        .eq('contractor_id', contractorId)
        .eq('customer_id', session.user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('❌ Error checking conversation:', fetchError);
        throw fetchError;
      }

      if (existing) {
        console.log('✅ Found existing conversation:', existing.id);
        navigate(`/nachrichten?conversation=${existing.id}`);
        return;
      }

      console.log('➕ Creating new conversation...');
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
          project_id: createdProjectId,
          customer_id: session.user.id,
          contractor_id: contractorId,
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating conversation:', createError);
        throw createError;
      }

      console.log('✅ Conversation created:', newConv.id);
      navigate(`/nachrichten?conversation=${newConv.id}`);
    } catch (error: any) {
      console.error('💥 Start conversation failed:', error);
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        // Combined Category Selection with Tabs
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Welche Dienstleistung benötigen Sie?</h2>
              <p className="text-muted-foreground">Wählen Sie eine Unterkategorie</p>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-4xl mx-auto">
              {mainCategories.map((category) => {
                const IconComponent = iconMap[category.icon] || Home;
                const isActive = selectedMainCategory === category.id;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedMainCategory(category.id);
                      updateProjectData("gewerk_id", category.id);
                      updateProjectData("subcategory_id", "");
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg scale-105"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span className="text-sm md:text-base">{category.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Subcategories */}
            {selectedMainCategory && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                  {loadingSubCategories ? (
                    <div className="col-span-full text-center py-12">
                      <LoadingSpinner size="lg" />
                      <p className="text-muted-foreground mt-4">Lädt Unterkategorien...</p>
                    </div>
                  ) : subCategories.length > 0 ? (
                    subCategories.map((category) => {
                      const IconComponent = category.icon ? iconMap[category.icon] : null;
                      return (
                        <SelectionCard
                          key={category.id}
                          icon={IconComponent ? <IconComponent className="h-10 w-10" /> : <span className="text-3xl">📋</span>}
                          label={category.name}
                          description={category.description}
                          isSelected={projectData.subcategory_id === category.id}
                          onClick={() => updateProjectData("subcategory_id", category.id)}
                        />
                      );
                    })
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-muted-foreground">Keine Unterkategorien verfügbar</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!selectedMainCategory && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">👆 Wählen Sie zuerst eine Kategorie</p>
              </div>
            )}
          </motion.div>
        );

      case 1:
        // Category-Specific Questions
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Details zu Ihrem Projekt</h2>
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
                  {question.question_text} {question.required && <span className="text-destructive">*</span>}
                </Label>
                {question.help_text && (
                  <p className="text-sm text-muted-foreground">{question.help_text}</p>
                )}

                {question.question_type === "multiselect" && question.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {question.options.map((option: any) => {
                      const isSelected = (projectData.tradeSpecificAnswers[question.id] || []).includes(option.value);
                      
                      return (
                        <motion.div
                          key={option.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            const current = projectData.tradeSpecificAnswers[question.id] || [];
                            const updated = isSelected
                              ? current.filter((v: string) => v !== option.value)
                              : [...current, option.value];
                            updateTradeSpecificAnswer(question.id, updated);
                          }}
                          className={cn(
                            "relative cursor-pointer rounded-xl border-2 p-6 transition-all hover:shadow-lg",
                            isSelected
                              ? "border-primary bg-primary/5 shadow-md"
                              : "border-gray-200 hover:border-primary/50 bg-white"
                          )}
                        >
                          <Checkbox
                            checked={isSelected}
                            className="absolute top-4 right-4 h-5 w-5"
                          />
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div className={cn(
                              "w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-colors",
                              isSelected ? "bg-primary/10" : "bg-gray-100"
                            )}>
                              {option.icon || "📋"}
                            </div>
                            <p className="font-semibold text-base">{option.label}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {question.question_type === "radio" && question.options && (
                  <RadioGroup
                    value={projectData.tradeSpecificAnswers[question.id]}
                    onValueChange={(value) => updateTradeSpecificAnswer(question.id, value)}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {question.options.map((option: any) => {
                        const isSelected = projectData.tradeSpecificAnswers[question.id] === option.value;
                        
                        return (
                          <motion.div
                            key={option.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                              "relative cursor-pointer rounded-xl border-2 p-6 transition-all hover:shadow-lg",
                              isSelected
                                ? "border-primary bg-primary/5 shadow-md"
                                : "border-gray-200 hover:border-primary/50 bg-white"
                            )}
                            onClick={() => updateTradeSpecificAnswer(question.id, option.value)}
                          >
                            <RadioGroupItem
                              value={option.value}
                              id={option.value}
                              className="absolute top-4 right-4"
                            />
                            <div className="flex flex-col items-center text-center space-y-3">
                              <div className={cn(
                                "w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-colors",
                                isSelected ? "bg-primary/10" : "bg-gray-100"
                              )}>
                                {option.icon || "📋"}
                              </div>
                              <Label 
                                htmlFor={option.value} 
                                className="font-semibold text-base cursor-pointer"
                              >
                                {option.label}
                              </Label>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </RadioGroup>
                )}

                {question.question_type === "number" && (
                  <Input
                    type="number"
                    value={projectData.tradeSpecificAnswers[question.id] || ""}
                    onChange={(e) => updateTradeSpecificAnswer(question.id, e.target.value)}
                    placeholder="Bitte Zahl eingeben"
                    className="h-12"
                  />
                )}

                {question.question_type === "textarea" && (
                  <Textarea
                    value={projectData.tradeSpecificAnswers[question.id] || ""}
                    onChange={(e) => updateTradeSpecificAnswer(question.id, e.target.value)}
                    placeholder="Bitte Details eingeben"
                    rows={6}
                    className="resize-none"
                  />
                )}
              </motion.div>
            ))}

            {/* Additional Description */}
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
        // Timing - Date Picker Version
        const calculateUrgency = (date: Date | undefined) => {
          if (!date) return { urgency: 'medium' as const, label: 'Mittel', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
          
          const daysUntil = differenceInDays(date, new Date());
          
          if (daysUntil <= 14) {
            return { urgency: 'high' as const, label: 'Dringend', color: 'bg-red-500', textColor: 'text-red-600' };
          } else if (daysUntil <= 60) {
            return { urgency: 'medium' as const, label: 'Mittel', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
          } else {
            return { urgency: 'low' as const, label: 'Flexibel', color: 'bg-green-500', textColor: 'text-green-600' };
          }
        };

        const urgencyInfo = calculateUrgency(selectedDate);

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

            <Card className="p-8 max-w-3xl mx-auto space-y-8">
              <div className="space-y-6">
                {/* Date Picker */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-auto py-6",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-3 h-6 w-6" />
                      {selectedDate ? (
                        <span className="text-xl font-semibold">{format(selectedDate, "PPP", { locale: de })}</span>
                      ) : (
                        <span className="text-xl">Datum auswählen</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        if (date) {
                          const urgency = calculateUrgency(date);
                          updateProjectData('urgency', urgency.urgency);
                          updateProjectData('preferred_start_date', date.toISOString());
                        }
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                
                {/* Selected Date Display with Urgency */}
                {selectedDate && (
                  <div className="text-center space-y-4 animate-in fade-in-50">
                    <Badge className={cn("text-xl px-8 py-3 font-bold text-white border-0", urgencyInfo.color)}>
                      {urgencyInfo.label}
                    </Badge>
                    <p className="text-base text-muted-foreground font-medium">
                      {differenceInDays(selectedDate, new Date())} Tage bis zum geplanten Start
                    </p>
                  </div>
                )}
                
                {/* Legend */}
                <div className="flex justify-between items-center text-sm pt-6 border-t">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="font-medium">Dringend</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="font-medium">Mittel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="font-medium">Flexibel</span>
                  </div>
                </div>
              </div>
            </Card>
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
        // Summary - NO registration fields here
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
                  <p className="font-medium capitalize">{projectData.gewerk_id.replace('-', ' / ')}</p>
                </div>

                {Object.keys(projectData.tradeSpecificAnswers).length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Details</p>
                    <div className="text-sm space-y-1">
                      {Object.entries(projectData.tradeSpecificAnswers).slice(0, 3).map(([key, value]) => {
                        if (Array.isArray(value) && value.length > 0) {
                          return <p key={key} className="text-muted-foreground">• {value.join(', ')}</p>;
                        } else if (typeof value === 'string' && value) {
                          return <p key={key} className="text-muted-foreground line-clamp-1">• {value}</p>;
                        }
                        return null;
                      })}
                      {Object.keys(projectData.tradeSpecificAnswers).length > 3 && (
                        <p className="text-xs text-muted-foreground italic">+ {Object.keys(projectData.tradeSpecificAnswers).length - 3} weitere Details</p>
                      )}
                    </div>
                  </div>
                )}
                
                {projectData.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Zusätzliche Angaben</p>
                    <p className="text-sm line-clamp-2">{projectData.description}</p>
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
                      {projectData.urgency === 'high' ? 'Sofort / Notfall' : 
                       projectData.urgency === 'medium' ? 'Normal (1-2 Wochen)' : 
                       'Flexibel'}
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
      
      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              🎉 Auftrag erfolgreich erstellt!
            </DialogTitle>
            <DialogDescription>
              Hier sind passende Handwerker für Ihr Projekt
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {matchedContractors.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Keine passenden Handwerker gefunden. Wir benachrichtigen Sie, sobald sich jemand meldet.
              </p>
            ) : (
              matchedContractors.map(contractor => (
                <Card key={contractor.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={contractor.profile_image_url} />
                        <AvatarFallback>{contractor.company_name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{contractor.company_name}</h3>
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{contractor.rating.toFixed(1)} ⭐</span>
                          <span className="text-muted-foreground">
                            ({contractor.total_reviews} Bewertungen)
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          📍 {contractor.city}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setShowSuccessDialog(false);
                          navigate(`/handwerker/${contractor.id}`);
                        }}
                      >
                        Profil
                      </Button>
                      <Button onClick={() => startConversation(contractor.id)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Nachricht
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={() => {
                setShowSuccessDialog(false);
                navigate(`/kunde/projekt/${createdProjectId}`);
              }}
              className="w-full sm:w-auto"
            >
              Projekt ansehen & Handwerker kontaktieren
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowSuccessDialog(false);
                navigate('/kunde/dashboard');
              }}
              className="w-full sm:w-auto"
            >
              Zu meinen Projekten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                onClick={handlePublish} 
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

      {/* Auth Dialog */}
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onLogin={handleLogin}
        onRegister={async (email, password, firstName, lastName, phone, acceptTerms) => {
          return await handleRegister(email, password, firstName, lastName, phone, acceptTerms);
        }}
      />
    </div>
  );
}
