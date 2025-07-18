from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import psutil
import socket
import time

app = Flask(__name__, static_folder='build', static_url_path='')
CORS(app)

@app.route('/status')
def status():
  try:
    cpu = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    net_io = psutil.net_io_counters()
    ip = socket.gethostbyname(socket.gethostname())

    return jsonify({
      'cpu': {
        'percent': cpu,
        'cores': psutil.cpu_count(),
        'freq_mhz': psutil.cpu_freq().current
      },
      'memory': {
        'current_mb': memory.used // (1024 * 1024),
        'total_mb': memory.total // (1024 * 1024),
        'used_percent': memory.percent
      },
      'network': {
        'ip_address': ip,
        'bytes_sent_mb': net_io.bytes_sent // (1024 * 1024),
        'bytes_recv_mb': net_io.bytes_recv // (1024 * 1024)
      },
      'system': {
        'boot_time': time.ctime(psutil.boot_time()),
        'uptime': "{:02}:{:02}:{:02}".format(
          int((time.time() - psutil.boot_time()) // 3600),
          int(((time.time() - psutil.boot_time()) % 3600) // 60),
          int((time.time() - psutil.boot_time()) % 60)
        )
      },
    })
  except Exception as e:
    return jsonify({'error': str(e)}), 500

@app.route('/processes')
def processes():
  try:
    procs = []
    for p in psutil.process_iter(['pid', 'name', 'username']):
      procs.append(p.info)
    return jsonify(procs)
  except Exception as e:
    return jsonify({'error': str(e)}), 500

# Ruta para servir el index.html de React
@app.route('/')
def serve_index():
  return send_from_directory(app.static_folder, 'index.html')

# Para cualquier ruta desconocida, devolver index.html (rutas internas de React)
@app.errorhandler(404)
def not_found(e):
  return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
  # Escuchar desde cualquier IP de tu red local
  app.run(host='0.0.0.0', port=5000, debug=False)
