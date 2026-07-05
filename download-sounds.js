const fs = require('fs');
const path = require('path');
const https = require('https');

const dirs = [
  path.join(__dirname, 'public'),
  path.join(__dirname, 'public', 'sounds'),
  path.join(__dirname, 'public', 'sounds', 'animals'),
  path.join(__dirname, 'public', 'sounds', 'characters')
];

// Ensure directories exist
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Creada carpeta: ${dir}`);
  }
});

const animalSounds = {
  'chicken.mp3': 'https://raw.githubusercontent.com/SixStringsCoder/matching_game/master/audio/animals/chicken.mp3',
  'cow.mp3': 'https://raw.githubusercontent.com/SixStringsCoder/matching_game/master/audio/animals/cow.mp3',
  'dog.mp3': 'https://raw.githubusercontent.com/SixStringsCoder/matching_game/master/audio/animals/dog.mp3',
  'duck.mp3': 'https://raw.githubusercontent.com/SixStringsCoder/matching_game/master/audio/animals/duck.mp3',
  'elephant.mp3': 'https://raw.githubusercontent.com/SixStringsCoder/matching_game/master/audio/animals/elephant.mp3',
  'frog.mp3': 'https://raw.githubusercontent.com/SixStringsCoder/matching_game/master/audio/animals/frog.mp3',
  'goat.mp3': 'https://raw.githubusercontent.com/SixStringsCoder/matching_game/master/audio/animals/goat.mp3',
  'horse.mp3': 'https://raw.githubusercontent.com/SixStringsCoder/matching_game/master/audio/animals/horse.mp3',
  'sheep.mp3': 'https://raw.githubusercontent.com/SixStringsCoder/matching_game/master/audio/animals/sheep.mp3',
  'wolf.mp3': 'https://raw.githubusercontent.com/SixStringsCoder/matching_game/master/audio/animals/wolf.mp3'
};

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: HTTP Status ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {}); // Delete local file on error
      reject(err);
    });
  });
}

async function startDownload() {
  console.log('Iniciando la descarga de sonidos de animales...');
  
  for (const [filename, url] of Object.entries(animalSounds)) {
    const destPath = path.join(__dirname, 'public', 'sounds', 'animals', filename);
    if (fs.existsSync(destPath)) {
      console.log(`[Saltado] ${filename} ya existe.`);
      continue;
    }
    
    try {
      console.log(`[Descargando] ${filename} desde ${url}...`);
      await downloadFile(url, destPath);
      console.log(`[Completado] ${filename} guardado con éxito.`);
    } catch (error) {
      console.error(`[Error] No se pudo descargar ${filename}:`, error.message);
    }
  }
  
  console.log('\nProceso de descarga finalizado.');
  console.log('Los sonidos de animales han sido guardados en public/sounds/animals/');
  console.log('Recuerda colocar los sonidos personalizados para los personajes de Bluey (bluey.mp3, bingo.mp3, bandit.mp3, chilli.mp3, muffin.mp3) en public/sounds/characters/');
}

startDownload();
