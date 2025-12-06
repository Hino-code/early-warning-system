import { useState } from "react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react";
import pestIconLogo from "@/assets/pest-logo-icon.png";

// Inline CSS for the sign-in button to override any conflicting styles
const signInButtonStyles = `
  .login-submit-button {
    width: 100% !important;
    background-color: #15803d !important;
    color: #ffffff !important;
    padding: 12px 16px !important;
    border-radius: 0.375rem !important;
    font-weight: 600 !important;
    font-size: 14px !important;
    border: none !important;
    cursor: pointer !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    min-height: 44px !important;
    transition: background-color 0.2s !important;
  }
  
  .login-submit-button:hover:not(:disabled) {
    background-color: #166534 !important;
  }
  
  .login-submit-button:disabled {
    opacity: 0.5 !important;
    cursor: not-allowed !important;
  }
`;

interface LoginProps {
  loading?: boolean;
  error?: string;
  onLogin: (payload: { username: string; password: string }) => Promise<void>;
  onShowRegistration: () => void;
}

export function Login({
  loading = false,
  error,
  onLogin,
  onShowRegistration,
}: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [success, setSuccess] = useState("");
  const [formError, setFormError] = useState<string | undefined>();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(undefined);
    setSuccess("");
    try {
      await onLogin(formData);
      setSuccess("Login successful! Redirecting...");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Invalid username or password.",
      );
    }
  };

  return (
    <>
      <style>{signInButtonStyles}</style>
      <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 pt-12 pb-8">
        <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center">
            <img src={pestIconLogo} alt="Pest.i Logo" className="h-16 w-16" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-green-800">Pest.i</h1>
            <p className="text-xs text-muted-foreground font-medium">Early Warning System</p>
            <p className="text-xs text-muted-foreground mt-1">
              Advanced rice pest monitoring and forecasting platform
            </p>
          </div>
        </div>

        <Card className="p-6 space-y-4 shadow-xl overflow-visible">
          <div className="space-y-1 text-center">
            <h2 className="text-xl font-semibold">Welcome Back</h2>
            <p className="text-xs text-muted-foreground">
              Sign in to access your pest monitoring dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 overflow-visible">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-medium">Username</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm">
                  Remember me
                </Label>
              </div>
              <Button variant="link" size="sm" className="px-0 h-auto">
                Forgot password?
              </Button>
            </div>

            {(formError || error) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError ?? error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-900">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="login-submit-button"
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '8px'
                  }} />
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <Separator className="my-3" />

          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1.5">
              Don't have an account?
            </p>
            <Button 
              variant="link" 
              onClick={onShowRegistration}
              className="text-xs h-auto py-0"
            >
              Request Access
            </Button>
          </div>
        </Card>

        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            Capstone Project - Agricultural Pest Monitoring System
          </p>
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} Pest.i</span>
            <span>•</span>
            <Button variant="link" className="h-auto p-0 text-xs">
              Privacy Policy
            </Button>
            <span>•</span>
            <Button variant="link" className="h-auto p-0 text-xs">
              Terms of Service
            </Button>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
