import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Wrench, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";

const registerSchema = z.object({
  email: z.string().email("Bitte geben Sie eine gültige E-Mail ein"),
  password: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
  firstName: z.string().min(2, "Vorname ist erforderlich"),
  lastName: z.string().min(2, "Nachname ist erforderlich"),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "Sie müssen die AGB und Datenschutzerklärung akzeptieren" }),
  }),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState<"customer" | "contractor" | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "customer" || roleParam === "contractor") {
      setRole(roleParam);
    }
  }, [searchParams]);
  
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    if (!role) return;
    
    setLoading(true);
    try {
      const { error, data: authData } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            role,
            first_name: data.firstName,
            last_name: data.lastName,
          },
        },
      });

      if (error) throw error;

      // Update profile with additional info
      if (authData.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            first_name: data.firstName,
            last_name: data.lastName,
          })
          .eq("id", authData.user.id);

        if (profileError) console.error("Profile update error:", profileError);

        // Insert role into user_roles table
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: authData.user.id,
            role: role,
          });

        if (roleError) console.error("Role insert error:", roleError);
        
        // Create contractor profile if registering as contractor
        if (role === 'contractor' && authData.user) {
          const { error: contractorError } = await supabase
            .from('contractors')
            .insert({
              id: authData.user.id,
              company_name: `${data.firstName} ${data.lastName}`,
              trades: [],
              postal_codes: [],
              service_radius: 50,
              verified: false,
              handwerker_status: 'REGISTERED'
            });
          
          if (contractorError) console.error("Contractor creation error:", contractorError);
        }
      }

      toast({
        title: "Registrierung erfolgreich!",
        description: "Sie werden weitergeleitet...",
      });

      setTimeout(() => {
        if (role === "customer") {
          navigate("/kunde/dashboard");
        } else {
          navigate("/handwerker/onboarding");
        }
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Fehler bei der Registrierung",
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
        {!role ? (
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold">Wie möchten Sie BauConnect24 nutzen?</h1>
              <p className="text-muted-foreground">Wählen Sie Ihre Rolle aus</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card 
                className="cursor-pointer transition-all hover:border-primary hover:shadow-lg"
                onClick={() => setRole("customer")}
              >
                <CardHeader>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Ich suche Handwerker</CardTitle>
                  <CardDescription>
                    Erstellen Sie Aufträge und erhalten Sie Angebote von qualifizierten Handwerkern
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card 
                className="cursor-pointer transition-all hover:border-primary hover:shadow-lg"
                onClick={() => setRole("contractor")}
              >
                <CardHeader>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-secondary/10">
                    <Wrench className="h-8 w-8 text-secondary" />
                  </div>
                  <CardTitle>Ich bin Handwerker</CardTitle>
                  <CardDescription>
                    Finden Sie neue Aufträge und bauen Sie Ihr Geschäft aus
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-md">
            <Card>
              <CardHeader>
                <CardTitle>Konto erstellen</CardTitle>
                <CardDescription>
                  Registrieren Sie sich als {role === "customer" ? "Auftraggeber" : "Handwerker"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Vorname</Label>
                      <Input
                        id="firstName"
                        {...register("firstName")}
                        placeholder="Max"
                      />
                      {errors.firstName && (
                        <p className="text-sm text-destructive">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nachname</Label>
                      <Input
                        id="lastName"
                        {...register("lastName")}
                        placeholder="Mustermann"
                      />
                      {errors.lastName && (
                        <p className="text-sm text-destructive">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="max@beispiel.at"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Passwort</Label>
                    <Input
                      id="password"
                      type="password"
                      {...register("password")}
                      placeholder="••••••••"
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acceptTerms"
                      {...register("acceptTerms")}
                      className="mt-1"
                    />
                    <Label
                      htmlFor="acceptTerms"
                      className="text-sm font-normal leading-relaxed cursor-pointer"
                    >
                      Ich akzeptiere die{" "}
                      <Link
                        to="/agb"
                        target="_blank"
                        className="text-primary hover:underline font-medium"
                      >
                        AGB
                      </Link>{" "}
                      und{" "}
                      <Link
                        to="/datenschutz"
                        target="_blank"
                        className="text-primary hover:underline font-medium"
                      >
                        Datenschutzerklärung
                      </Link>
                    </Label>
                  </div>
                  {errors.acceptTerms && (
                    <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setRole(null)}
                      className="flex-1"
                    >
                      Zurück
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? "Wird erstellt..." : "Registrieren"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
