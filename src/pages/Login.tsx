import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email("Bitte geben Sie eine gültige E-Mail ein"),
  password: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const { error, data: authData } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      // Get user profile to determine role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      toast({
        title: "Anmeldung erfolgreich!",
        description: "Sie werden weitergeleitet...",
      });

      setTimeout(() => {
        if (profile?.role === "customer") {
          navigate("/kunde/dashboard");
        } else if (profile?.role === "contractor") {
          navigate("/handwerker/dashboard");
        } else if (profile?.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      }, 500);
    } catch (error: any) {
      toast({
        title: "Anmeldefehler",
        description: error.message === "Invalid login credentials"
          ? "E-Mail oder Passwort ist falsch"
          : error.message,
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
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Anmelden</CardTitle>
              <CardDescription>
                Melden Sie sich bei Ihrem BauConnect24-Konto an
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Wird angemeldet..." : "Anmelden"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  <a href="#" className="hover:text-primary">
                    Passwort vergessen?
                  </a>
                </div>

                <div className="text-center text-sm">
                  Noch kein Konto?{" "}
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => navigate("/register")}
                    className="p-0"
                  >
                    Jetzt registrieren
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
