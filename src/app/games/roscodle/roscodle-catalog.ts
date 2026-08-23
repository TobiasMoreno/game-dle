import { RoscoCategoryOption, RoscoLeagueOption } from './roscodle.models';

export const ROSCO_GENERAL_CATEGORIES: RoscoCategoryOption[] = [
  { id: 'players', eyebrow: 'Vestuario', title: 'Jugadores', description: 'Leyendas, figuras actuales y campeones del mundo.', icon: 'fa-shirt' },
  { id: 'teams', eyebrow: 'Tribuna', title: 'Equipos', description: 'Clubes históricos de Argentina, Europa y el mundo.', icon: 'fa-shield-halved' },
];

export const ROSCO_LEAGUES: RoscoLeagueOption[] = [
  {
    id: 'argentina', name: 'Liga Argentina', country: 'Argentina', accent: '#75aadb',
    description: 'Los cinco grandes y el clásico cordobés.',
    categories: [
      { id: 'boca', eyebrow: 'Azul y oro', title: 'Boca Juniors', description: 'Ídolos, títulos y recuerdos del Xeneize.', icon: 'fa-star' },
      { id: 'river', eyebrow: 'La banda roja', title: 'River Plate', description: 'Glorias, copas y leyendas del Millonario.', icon: 'fa-monument' },
      { id: 'independiente', eyebrow: 'Rey de Copas', title: 'Independiente', description: 'La historia roja de Avellaneda.', icon: 'fa-crown' },
      { id: 'racing', eyebrow: 'La Academia', title: 'Racing Club', description: 'Campeones, ídolos y pasión albiceleste.', icon: 'fa-graduation-cap' },
      { id: 'san-lorenzo', eyebrow: 'El Ciclón', title: 'San Lorenzo', description: 'Boedo, los Matadores y la gloria azulgrana.', icon: 'fa-wind' },
      { id: 'talleres', eyebrow: 'La T', title: 'Talleres', description: 'Barrio Jardín y el orgullo albiazul.', icon: 'fa-t' },
      { id: 'belgrano', eyebrow: 'El Pirata', title: 'Belgrano', description: 'Alberdi y la pasión celeste.', icon: 'fa-skull-crossbones' },
    ],
  },
  {
    id: 'england', name: 'Premier League', country: 'Inglaterra', accent: '#d8ff3e',
    description: 'Arsenal, Chelsea, Liverpool, Manchester City y Manchester United.',
    categories: [
      { id: 'arsenal', eyebrow: 'The Gunners', title: 'Arsenal', description: 'Highbury, Invincibles y leyendas del norte de Londres.', icon: 'fa-shield' },
      { id: 'chelsea', eyebrow: 'The Blues', title: 'Chelsea', description: 'Stamford Bridge y la historia azul de Londres.', icon: 'fa-lion' },
      { id: 'liverpool', eyebrow: 'The Reds', title: 'Liverpool', description: 'Anfield, Europa y You’ll Never Walk Alone.', icon: 'fa-fire-flame-curved' },
      { id: 'manchester-city', eyebrow: 'The Citizens', title: 'Manchester City', description: 'De Maine Road a la era de Guardiola.', icon: 'fa-city' },
      { id: 'manchester-united', eyebrow: 'Red Devils', title: 'Manchester United', description: 'Old Trafford, Busby y Ferguson.', icon: 'fa-futbol' },
    ],
  },
  {
    id: 'spain', name: 'LaLiga', country: 'España', accent: '#ff5757',
    description: 'Atlético, Barcelona, Real Madrid, Sevilla y Valencia.',
    categories: [
      { id: 'atletico-madrid', eyebrow: 'Colchoneros', title: 'Atlético de Madrid', description: 'El Metropolitano y el espíritu rojiblanco.', icon: 'fa-shield-halved' },
      { id: 'barcelona', eyebrow: 'Blaugranas', title: 'Barcelona', description: 'La Masia, el Camp Nou y el juego de posición.', icon: 'fa-futbol' },
      { id: 'real-madrid', eyebrow: 'Merengues', title: 'Real Madrid', description: 'El Bernabéu y una historia escrita en Europa.', icon: 'fa-crown' },
      { id: 'sevilla', eyebrow: 'Nervionenses', title: 'Sevilla', description: 'Nervión y su romance con la Europa League.', icon: 'fa-trophy' },
      { id: 'valencia', eyebrow: 'Ches', title: 'Valencia', description: 'Mestalla, murciélagos y noches europeas.', icon: 'fa-shield' },
    ],
  },
  {
    id: 'italy', name: 'Serie A', country: 'Italia', accent: '#5ba8ff',
    description: 'Inter, Juventus, Milan, Napoli y Roma.',
    categories: [
      { id: 'inter', eyebrow: 'Nerazzurri', title: 'Inter', description: 'La Grande Inter y las noches del Meazza.', icon: 'fa-star' },
      { id: 'juventus', eyebrow: 'Bianconeri', title: 'Juventus', description: 'La Vecchia Signora de Turín.', icon: 'fa-j' },
      { id: 'milan', eyebrow: 'Rossoneri', title: 'Milan', description: 'Dinastías europeas vestidas de rojo y negro.', icon: 'fa-m' },
      { id: 'napoli', eyebrow: 'Partenopei', title: 'Napoli', description: 'El sur, Maradona y el cielo azzurro.', icon: 'fa-n' },
      { id: 'roma', eyebrow: 'Giallorossi', title: 'Roma', description: 'El Olímpico, la Loba y sus capitanes.', icon: 'fa-shield' },
    ],
  },
  {
    id: 'germany', name: 'Bundesliga', country: 'Alemania', accent: '#ff4c4c',
    description: 'Bayern, Dortmund, Leverkusen, Leipzig y Frankfurt.',
    categories: [
      { id: 'bayern-munich', eyebrow: 'Die Roten', title: 'Bayern Múnich', description: 'La potencia bávara y sus campeones.', icon: 'fa-diamond' },
      { id: 'borussia-dortmund', eyebrow: 'Die Schwarzgelben', title: 'Borussia Dortmund', description: 'El Muro Amarillo y la pasión del Ruhr.', icon: 'fa-b' },
      { id: 'bayer-leverkusen', eyebrow: 'Werkself', title: 'Bayer Leverkusen', description: 'La fábrica, la aspirina y el título invicto.', icon: 'fa-flask' },
      { id: 'rb-leipzig', eyebrow: 'Die Roten Bullen', title: 'RB Leipzig', description: 'El joven protagonista de Sajonia.', icon: 'fa-bolt' },
      { id: 'eintracht-frankfurt', eyebrow: 'Die Adler', title: 'Eintracht Frankfurt', description: 'Las Águilas y sus grandes noches europeas.', icon: 'fa-feather' },
    ],
  },
  {
    id: 'france', name: 'Ligue 1', country: 'Francia', accent: '#7cf1c9',
    description: 'PSG, Marseille, Lyon, Monaco y Lille.',
    categories: [
      { id: 'psg', eyebrow: 'Les Parisiens', title: 'Paris Saint-Germain', description: 'El Parque de los Príncipes y las estrellas de París.', icon: 'fa-tower-observation' },
      { id: 'marseille', eyebrow: 'Les Phocéens', title: 'Olympique de Marseille', description: 'El Vélodrome y el orgullo del Mediterráneo.', icon: 'fa-water' },
      { id: 'lyon', eyebrow: 'Les Gones', title: 'Olympique de Lyon', description: 'La cantera y la dinastía de los 2000.', icon: 'fa-lion' },
      { id: 'monaco', eyebrow: 'Les Monégasques', title: 'Monaco', description: 'El principado y su fábrica de talentos.', icon: 'fa-gem' },
      { id: 'lille', eyebrow: 'Les Dogues', title: 'Lille', description: 'El norte francés y sus campeones.', icon: 'fa-dog' },
    ],
  },
];
