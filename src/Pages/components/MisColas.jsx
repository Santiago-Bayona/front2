import { useEffect, useState } from 'react';
import '../../styles/MisColas.css';

const API_URL = 'http://localhost:8080/api';
const WS_URL = 'ws://localhost:8080/ws';

export default function MisColas({ visitante }) {
  const [colas, setColas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [notificacion, setNotificacion] = useState(null);

  useEffect(() => {
    cargarColas();
    conectarWebSocket();

    return () => {
      // Limpiar WebSocket
    };
  }, []);

  const cargarColas = async () => {
    try {
      const token = localStorage.getItem('token');
      const usuarioId = localStorage.getItem('usuarioId');

      const response = await fetch(`${API_URL}/colas/usuario/${usuarioId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setColas(data.data || []);
      }
    } catch (error) {
      console.error('Error cargando colas:', error);
      setMensaje('Error al cargar colas');
    } finally {
      setLoading(false);
    }
  };

  const conectarWebSocket = () => {
    try {
      const token = localStorage.getItem('token');
      const ws = new WebSocket(`${WS_URL}/clima?token=${token}`);

      ws.onopen = () => {
        console.log('WebSocket conectado');
      };

      ws.onmessage = (event) => {
        const alerta = JSON.parse(event.data);
        if (alerta.tipo === 'CLIMA_ALERTA') {
          setNotificacion({
            tipo: 'alerta',
            mensaje: alerta.mensaje,
            atracciones: alerta.atraccionesAfectadas,
          });

          // Auto-ocultar después de 5 segundos
          setTimeout(() => setNotificacion(null), 5000);
        }
      };

      ws.onerror = (error) => {
        console.error('Error WebSocket:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket cerrado');
      };

      return ws;
    } catch (error) {
      console.error('Error conectando WebSocket:', error);
    }
  };

  const cancelarCola = async (colaId) => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar esta cola?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/colas/cancelar/${colaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMensaje('✅ Cola cancelada');
        cargarColas();
      } else {
        setMensaje('❌ Error al cancelar cola');
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje('❌ Error al cancelar cola');
    }
  };

  const tieneTicketCola = (cola) => {
    const tiempoRestante = new Date(cola.horaIngresoCola).getTime() + cola.tiempoEsperaReal * 60000 - Date.now();
    return tiempoRestante > 0;
  };

  if (loading) {
    return <div className="colas-container"><p>Cargando colas...</p></div>;
  }

  return (
    <div className="colas-container">
      <div className="colas-header">
        <h2>⏳ Mis Colas Activas</h2>
        <p>Manage your queue positions and wait times</p>
      </div>

      {notificacion && (
        <div className="notificacion-alerta">
          <span className="close" onClick={() => setNotificacion(null)}>✕</span>
          <h4>⚠️ Alerta Climática</h4>
          <p>{notificacion.mensaje}</p>
        </div>
      )}

      {mensaje && (
        <div className={`mensaje ${mensaje.includes('✅') ? 'success' : 'error'}`}>
          {mensaje}
        </div>
      )}

      {colas.length === 0 ? (
        <div className="empty-state">
          <p>📭 No tienes colas activas</p>
          <p className="subtext">¡Dirígete al mapa y únete a tus atracciones favoritas!</p>
        </div>
      ) : (
        <div className="colas-list">
          {colas.map((cola) => (
            <div key={cola.id} className="cola-card">
              <div className="cola-header">
                <h3>{cola.atraccion.nombre}</h3>
                <span className={`badge ${cola.prioridad === 1 ? 'fast-pass' : 'general'}`}>
                  {cola.prioridad === 1 ? '⚡ Fast-Pass' : '👥 General'}
                </span>
              </div>

              <div className="cola-info">
                <div className="info-item">
                  <span className="label">📍 Posición en cola:</span>
                  <span className="value">#{cola.posicion} de ~50</span>
                </div>

                <div className="info-item">
                  <span className="label">⏱️ Tiempo estimado:</span>
                  <span className="value">{cola.atraccion.tiempoEsperaEstimado || 'N/A'} minutos</span>
                </div>

                <div className="info-item">
                  <span className="label">🎢 Tipo atracción:</span>
                  <span className="value">{cola.atraccion.tipo}</span>
                </div>

                <div className="info-item">
                  <span className="label">📅 Hora ingreso:</span>
                  <span className="value">
                    {new Date(cola.horaIngresoCola).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${(cola.posicion / 50) * 100}%` }}
                ></div>
              </div>

              <div className="cola-buttons">
                <button 
                  onClick={() => cancelarCola(cola.id)}
                  className="btn-cancelar"
                >
                  ❌ Cancelar Cola
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}