import { useEffect, useState } from 'react';
import './App.css';

/* App general */
function App() {
  const [ip, setIp] = useState(localStorage.getItem('serverIp') || '');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (!ip) return;

    const interval = setInterval(() => {
      fetch(`http://${ip}:5000/status`)
        .then(res => res.json())
        .then(data => {
          setData(data);
          setError('');
        })
        .catch((err) => {
          setError('No se pudo conectar con el servidor.');
          console.error(err);
        });
    }, 5000); // cada 5 segundos

    return () => clearInterval(interval);
  }, [ip]);

  const handleIpChange = (e) => {
    const newIp = e.target.value;
    setIp(newIp);
    localStorage.setItem('serverIp', newIp);
  };

  return (
    <div className="App">
      <h1>Monitor de PC</h1>

      <input
        type="text"
        placeholder="IP del servidor (ej. 192.168.1.64)"
        value={ip}
        onChange={handleIpChange}
        style={{ padding: '8px', fontSize: '16px' }}
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {data && (
         <div style={{ marginTop: '20px', textAlign: 'left' }}>
          <p><strong>CPU:</strong> {data.cpu.percent}% ({data.cpu.cores} núcleos a {data.cpu.freq_mhz} MHz)</p>
          <p><strong>RAM:</strong> {data.memory.used_percent}% de {data.memory.total_mb} MB</p>
          <p><strong>Disco:</strong> {data.disk.used_percent}% usado ({data.disk.free_gb} GB libres de {data.disk.total_gb})</p>
          <p><strong>IP:</strong> {data.network.ip_address}</p>
          <p><strong>Bytes enviados:</strong> {data.network.bytes_sent}</p>
          <p><strong>Bytes recibidos:</strong> {data.network.bytes_recv}</p>
          <p><strong>Encendido desde:</strong> {data.system.boot_time}</p>
        </div>
      )}
    </div>
  );
}

export default App;
