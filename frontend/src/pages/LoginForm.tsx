import { useState } from "react";
import { auth } from "@/firebaseConfig";
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Mail, Lock, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from "@/context/AuthContext";


interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onRegisterClick: () => void;
  onForgotPasswordClick: () => void;
}

// const onSubmit = async (data: LoginFormData) => {
//   try {
//     await signInWithEmailAndPassword(auth, data.email, data.password);

//     toast({
//       title: "Login realizado!",
//       description: `Bem-vindo ao ARM, ${data.email}`,
//     });
//   } catch (error) {
//     toast({
//       title: "Erro ao fazer login",
//       description: "Email ou senha incorretos.",
//       variant: "destructive",
//     });
//   }
// };

const LoginForm = ({
  onRegisterClick,
  onForgotPasswordClick,
}: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      // 5. Chame a função 'login' do contexto
      await login(data.email, data.password);

      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo de volta!`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: "Email ou senha incorretos.",
        variant: "destructive",
      });
    }
  };

  // const loginGoogle = async () => {
  //   const provider = new GoogleAuthProvider();

  //   try {
  //     const result = await signInWithPopup(auth, provider);

  //     console.log("Usuario logado:", result.user);
  //   } catch (error) {
  //     console.log("Erro ao logar:", error);
  //   }
  // };

  const handleGoogleLogin = async () => {
    try {
      // Supondo que você moveu 'loginWithGoogle' para o contexto
      // await loginWithGoogle();
      
      // Ou mantenha a lógica aqui e mova para o contexto depois
       const provider = new GoogleAuthProvider();
       await signInWithPopup(auth, provider);
      // Aqui você também deveria salvar no Firestore se for o primeiro login
      
    } catch (error) {
      console.log("Erro ao logar com Google:", error);
       toast({
        title: "Erro no login com Google",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-sm bg-glass border-0 shadow-card">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-elegant">
              <Wrench className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">ARM</CardTitle>
              <CardDescription className="text-muted-foreground">
                Aluguel e Recursos de Materiais
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
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
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 transition-smooth focus:shadow-elegant focus:border-primary"
                    {...register("password", {
                      required: "Senha é obrigatória",
                      minLength: {
                        value: 6,
                        message: "Senha deve ter pelo menos 6 caracteres",
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-smooth"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onForgotPasswordClick}
                  className="text-sm text-blue-500 hover:text-blue-300 transition-smooth font-medium"
                >
                  Esqueci minha senha
                </button>
              </div>

              <div className="flex flex-col items-center gap-3 text-center">
                <Button
        type="submit" // 7. IMPORTANTE: Mude o tipo do botão "Entrar" para 'submit'
        disabled={isSubmitting}
        className="w-full bg-blue-500 hover:shadow-elegant hover:scale-[1.02] transition-all duration-300 font-medium"
      >
        {isSubmitting ? "Entrando..." : "Entrar"}
      </Button>

                <span>OU</span>

               
<Button
        onClick={handleGoogleLogin} // 8. Use a função de login do Google
        type="button"
  className="w-full 
             bg-white 
             text-black 
             border border-gray-300 
             hover:bg-gray-100 
             hover:scale-[1.02] 
             transition-all duration-300 
             font-medium 
             flex items-center justify-center 
             gap-1  
             !h-10 !px-4 !py-2"
>
  <FcGoogle className="h-5 w-5" />
  <span>Entrar com Google</span>
</Button>
              
              </div>
              
            </form>

            <div className="text-center pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <button
                  onClick={onRegisterClick}
                  className="text-blue-500 hover:text-blue-300 transition-smooth font-medium"
                >
                  Cadastre-se
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
