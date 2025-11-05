import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { ImageUpload } from "@/components/ImageUpload";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

const projectSchema = z.object({
  title: z.string().min(10, "Titel muss mindestens 10 Zeichen lang sein"),
  description: z.string().min(50, "Beschreibung muss mindestens 50 Zeichen lang sein"),
  trade: z.string().min(1, "Bitte wählen Sie ein Gewerk"),
  postal_code: z.string().regex(/^\d{4}$/, "PLZ muss 4 Ziffern haben"),
  city: z.string().min(2, "Stadt ist erforderlich"),
  address: z.string().optional(),
  budget_min: z.number().min(0, "Budget muss positiv sein").optional(),
  budget_max: z.number().min(0, "Budget muss positiv sein").optional(),
  urgency: z.enum(["low", "medium", "high"]),
});

type ProjectForm = z.infer<typeof projectSchema>;

const trades = [
  "Elektriker",
  "Sanitär",
  "Maler",
  "Bau",
  "Sonstige"
];

export default function CreateProject() {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [userId, setUserId] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      urgency: "medium"
    }
  });

  // Get user ID on mount
  useState(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  });

  const onSubmit = async (data: ProjectForm) => {
    if (!userId) {
      toast({
        title: "Fehler",
        description: "Sie müssen angemeldet sein",
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
          title: data.title,
          description: data.description,
          trade: data.trade,
          postal_code: data.postal_code,
          city: data.city,
          address: data.address || null,
          budget_min: data.budget_min || null,
          budget_max: data.budget_max || null,
          urgency: data.urgency,
          preferred_start_date: startDate ? startDate.toISOString() : null,
          images: images,
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Neues Projekt erstellen</CardTitle>
              <CardDescription>
                Beschreiben Sie Ihr Projekt und finden Sie den passenden Handwerker
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Projekttitel *</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="z.B. Badezimmer sanieren"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Beschreibung *</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Beschreiben Sie Ihr Projekt im Detail..."
                    rows={5}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trade">Gewerk *</Label>
                  <Select onValueChange={(value) => setValue("trade", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Gewerk auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {trades.map(trade => (
                        <SelectItem key={trade} value={trade}>{trade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.trade && (
                    <p className="text-sm text-destructive">{errors.trade.message}</p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Postleitzahl *</Label>
                    <Input
                      id="postal_code"
                      {...register("postal_code")}
                      placeholder="1010"
                      maxLength={4}
                    />
                    {errors.postal_code && (
                      <p className="text-sm text-destructive">{errors.postal_code.message}</p>
                    )}
                  </div>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse (optional)</Label>
                  <Input
                    id="address"
                    {...register("address")}
                    placeholder="Musterstraße 123"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="budget_min">Budget Min (EUR)</Label>
                    <Input
                      id="budget_min"
                      type="number"
                      {...register("budget_min", { valueAsNumber: true })}
                      placeholder="1000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget_max">Budget Max (EUR)</Label>
                    <Input
                      id="budget_max"
                      type="number"
                      {...register("budget_max", { valueAsNumber: true })}
                      placeholder="5000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Dringlichkeit *</Label>
                  <Select 
                    defaultValue="medium"
                    onValueChange={(value: any) => setValue("urgency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Niedrig - Zeit bis 3+ Monate</SelectItem>
                      <SelectItem value="medium">Mittel - 1-3 Monate</SelectItem>
                      <SelectItem value="high">Hoch - Dringend (unter 1 Monat)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Bevorzugter Starttermin</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP", { locale: de }) : "Datum wählen"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Projektbilder (max. 5)</Label>
                  <ImageUpload
                    bucket="project-images"
                    folder={userId}
                    maxImages={5}
                    onImagesChange={setImages}
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Wird erstellt..." : "Projekt veröffentlichen"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
