import { useState, useRef } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import './App.css';

/* App general */
function App() {
  const [ip, setIp] = useState(localStorage.getItem('serverIp') || '');
  const [monitoring, setMonitoring] = useState(false);
  const [dataHistory, setDataHistory] = useState([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(null);

  const intervalRef = useRef(null);
  
  const handleIpChange = (e) => {
    const newIp = e.target.value;
    setIp(newIp);
    localStorage.setItem('serverIp', newIp);
  };

  const fetchStatus = () => {
    fetch(`http://${ip}:5000/status`)
      .then((res) => res.json())
      .then((data) => {
        setStatus(data);
        const newEntry = {
          time: new Date().toLocaleTimeString(),
          cpu: data.cpu.percent,
          ram: data.memory.used_percent,
        };
        setDataHistory((prev) => [...prev, newEntry].slice(-20));
        setError('');
      })
      .catch((err) => {
        setError('No se pudo conectar con el servidor.');
        stopMonitoring();
      });
  };

  const startMonitoring = () => {
    if (!ip) return;
    setMonitoring(true);
    fetchStatus(); // primera vez inmediata
    intervalRef.current = setInterval(fetchStatus, 5000);
  };

  const stopMonitoring = () => {
    setMonitoring(false);
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  return (
    <div className="min-h-screen bg-indigo-100 flex flex-col items-center py-8">
      <h1 className="text-4xl font-bold mb-4 text-gray-800">Monitor de PC</h1>

      <div className="mb-2 flex flex-col items-center">
        <input type="text" placeholder="192.168.1.64" value={ip} onChange={handleIpChange} disabled={monitoring} className="p-2 border rounded bg-yellow-50 focus:bg-white w-72 text-lg mb-2" />
        <div>
          <button onClick={startMonitoring} disabled={monitoring || !ip} className="bg-blue-600 text-white px-4 py-2 rounded mr-2 disabled:opacity-50" >Iniciar monitoreo</button>
          <button onClick={stopMonitoring} disabled={!monitoring} className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50" >Detener monitoreo</button>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {status && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-8 mt-2">
          <div className="bg-green-50 rounded shadow p-4">
            <h2 className="text-xl font-semibold mb-2">CPU</h2>
            <p><b>Núcleos:</b> {status.cpu.cores}</p>
            <p><b>Frecuencia:</b> {status.cpu.freq_mhz} MHz</p>
            <p><b>Uso:</b> {status.cpu.percent} %</p>
          </div>
          <div className="bg-green-50 rounded shadow p-4">
            <h2 className="text-xl font-semibold mb-2">Memoria</h2>
            <p><b>Usada:</b> {status.memory.current_mb} MB</p>
            <p><b>Total:</b> {status.memory.total_mb} MB</p>
            <p><b>Porcentaje:</b> {status.memory.used_percent} %</p>
          </div>
          <div className="bg-green-50 rounded shadow p-4">
            <h2 className="text-xl font-semibold mb-2">Red</h2>
            <p><b>IP:</b> {status.network.ip_address}</p>
            <p><b>Enviados:</b> {status.network.bytes_sent_mb} MB</p>
            <p><b>Recibidos:</b> {status.network.bytes_recv_mb} MB</p>
          </div>
          <div className="bg-green-50 rounded shadow p-4">
            <h2 className="text-xl font-semibold mb-2">Sistema</h2>
            <p><b>Arranque:</b> {status.system.boot_time}</p>
            <p><b>Uptime:</b> {status.system.uptime}</p>
          </div>
          <div className="bg-green-50 rounded shadow p-4 md:col-span-2 w-full">
            <h2 className="text-xl font-semibold mb-4">Uso de CPU y RAM</h2>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 100]} unit="%" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cpu" name="CPU %" stroke="#2563eb" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="ram" name="RAM %" stroke="#16a34a" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
