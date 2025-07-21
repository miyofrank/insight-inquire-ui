
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string()
    .min(1, 'El email es obligatorio')
    .email('Formato de email inválido'),
  password: z.string()
    .min(1, 'La contraseña es obligatoria'),
});

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockUntil, setBlockUntil] = useState<number | null>(null);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Verificar si el usuario está bloqueado
  const checkBlocked = () => {
    if (blockUntil && Date.now() < blockUntil) {
      const remainingTime = Math.ceil((blockUntil - Date.now()) / 1000);
      toast.error(`Cuenta bloqueada temporalmente. Intenta en ${remainingTime} segundos`);
      return true;
    }
    if (blockUntil && Date.now() >= blockUntil) {
      setIsBlocked(false);
      setBlockUntil(null);
      setFailedAttempts(0);
    }
    return false;
  };

  const handleFailedAttempt = () => {
    const newFailedAttempts = failedAttempts + 1;
    setFailedAttempts(newFailedAttempts);
    
    if (newFailedAttempts >= 5) {
      const blockTime = Date.now() + (30 * 1000); // 30 segundos de bloqueo
      setIsBlocked(true);
      setBlockUntil(blockTime);
      toast.error('Demasiados intentos fallidos. Cuenta bloqueada por 30 segundos');
    } else {
      toast.error(`Credenciales incorrectas. ${5 - newFailedAttempts} intentos restantes`);
    }
  };

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    if (checkBlocked()) return;

    setLoading(true);
    
    try {
      // Autenticar con Firebase
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      // Reiniciar contadores en login exitoso
      setFailedAttempts(0);
      setIsBlocked(false);
      setBlockUntil(null);
      
      // Obtener el ID token
      const idToken = await user.getIdToken();
      
      // Enviar token al backend para validación
      const response = await fetch('https://backend-survey-phb2.onrender.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        handleFailedAttempt();
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Tu contraseña"
                          {...field}
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading || isBlocked}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>
          </Form>

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
