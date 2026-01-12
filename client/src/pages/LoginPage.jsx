import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/login' : '/api/register';
    
    try {
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (response.ok) {
        alert(isLogin ? "¡Bienvenido a Cinetix!" : "¡Cuenta creada! Ahora inicia sesión.");
        
        if (isLogin) {
          // GUARDAMOS AL USUARIO EN MEMORIA (LocalStorage)
          localStorage.setItem('usuario_cine', JSON.stringify(data.user));
          navigate('/'); 
        } else {
          setIsLogin(true);
        }
      } else {
        setError(data.error || "Error desconocido");
      }
    } catch (err) {
      setError("No se pudo conectar al servidor");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg p-8 border border-gray-700 shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          <span className="text-red-500">.</span>
        </h2>
        {error && <div className="bg-red-500/20 text-red-200 p-3 rounded mb-4 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input name="name" onChange={handleChange} placeholder="Tu nombre" required
              className="w-full bg-gray-700 text-white border border-gray-600 rounded p-3" />
          )}
          <input name="email" type="email" onChange={handleChange} placeholder="Email" required
            className="w-full bg-gray-700 text-white border border-gray-600 rounded p-3" />
          <input name="password" type="password" onChange={handleChange} placeholder="Contraseña" required
            className="w-full bg-gray-700 text-white border border-gray-600 rounded p-3" />
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition">
            {isLogin ? 'Ingresar' : 'Registrarse'}
          </button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4 text-gray-400 hover:text-white text-sm underline">
          {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
        <button onClick={() => navigate('/')} className="w-full mt-2 text-gray-500 hover:text-gray-300 text-xs">
           ← Volver a Cinetix
        </button>
      </div>
    </div>
  );
}