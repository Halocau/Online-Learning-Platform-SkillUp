import { LoginForm } from '@/components/login-form';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement real authentication
    // For demo, just save a token and navigate
    localStorage.setItem('token', 'demo-token');
    navigate('/dashboard');
  };

  return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-blue-50">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}

export default Login;