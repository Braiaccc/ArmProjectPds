import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotPasswordForm from "./ForgotPasswordForm";

type AuthView = "login" | "register" | "forgot-password";

const AuthContainer = () => {
  const [currentView, setCurrentView] = useState<AuthView>("login");

  const handleViewChange = (view: AuthView) => {
    setCurrentView(view);
  };

  switch (currentView) {
    case "register":
      return <RegisterForm onBackToLogin={() => handleViewChange("login")} />;
    case "forgot-password":
      return <ForgotPasswordForm onBackToLogin={() => handleViewChange("login")} />;
    default:
      return (
        <LoginForm
          onRegisterClick={() => handleViewChange("register")}
          onForgotPasswordClick={() => handleViewChange("forgot-password")}
        />
      );
  }
};

export default AuthContainer;