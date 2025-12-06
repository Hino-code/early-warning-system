import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle, CheckCircle, Mail, Shield } from "lucide-react";
import type { RegistrationPayload, UserRole } from "@/shared/types/user";
import pestIconLogo from "@/assets/pest-logo-icon.png";

interface RegistrationProps {
  loading?: boolean;
  error?: string;
  onSubmit: (payload: RegistrationPayload) => Promise<void>;
  onBack: () => void;
}

const roles: UserRole[] = ["Researcher", "Field Manager", "Demo User"];

export function RegistrationPage({ loading, error, onSubmit, onBack }: RegistrationProps) {
  const [success, setSuccess] = useState("");
  const [formError, setFormError] = useState<string>();
  const [form, setForm] = useState<RegistrationPayload>({
    name: "",
    email: "",
    agency: "",
    role: "Researcher",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(undefined);
    setSuccess("");
    try {
      await onSubmit(form);
      setSuccess("Registration submitted! Awaiting admin approval.");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Unable to submit registration.",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 p-6">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <img src={pestIconLogo} alt="Pest.i Logo" className="h-24 w-24" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Request Access</h1>
            <p className="text-muted-foreground">
              Submit your agency details for admin approval.
            </p>
          </div>
        </div>

        <Card className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Juan Dela Cruz"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Government Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@agency.gov"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agency">Agency / Office</Label>
              <Input
                id="agency"
                name="agency"
                placeholder="Department of Agriculture Region XII"
                value={form.agency}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Requested Role</Label>
              <Select
                value={form.role}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, role: value as UserRole }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Preferred Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
              />
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

            <div className="flex flex-col gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit for Approval"}
              </Button>
              <Button type="button" variant="ghost" onClick={onBack}>
                Back to Login
              </Button>
            </div>
          </form>
        </Card>

        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            Our team will notify you once an administrator approves your request.
          </p>
          <div className="flex items-center justify-center text-xs text-muted-foreground gap-2">
            <Mail className="h-3 w-3" />
            ews.support@agency.gov.ph
          </div>
        </div>
      </div>
    </div>
  );
}

