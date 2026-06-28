// Import / export — la « sauvegarde annuelle » sous forme de fichier JSON.
import { getState, replaceState } from '../store.js';

export function exportJSON() {
  const state = getState();
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const annee = (state.annee || 'annee').replace(/\W+/g, '-');
  a.href = url;
  a.download = `coordination-psr-${annee}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function importJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || !Array.isArray(data.aesh) || !Array.isArray(data.seances))
          throw new Error('Fichier non reconnu (structure invalide).');
        replaceState(data);
        resolve(data);
      } catch (e) { reject(e); }
    };
    reader.onerror = () => reject(new Error('Lecture du fichier impossible.'));
    reader.readAsText(file);
  });
}

export function triggerImport() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = () => {
      const f = input.files && input.files[0];
      if (f) importJSONFile(f).then(resolve).catch(reject);
    };
    input.click();
  });
}
