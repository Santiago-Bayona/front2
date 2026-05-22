import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Perfil from './components/Perfil';
import Mapa from './components/Mapa';
import MisColas from './components/MisColas';
import FavoritosHistorial from './components/FavoritosHistorial';
import '../styles/VisitanteDashboard.css';

const API_URL = 'http://localhost:8080/api';

export default function VisitanteDashboard() {
  const [activeTab, setActiveTab] = useState('perfil');
  const [visitante, setVisitante] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    verificarRolYCargarDatos();
  }, []);

  const verificarRolYCargarDatos = async () => {
    try {
      const token = localStorage.getItem('token');
      const usuarioId = localStorage.getItem('usuarioId');
      const rol = localStorage.getItem('rol');

      // Verificar que sea visitante
      if (rol !== 'VISITANTE') {
        navigate('/');
        return;
      }

      // Obtener datos del visitante
      const response = await fetch(`${API_URL}/usuarios/perfil/${usuarioId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVisitante(data.data);
      } else if (response.status === 401) {
        localStorage.clear();
        navigate('/');
      }
    } catch (error) {
      console.error('Error cargando datos del visitante:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      localStorage.clear();
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!visitante) {
    return (
      <div className="error-container">
        <p>Error al cargar los datos. Por favor intenta nuevamente.</p>
      </div>
    );
  }

  return (
    <div className="visitante-dashboard">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        visitanteName={visitante.nombre}
      />

      <div className="main-content">
        {activeTab === 'perfil' && <Perfil visitante={visitante} onUpdate={verificarRolYCargarDatos} />}
        {activeTab === 'mapa' && <Mapa visitante={visitante} />}
        {activeTab === 'colas' && <MisColas visitante={visitante} />}
        {activeTab === 'favoritos' && <FavoritosHistorial visitante={visitante} />}
      </div>
    </div>
  );
}