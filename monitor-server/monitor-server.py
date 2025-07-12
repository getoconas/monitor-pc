from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import psutil
import socket
import time

# Para manejar volumen en Windows
from ctypes import POINTER, cast
from comtypes import CLSCTX_ALL
from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume

app = Flask(__name__, static_folder='build', static_url_path='')
CORS(app)

def get_volume():
  try:
    devices = AudioUtilities.GetSpeakers()
    interface = devices.Activate(IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
    volume = cast(interface, POINTER(IAudioEndpointVolume))
    current_volume = volume.GetMasterVolumeLevelScalar()  # Escalar entre 0.0 y 1.0
    muted = volume.GetMute()
    return {
      'volume_percent': int(current_volume * 100),
      'muted': bool(muted)
    }
  except Exception as e:
      return {'error': str(e)}

@app.route('/status')
def status():
  try:
    cpu = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    net_io = psutil.net_io_counters()
    ip = socket.gethostbyname(socket.gethostname())

    return jsonify({
      'cpu': {
        'percent': cpu,
        'cores': psutil.cpu_count(),
        'freq_mhz': psutil.cpu_freq().current
      },
      'memory': {
        'total_mb': memory.total // (1024 * 1024),
        'used_percent': memory.percent
      },
      'disk': {
        'used_percent': disk.percent,
        'total_gb': disk.total // (1024 ** 3),
        'free_gb': disk.free // (1024 ** 3)
      },
      'network': {
        'ip_address': ip,
        'bytes_sent': net_io.bytes_sent,
        'bytes_recv': net_io.bytes_recv
      },
      'system': {
        'boot_time': time.ctime(psutil.boot_time())
      }
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
