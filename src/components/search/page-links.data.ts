import { routes } from "@/config/routes";

export const pageLinks = [
  { name: "Pages" },
  { name: "Dashboard", href: routes.dashboard },

  { name: "Authentication" },
  { name: "Sign In", href: routes.auth.signIn },
  { name: "Sign Up", href: routes.auth.signUp },
  { name: "Forgot Password", href: routes.auth.forgotPassword },
  { name: "OTP", href: routes.auth.otp },
];
