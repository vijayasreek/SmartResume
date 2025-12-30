import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FileText, Sparkles } from 'lucide-react';

interface AuthPageProps {
  type: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ type }) => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register: formRegister, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setError('');
    setIsLoading(true);
    try {
      if (type === 'login') {
        await login(data.email, data.password);
      } else {
        await register(data.name, data.email, data.password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      // Try to login with demo creds first
      try {
        await login('demo@example.com', 'password123');
      } catch {
        // If login fails (user doesn't exist), register them
        await register('Demo User', 'demo@example.com', 'password123');
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError('Demo login failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {type === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {type === 'login' ? 'Sign in to access your resumes' : 'Start building your professional resume today'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {type === 'register' && (
              <Input
                label="Full Name"
                {...formRegister('name', { required: 'Name is required' })}
                error={errors.name?.message as string}
                placeholder="John Doe"
                autoComplete="name"
              />
            )}
            <Input
              label="Email address"
              type="email"
              {...formRegister('email', { 
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
              })}
              error={errors.email?.message as string}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              {...formRegister('password', { 
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
              error={errors.password?.message as string}
              placeholder="••••••••"
              autoComplete={type === 'login' ? "current-password" : "new-password"}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            {type === 'login' ? 'Sign in' : 'Create account'}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or try quickly</span>
            </div>
          </div>

          <Button 
            type="button" 
            variant="secondary" 
            className="w-full" 
            onClick={handleDemoLogin}
            isLoading={isLoading}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Demo Account (Skip Auth)
          </Button>

          <div className="text-center text-sm mt-4">
            <span className="text-gray-500">
              {type === 'login' ? "Don't have an account? " : "Already have an account? "}
            </span>
            <Link 
              to={type === 'login' ? '/register' : '/login'} 
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {type === 'login' ? 'Sign up' : 'Log in'}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
