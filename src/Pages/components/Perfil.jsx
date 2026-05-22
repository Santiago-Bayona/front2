import { useState } from 'react';
import '../../styles/Perfil.css';

const API_URL = 'http://localhost:8080/api';

export default function Perfil({ visitante, onUpdate }) {
  const [showRecargar, setShowRecargar] = useState(false);
  const [showCambiarPassword, setShowCambiarPassword] = useState(false);
  const [monto, setMonto] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRecargarSaldo = async (e) => {
    e.preventDefault();
    if (!monto || monto <= 0) {
      setMessage('Por favor ingresa un monto válido');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/usuarios/recargar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          monto: parseFloat(monto),
        }),
      });

      if (response.ok) {
        setMessage('✅ Saldo recargado exitosamente');
        setMonto('');
        setShowRecargar(false);
        setTimeout(onUpdate, 1500);
      } else {
        setMessage('❌ Error al recargar saldo');
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('❌ Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage('❌ La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/cambiar-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passwordActual: passwordData.currentPassword,
          passwordNueva: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        setMessage('✅ Contraseña actualizada exitosamente');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowCambiarPassword(false);
      } else {
        const data = await response.json();
        setMessage('❌ ' + (data.message || 'Error al cambiar contraseña'));
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const tipoTicketColor = {
    'GENERAL': '#3498db',
    'FAMILIAR': '#e74c3c',
    'FAST_PASS': '#f39c12',
  };

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <h2>👤 Mi Perfil</h2>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {/* Información Personal */}
      <div className="info-card">
        <h3>📋 Información Personal</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>Nombre:</label>
            <p>{visitante.nombre}</p>
          </div>
          <div className="info-item">
            <label>Email:</label>
            <p>{visitante.email}</p>
          </div>
          <div className="info-item">
            <label>Documento:</label>
            <p>{visitante.documento}</p>
          </div>
          <div className="info-item">
            <label>Edad:</label>
            <p>{visitante.edad} años</p>
          </div>
          <div className="info-item">
            <label>Estatura:</label>
            <p>{visitante.estatura} m</p>
          </div>
        </div>
      </div>

      {/* Información de Visitante */}
      <div className="info-card">
        <h3>🎢 Información de Visitante</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>Tipo de Ticket:</label>
            <p style={{ 
              backgroundColor: tipoTicketColor[visitante.ticketActivo], 
              color: 'white',
              padding: '8px 12px',
              borderRadius: '5px',
              display: 'inline-block'
            }}>
              {visitante.ticketActivo}
            </p>
          </div>
          <div className="info-item">
            <label>Ubicación Actual:</label>
            <p>{visitante.ubicacionActual || 'Entrada Principal'}</p>
          </div>
        </div>
      </div>

      {/* Saldo Virtual */}
      <div className="info-card">
        <h3>💰 Saldo Virtual</h3>
        <div className="saldo-info">
          <div className="saldo-display">
            <span className="saldo-label">Saldo Disponible:</span>
            <span className="saldo-amount">
              ${visitante.saldoVirtual?.toFixed(2) || '0.00'}
            </span>
          </div>
          <button 
            className="btn-recargar"
            onClick={() => {
              setShowRecargar(!showRecargar);
              setMessage('');
            }}
          >
            💳 Recargar Saldo
          </button>
        </div>

        {showRecargar && (
          <form onSubmit={handleRecargarSaldo} className="recargar-form">
            <input
              type="number"
              step="0.01"
              min="1"
              placeholder="Ingresa el monto a recargar"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              required
            />
            <div className="form-buttons">
              <button type="submit" disabled={loading} className="btn-confirm">
                {loading ? 'Procesando...' : 'Confirmar'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowRecargar(false);
                  setMonto('');
                }} 
                className="btn-cancel"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Cambiar Contraseña */}
      <div className="info-card">
        <h3>🔐 Seguridad</h3>
        <button 
          className="btn-cambiar-password"
          onClick={() => {
            setShowCambiarPassword(!showCambiarPassword);
            setMessage('');
          }}
        >
          🔑 Cambiar Contraseña
        </button>

        {showCambiarPassword && (
          <form onSubmit={handleCambiarPassword} className="password-form">
            <input
              type="password"
              placeholder="Contraseña actual"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
              required
            />
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
              required
            />
            <input
              type="password"
              placeholder="Confirmar nueva contraseña"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              required
            />
            <div className="form-buttons">
              <button type="submit" disabled={loading} className="btn-confirm">
                {loading ? 'Procesando...' : 'Cambiar Contraseña'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowCambiarPassword(false);
                  setPasswordData({currentPassword: '', newPassword: '', confirmPassword: ''});
                }} 
                className="btn-cancel"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}