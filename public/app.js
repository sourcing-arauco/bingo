// App State
let zones = [];

// Web Audio API note frequencies for fallback
const NOTE_FREQS = {
  'C4': 261.63,
  'E4': 329.63,
  'G4': 392.00,
  'C5': 523.25,
  'E5': 659.25
};

// DOM Elements
const overlayContainer = document.getElementById('overlay-container');

// Init
async function init() {
  await loadZones();
  renderZones();
}

// Load preconfigured zones from zones.json
async function loadZones() {
  try {
    const response = await fetch('/api/zones');
    if (response.ok) {
      zones = await response.json();
      console.log('Loaded zones:', zones);
    }
  } catch (err) {
    console.error('Failed to load zones:', err);
  }
}

// Render invisible hotspot overlay buttons
function renderZones() {
  overlayContainer.innerHTML = '';

  zones.forEach(zone => {
    const hotspot = document.createElement('button');
    hotspot.className = 'hotspot';
    hotspot.id = zone.id;
    
    // Position using percentages
    hotspot.style.left = `${zone.left}%`;
    hotspot.style.top = `${zone.top}%`;
    hotspot.style.width = `${zone.width}%`;
    hotspot.style.height = `${zone.height}%`;
    
    const accentColor = getAccentColor(zone.sound);
    hotspot.style.setProperty('--accent-color', accentColor);

    // Play sound and trigger bubbles on press
    hotspot.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      
      // Visual flash feedback
      hotspot.classList.add('playing');
      setTimeout(() => hotspot.classList.remove('playing'), 100);

      // Trigger Audio & Bubbles
      playAudio(zone.sound, zone.fallbackNote);
      createParticles(e.clientX || e.pageX, e.clientY || e.pageY, accentColor);
    });

    overlayContainer.appendChild(hotspot);
  });
}

// Play audio with Web Audio API fallback chime
function playAudio(soundPath, fallbackNote) {
  if (!soundPath) return;
  
  const audio = new Audio(`/sounds/${soundPath}.mp3`);
  
  audio.play().catch(error => {
    console.log(`Failed to play ${soundPath}.mp3. Using synthesizer chime fallback...`);
    const note = fallbackNote || getFallbackNote(soundPath);
    if (note) {
      playSynthChime(note);
    }
  });
}

// Chime synthesizer
function playSynthChime(noteName) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const baseFreq = NOTE_FREQS[noteName] || 440;
    const now = ctx.currentTime;
    
    const arpeggio = [1.0, 1.25, 1.5]; // Major chord components
    arpeggio.forEach((ratio, index) => {
      const startTime = now + (index * 0.07);
      const duration = 0.6;
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq * ratio, startTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * ratio * 1.01, startTime + duration);
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.02); // attack
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // decay
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch (err) {
    console.error('Synthesizer chime failed:', err);
  }
}

// Bubble particle explosion
function createParticles(x, y, color) {
  if (x === undefined || y === undefined) return;

  const numParticles = 12;
  const colors = [color, '#ffeb3b', '#00e676', '#2979ff', '#ff3d00', '#d500f9'];

  for (let i = 0; i < numParticles; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    const size = Math.floor(Math.random() * 15) + 12; // 12px to 27px
    
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    particle.style.left = `${x - size / 2}px`;
    particle.style.top = `${y - size / 2}px`;
    
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 130 + 70;
    const dx = Math.cos(angle) * velocity;
    const dy = Math.sin(angle) * velocity;
    
    particle.style.setProperty('--dx', `${dx}px`);
    particle.style.setProperty('--dy', `${dy}px`);
    
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 800);
  }
}



// Colors and notes helpers
function getAccentColor(soundPath) {
  if (soundPath.includes('bluey')) return '#1565c0';
  if (soundPath.includes('bingo')) return '#e65100';
  if (soundPath.includes('bandit')) return '#37474f';
  if (soundPath.includes('chilli')) return '#d84315';
  if (soundPath.includes('muffin')) return '#7e57c2';
  if (soundPath.includes('animals/duck')) return '#fbc02d';
  if (soundPath.includes('animals/frog')) return '#2e7d32';
  if (soundPath.includes('animals/elephant')) return '#0288d1';
  return '#e91e63';
}

function getFallbackNote(soundPath) {
  if (soundPath.includes('bluey')) return 'C4';
  if (soundPath.includes('bingo')) return 'E4';
  if (soundPath.includes('bandit')) return 'G4';
  if (soundPath.includes('chilli')) return 'C5';
  if (soundPath.includes('muffin')) return 'E5';
  return null;
}

// Start
init();

// Register Service Worker for PWA (Installable App)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registered successfully!', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}

// Fullscreen API Logic
const fullscreenBtn = document.getElementById('fullscreen-btn');

fullscreenBtn.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  toggleFullscreen();
});

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
      .then(() => {
        fullscreenBtn.textContent = '❌'; // change icon to close in fullscreen
      })
      .catch(err => console.error('Error entering fullscreen:', err));
  } else {
    document.exitFullscreen()
      .then(() => {
        fullscreenBtn.textContent = '⛶';
      })
      .catch(err => console.error('Error exiting fullscreen:', err));
  }
}

// Automatic Fullscreen on First Tap (User Gesture)
document.addEventListener('pointerdown', (e) => {
  // Ignore if they clicked the fullscreen button itself
  if (e.target === fullscreenBtn) return;
  
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
      .then(() => {
        fullscreenBtn.textContent = '❌';
      })
      .catch(err => console.log('Auto-fullscreen blocked or failed:', err));
  }
}, { once: true }); // triggers only once

