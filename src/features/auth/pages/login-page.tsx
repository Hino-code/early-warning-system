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
  Bug,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
} from "lucide-react";
import pestIconLogo from "@/assets/pest-logo-icon.png";

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

  const demoAccounts = [
    { username: "admin@ews.local", password: "admin123", label: "Administrator" },
    { username: "field@ews.local", password: "field123", label: "Field Manager" },
    { username: "demo@ews.local", password: "demo123", label: "Demo User" },
  ] as const;

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

  const handleDemoLogin = (account: (typeof demoAccounts)[number]) => {
    setFormData({
      username: account.username,
      password: account.password,
    });
    setSuccess("Demo credentials filled. Click Sign In to continue.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 p-6">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <img src={pestIconLogo} alt="Pest.i Logo" className="h-24 w-24" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Pest.i</h1>
            <p className="text-muted-foreground">Early Warning System</p>
            <p className="text-sm text-muted-foreground mt-2">
              Advanced rice pest monitoring and forecasting platform
            </p>
          </div>
        </div>

        <Card className="p-6 space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-xl 목font-semibold">Welcome Back</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to access your pest monitoring dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  name="username"
                  type="email"
                  placeholder="name@agency.gov"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <h3 className="font-medium">Demo Accounts</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Use these credentials to explore the dashboard quickly:
          </p>

          <div className="space-y-2">
            {demoAccounts.map((account) => (
              <div
                key={account.username}
                className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div>
                  <div className="text-sm font-medium">{account.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {account.username} / {account.password}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin(account)}
                  className="text-xs"
                >
                  Autofill
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <div className="text-center space-y-3">
          <Button variant="link" size="sm" onClick={onShowRegistration}>
            Need access? Request approval
          </Button>
          <Separator />
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Pest.i – Forecasting-Based Early Warning System
          </div>
        </div>
      </div>
    </div>
  );
}
