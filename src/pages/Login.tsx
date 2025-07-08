
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Por favor, completa todos los campos');
      return;
    }

    setLoading(true);
    
    try {
      // Autenticar con Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Obtener el ID token
      const idToken = await user.getIdToken();
      
      // Enviar token al backend para validación y obtener datos del usuario
      const response = await fetch('https://backend-survey-phb2.onrender.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          token: idToken
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        
        // Guardar el token y datos del usuario
        localStorage.setItem('authToken', idToken);
        localStorage.setItem('user', JSON.stringify({
          uid: user.uid,
          email: user.email,
          name: user.displayName || userData.name || user.email,
          ...userData
        }));
        
        toast.success('¡Bienvenido!');
        navigate('/');
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Error al validar con el servidor');
      }
    } catch (error: any) {
      console.error('Error de login:', error);
      
      // Manejar errores específicos de Firebase
      if (error.code === 'auth/user-not-found') {
        toast.error('Usuario no encontrado');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Contraseña incorrecta');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Email inválido');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Demasiados intentos fallidos. Intenta más tarde');
      } else {
        toast.error('Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-[150px] h-auto mx-auto mb-4">
            <img
              src="https://eficientis.com/wp-content/uploads/2024/03/image-18.webp"
              alt="Logo Eficientis"
              className="w-full h-auto object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Iniciar Sesión
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Button
                variant="link"
                className="p-0 h-auto font-medium text-blue-600"
                onClick={() => navigate('/register')}
              >
                Regístrate aquí
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
