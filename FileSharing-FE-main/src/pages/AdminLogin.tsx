import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authAPI, saveAuthData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.adminLogin({ email, password });
      saveAuthData(response.data, 'admin');
      toast({
        title: 'Success',
        description: 'Admin logged in successfully!',
      });
      navigate('/admin/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Login failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <Link to="/" className="absolute top-4 left-4 animate-fade-in">
        <Button variant="ghost" size="sm" className="transition-all duration-300 hover:scale-105 hover:shadow-md">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </Link>
      <Card className="w-full max-w-md animate-fade-in shadow-xl hover:shadow-2xl transition-shadow duration-300">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <Shield className="h-12 w-12 text-purple-600 animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">Enter your admin credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="transition-all duration-300 focus:scale-[1.02] focus:shadow-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="transition-all duration-300 focus:scale-[1.02] focus:shadow-md"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In as Admin
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an admin account?{' '}
            <Link to="/admin/signup" className="text-purple-600 hover:underline">
              Sign up
            </Link>
          </div>
         
        </CardContent>
      </Card>
    </div>
  );
}
