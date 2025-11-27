import { useForm } from "react-hook-form";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";



interface ForgotPasswordFormData {
  email: string;
}

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

const ForgotPasswordForm = ({ onBackToLogin }: ForgotPasswordFormProps) => {
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
  try {
    await sendPasswordResetEmail(auth, data.email);

    toast({
      title: "Email enviado!",
      description: `Verifique sua caixa de entrada.`,
    });
  } catch (error) {
    toast({
      title: "Erro ao enviar",
      variant: "destructive",
      description: "Email não encontrado.",
    });
  }
};


  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="w-full max-w-md border border-border rounded-lg shadow-lg p-5">
        <Card className="backdrop-blur-sm bg-glass border-0 shadow-card">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-elegant">
              <Send className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Recuperar Senha</CardTitle>
              <CardDescription className="text-muted-foreground">
                Digite seu email para receber as instruções de recuperação
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email cadastrado</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10 transition-smooth focus:shadow-elegant focus:border-primary"
                    {...register("email", {
                      required: "Email é obrigatório",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Email inválido",
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-500 hover:bg-blue-400 hover:scale-[1.02] transition-all duration-300 font-medium"
              >
                {isSubmitting ? "Enviando..." : "Enviar instruções"}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-border">
              <button
                onClick={onBackToLogin}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o login
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;