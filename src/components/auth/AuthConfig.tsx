import { ThemeSupa } from "@supabase/auth-ui-shared";

export const getAuthConfig = (
  isLoading: boolean,
  inviteCode: string | null,
  handleSubmit: (formData: { email: string; password: string }) => Promise<boolean>,
  handleSuccess: () => void,
  handleError: (error: any) => void,
  authView?: 'sign_in' | 'sign_up' | 'forgotten_password'
) => {
  // Use clean redirect URL - let Supabase add the reset tokens
  const redirectUrl = `${window.location.origin}/auth`;
  
  return {
    appearance: {
      theme: ThemeSupa,
      variables: {
        default: {
          colors: {
            brand: "#DB5D27",
            brandAccent: "#F97316",
            inputBackground: "hsl(0 0% 100%)",
            inputText: "hsl(222.2 84% 4.9%)",
            inputBorder: "hsl(214.3 31.8% 91.4%)",
            inputBorderFocus: "#DB5D27",
            inputLabelText: "hsl(222.2 47.4% 11.2%)",
            inputPlaceholder: "hsl(215.4 16.3% 46.9%)",
          },
        },
        dark: {
          colors: {
            brand: "#DB5D27",
            brandAccent: "#F97316",
            inputBackground: "hsl(240 10% 15%)",
            inputText: "#F1F1F1",
            inputBorder: "#6B7280",
            inputBorderFocus: "#DB5D27",
            inputLabelText: "#F1F1F1",
            inputPlaceholder: "#9CA3AF",
          },
        },
      },
      className: {
        button: "auth-button",
        input: "auth-input",
        label: "auth-label",
      },
    },
    providers: [],
    redirectTo: redirectUrl,
    magicLink: false,
    showLinks: false,
    localization: {
      variables: {
        sign_up: {
          email_label: "Email",
          password_label: "Password",
          button_label: "Sign up",
          link_text: "Don't have an account? Sign up",
          email_input_placeholder: "Your email address",
          password_input_placeholder: "Your password",
        },
        sign_in: {
          email_label: "Email",
          password_label: "Password",
          button_label: "Sign in",
          link_text: "Already have an account? Sign in",
          email_input_placeholder: "Your email address",
          password_input_placeholder: "Your password",
        },
        forgotten_password: {
          email_label: "Email",
          password_label: "Password",
          button_label: "Send reset password instructions",
          link_text: "Forgot your password?",
          confirmation_text: "Check your email for the password reset link",
          email_input_placeholder: "Your email address",
        },
      },
    },
    additionalData: inviteCode ? {
      invite_code: inviteCode,
      invite_type: 'manager'
    } : undefined,
  };
};

