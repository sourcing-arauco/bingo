const express = require('express');
const path = require('path');
const os = require('os');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON body parsing for API requests
app.use(express.json());

// Serve public static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve the Bluey.mp4 video file from the root directory
app.get('/Bluey.mp4', (req, res) => {
  res.sendFile(path.join(__dirname, 'Bluey.mp4'));
});

// GET endpoint to retrieve stored click zones
app.get('/api/zones', (req, res) => {
  const zonesPath = path.join(__dirname, 'zones.json');
  if (!fs.existsSync(zonesPath)) {
    return res.json([]);
  }
  fs.readFile(zonesPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading zones.json:', err);
      return res.status(500).json({ error: 'Failed to read zones file' });
    }
    try {
      res.json(JSON.parse(data));
    } catch (parseErr) {
      console.error('Error parsing zones.json:', parseErr);
      res.json([]);
    }
  });
});



// Helper to get local IP address
function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const interfaceName in interfaces) {
    const iface = interfaces[interfaceName];
    for (const details of iface) {
      if (details.family === 'IPv4' && !details.internal) {
        addresses.push(details.address);
      }
    }
  }
  return addresses;
}

app.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIPs();
  console.log('==================================================');
  console.log('🎉 ¡App de Sonidos de Bluey iniciada con éxito! 🎉');
  console.log(`💻 Localmente: http://localhost:${PORT}`);
  if (ips.length > 0) {
    console.log('\n📲 Para conectar la tablet de tu hija:');
    console.log('Asegúrate de que la tablet y esta computadora estén en la misma red Wi-Fi.');
    console.log('Luego, abre el navegador en la tablet e ingresa una de estas direcciones:');
    ips.forEach(ip => {
      console.log(`👉 http://${ip}:${PORT}`);
    });
  } else {
    console.log('\n⚠️ No se detectó una IP de red local activa.');
  }
  console.log('==================================================');
});
