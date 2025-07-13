import { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import './App.css';

/* App general */
function App() {
  const [ip, setIp] = useState(localStorage.getItem('serverIp') || '');
  const [monitoring, setMonitoring] = useState(false);
  const [dataHistory, setDataHistory] = useState([]);
  const [error, setError] = useState('');

  const intervalRef = useRef(null);
  
  /*useEffect(() => {
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
  }, [ip]);*/

  const handleIpChange = (e) => {
    const newIp = e.target.value;
    setIp(newIp);
    localStorage.setItem('serverIp', newIp);
  };

  const fetchStatus = () => {
    fetch(`http://${ip}:5000/status`)
      .then((res) => res.json())
      .then((data) => {
        const newEntry = {
          time: new Date().toLocaleTimeString(),
          cpu: data.cpu.percent,
          ram: data.memory.used_percent,
        };

        setDataHistory((prev) => {
          const updated = [...prev, newEntry].slice(-20);
          return updated;
        });
        setError('');
      })
      .catch((err) => {
        setError('No se pudo conectar con el servidor.');
        console.error(err);
        stopMonitoring(); // detener en caso de error
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
    <div className="App">
      <h1>Monitor de PC</h1>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="192.168.1.64"
          value={ip}
          onChange={handleIpChange}
          disabled={monitoring}
          style={{ padding: '8px', fontSize: '16px', width: '300px' }}
        />
      </div>

      <div>
        <button
          onClick={startMonitoring}
          disabled={monitoring || !ip}
          style={{ padding: '10px 20px', marginRight: '10px' }}
        >
          Iniciar monitoreo
        </button>
        <button
          onClick={stopMonitoring}
          disabled={!monitoring}
          style={{ padding: '10px 20px' }}
        >
          Detener monitoreo
        </button>
      </div>

      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

      <div style={{ marginTop: '40px' }}>
        <h2>Uso de CPU y RAM</h2>
        <LineChart width={700} height={300} data={dataHistory}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis domain={[0, 100]} unit="%" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="cpu" name="CPU %" stroke="#8884d8" />
          <Line type="monotone" dataKey="ram" name="RAM %" stroke="#82ca9d" />
        </LineChart>
      </div>
    </div>
  );
}

export default App;
