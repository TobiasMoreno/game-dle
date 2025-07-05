const fs = require('fs');

// Mapeo de arcos a IDs
const arcosMapping = {
    "Romance Dawn": 1,
    "Orange Town": 2,
    "Syrup Village": 3,
    "Baratie": 4,
    "Arlong Park": 5,
    "Loguetown": 6,
    "Reverse Mountain": 7,
    "Whisky Peak": 8,
    "Little Garden": 9,
    "Drum Island": 10,
    "Arabasta": 11,
    "Jaya": 12,
    "Skypiea": 13,
    "Long Ring\nLong Land": 14,
    "Long Ring Long Land": 14,
    "Water 7": 15,
    "Enies Lobby": 16,
    "Post-Enies Lobby": 17,
    "Thriller Bark": 18,
    "Sabaody Archipelago": 19,
    "Amazon Lily": 20,
    "Impel Down": 21,
    "Marineford": 22,
    "Post-War": 23,
    "Return to Sabaody": 24,
    "Fish-Man Island": 25,
    "Punk Hazard": 26,
    "Dressrosa": 27,
    "Zou": 28,
    "Whole Cake Island": 29,
    "Reverie": 30,
    "Wano Country": 31,
    "Egghead": 32
};

// Leer el archivo de personajes
const personajesData = fs.readFileSync('public/personajes_one_piece.json', 'utf8');
const personajes = JSON.parse(personajesData);

// Actualizar cada personaje
personajes.forEach(personaje => {
    const primerArco = personaje.primer_arco;
    const arcoId = arcosMapping[primerArco];
    
    if (arcoId) {
        personaje.primer_arco_id = arcoId;
    } else {
        console.log(`Arco no encontrado para ${personaje.nombre}: "${primerArco}"`);
        personaje.primer_arco_id = null;
    }
});

// Guardar el archivo actualizado
fs.writeFileSync('public/personajes_one_piece.json', JSON.stringify(personajes, null, 4));
console.log('Archivo actualizado exitosamente'); 