import { useState } from "react";
import { adminApi, setAdminToken } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Coffee } from "lucide-react";

interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await adminApi.post<{ token: string }>("/api/admin/login", { password });
      setAdminToken(result.token);
      onLogin();
    } catch {
      setError("Invalid password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#4A3728" }}>
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ background: "#8DB53C" }}
          >
            <Coffee className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="mt-1" style={{ color: "#C8A42A" }}>
            Africa Coffee &amp; Tea Expo 2026
          </p>
        </div>
        <div className="rounded-xl p-8 shadow-2xl" style={{ background: "#FAF7F2" }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="password" className="text-sm font-medium" style={{ color: "#4A3728" }}>
                Admin Password
              </Label>
              <div className="relative mt-1.5">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#7B6B58" }}
                />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="pl-9"
                  style={{ borderColor: "#7B6B58" }}
                  required
                />
              </div>
            </div>
            {error ? (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              className="w-full text-white font-semibold py-2.5"
              style={{ background: "#4A3728" }}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
        <p className="text-center mt-4 text-sm" style={{ color: "#FAF7F2", opacity: 0.6 }}>
          Restricted access — authorized personnel only
        </p>
      </div>
    </div>
  );
}
