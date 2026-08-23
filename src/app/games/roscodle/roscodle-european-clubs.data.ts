import { createRosco, RoscoSeed } from './roscodle-extra.data';
import { RoscoCategory, RoscoQuestion } from './roscodle.models';

type EuropeanClubCategory = Exclude<RoscoCategory,
  'players' | 'teams' | 'boca' | 'river' | 'independiente' | 'racing' | 'san-lorenzo' |
  'talleres' | 'belgrano' | 'premier-league' | 'la-liga' | 'serie-a' | 'bundesliga' | 'ligue-1'>;

interface ClubProfile {
  name: string;
  fullName: string;
  nickname: string;
  city: string;
  colors: string;
  rival: string;
  stadium: string;
  founded: string;
  scorer: string;
  supporters: string;
  idol: string;
  player: string;
  defender: string;
  legend: string;
  manager: string;
  achievement: string;
  trophy: string;
  symbol: string;
  famousWin: string;
  website: string;
  formerPlayer: string;
}

function clubRosco(club: ClubProfile): RoscoQuestion[] {
  const seeds: RoscoSeed[] = [
    [`Apodo ${club.nickname}`, `Nombre popular con el que se conoce a ${club.name}.`, [club.nickname]],
    [`Base ${club.city}`, `Ciudad en la que tiene su sede ${club.name}.`, [club.city]],
    [`Colores ${club.colors}`, `Combinación tradicional de la camiseta del club.`, [club.colors]],
    [`Derby ${club.rival}`, `Principal rival o clásico de ${club.name}.`, [club.rival]],
    [`Estadio ${club.stadium}`, `Cancha en la que juega como local.`, [club.stadium]],
    [`Fundación ${club.founded}`, `Año de fundación del club.`, [club.founded]],
    [`Goleador ${club.scorer}`, `Máximo goleador histórico o gran artillero del club.`, [club.scorer]],
    [`Hinchada ${club.supporters}`, `Nombre asociado a los seguidores o a la tribuna más famosa del club.`, [club.supporters]],
    [`Ídolo ${club.idol}`, `Figura que ocupa un lugar central en la historia de ${club.name}.`, [club.idol]],
    [`Jugador ${club.player}`, `Futbolista emblemático que vistió esta camiseta.`, [club.player]],
    [`Káiser ${club.defender}`, `Defensor o capitán histórico del equipo.`, [club.defender]],
    [`Leyenda ${club.legend}`, `Otra de las grandes leyendas vinculadas al club.`, [club.legend]],
    [`Mánager ${club.manager}`, `Entrenador de uno de sus ciclos más recordados.`, [club.manager]],
    [`Nombre ${club.fullName}`, `Denominación completa de la institución.`, [club.fullName, club.name]],
    [`Año ${club.founded}`, `Fecha de nacimiento institucional expresada como año.`, [club.founded]],
    [`Origen ${club.city}`, `Lugar de origen de este equipo.`, [club.city]],
    [`Palmarés ${club.trophy}`, `Dato destacado de su vitrina de trofeos.`, [club.trophy]],
    [`Equipo ${club.name}`, `Club protagonista de este rosco.`, [club.name, club.fullName]],
    [`Rival ${club.rival}`, `Equipo al que enfrenta en su duelo de mayor rivalidad.`, [club.rival]],
    [`Símbolo ${club.symbol}`, `Figura, animal u objeto presente en su identidad.`, [club.symbol]],
    [`Trofeo ${club.achievement}`, `Conquista o hito que resume una de sus mejores campañas.`, [club.achievement]],
    [`Uniforme ${club.colors}`, `Colores de su indumentaria tradicional.`, [club.colors]],
    [`Victoria ${club.famousWin}`, `Partido o resultado grabado en la memoria de sus hinchas.`, [club.famousWin]],
    [`Web ${club.website}`, `Dominio del sitio oficial del club.`, [club.website]],
    [`Exjugador ${club.formerPlayer}`, `Exfutbolista destacado que pasó por la institución.`, [club.formerPlayer]],
    [`Club y ciudad: ${club.name}, ${club.city}`, `Completá la pareja formada por el club y su ciudad.`, [`${club.name} ${club.city}`]],
    [`Hazaña ${club.achievement}`, `Logro deportivo inolvidable de ${club.name}.`, [club.achievement]],
  ];
  return createRosco(seeds);
}

const CLUB_PROFILES: Record<EuropeanClubCategory, ClubProfile> = {
  arsenal: {
    name: 'Arsenal', fullName: 'Arsenal Football Club', nickname: 'Gunners', city: 'Londres',
    colors: 'rojo y blanco', rival: 'Tottenham', stadium: 'Emirates Stadium', founded: '1886',
    scorer: 'Thierry Henry', supporters: 'Gooners', idol: 'Dennis Bergkamp', player: 'Ian Wright',
    defender: 'Tony Adams', legend: 'Arsène Wenger', manager: 'Herbert Chapman',
    achievement: 'Invictos 2003/04', trophy: 'trece ligas inglesas', symbol: 'cañón',
    famousWin: 'dos a cero a Liverpool en Anfield en 1989', website: 'arsenal.com', formerPlayer: 'Patrick Vieira',
  },
  chelsea: {
    name: 'Chelsea', fullName: 'Chelsea Football Club', nickname: 'Blues', city: 'Londres',
    colors: 'azul y blanco', rival: 'Arsenal', stadium: 'Stamford Bridge', founded: '1905',
    scorer: 'Frank Lampard', supporters: 'Shed End', idol: 'Didier Drogba', player: 'John Terry',
    defender: 'Ron Harris', legend: 'Peter Osgood', manager: 'José Mourinho',
    achievement: 'Champions League 2012', trophy: 'dos Champions League', symbol: 'león azul',
    famousWin: 'final ante Bayern en 2012', website: 'chelseafc.com', formerPlayer: 'Eden Hazard',
  },
  liverpool: {
    name: 'Liverpool', fullName: 'Liverpool Football Club', nickname: 'Reds', city: 'Liverpool',
    colors: 'rojo', rival: 'Everton', stadium: 'Anfield', founded: '1892',
    scorer: 'Ian Rush', supporters: 'Kopites', idol: 'Steven Gerrard', player: 'Kenny Dalglish',
    defender: 'Alan Hansen', legend: 'Bill Shankly', manager: 'Bob Paisley',
    achievement: 'Milagro de Estambul 2005', trophy: 'seis Copas de Europa', symbol: 'Liver bird',
    famousWin: 'remontada ante Milan en Estambul', website: 'liverpoolfc.com', formerPlayer: 'Xabi Alonso',
  },
  'manchester-city': {
    name: 'Manchester City', fullName: 'Manchester City Football Club', nickname: 'Citizens', city: 'Manchester',
    colors: 'celeste y blanco', rival: 'Manchester United', stadium: 'Etihad Stadium', founded: '1880',
    scorer: 'Sergio Agüero', supporters: 'Cityzens', idol: 'Colin Bell', player: 'Kevin De Bruyne',
    defender: 'Vincent Kompany', legend: 'David Silva', manager: 'Pep Guardiola',
    achievement: 'triplete de 2023', trophy: 'Champions League 2023', symbol: 'barco de Manchester',
    famousWin: 'tres a dos a Queens Park Rangers en 2012', website: 'mancity.com', formerPlayer: 'Yaya Touré',
  },
  'manchester-united': {
    name: 'Manchester United', fullName: 'Manchester United Football Club', nickname: 'Red Devils', city: 'Manchester',
    colors: 'rojo y blanco', rival: 'Manchester City', stadium: 'Old Trafford', founded: '1878',
    scorer: 'Wayne Rooney', supporters: 'Red Army', idol: 'Bobby Charlton', player: 'George Best',
    defender: 'Rio Ferdinand', legend: 'Matt Busby', manager: 'Alex Ferguson',
    achievement: 'triplete de 1999', trophy: 'tres Copas de Europa', symbol: 'diablo rojo',
    famousWin: 'dos a uno a Bayern en Barcelona en 1999', website: 'manutd.com', formerPlayer: 'David Beckham',
  },
  'atletico-madrid': {
    name: 'Atlético de Madrid', fullName: 'Club Atlético de Madrid', nickname: 'Colchoneros', city: 'Madrid',
    colors: 'rojo y blanco', rival: 'Real Madrid', stadium: 'Metropolitano', founded: '1903',
    scorer: 'Antoine Griezmann', supporters: 'rojiblancos', idol: 'Fernando Torres', player: 'Koke',
    defender: 'Diego Godín', legend: 'Luis Aragonés', manager: 'Diego Simeone',
    achievement: 'doblete de 1996', trophy: 'once ligas españolas', symbol: 'oso y madroño',
    famousWin: 'tres a cero a Marseille en 2018', website: 'atleticodemadrid.com', formerPlayer: 'Radamel Falcao',
  },
  barcelona: {
    name: 'Barcelona', fullName: 'Futbol Club Barcelona', nickname: 'Blaugranas', city: 'Barcelona',
    colors: 'azul y grana', rival: 'Real Madrid', stadium: 'Camp Nou', founded: '1899',
    scorer: 'Lionel Messi', supporters: 'culés', idol: 'Johan Cruyff', player: 'Xavi Hernández',
    defender: 'Carles Puyol', legend: 'Andrés Iniesta', manager: 'Pep Guardiola',
    achievement: 'sextete de 2009', trophy: 'cinco Champions League', symbol: 'senyera',
    famousWin: 'seis a uno a Paris Saint-Germain', website: 'fcbarcelona.com', formerPlayer: 'Ronaldinho',
  },
  'real-madrid': {
    name: 'Real Madrid', fullName: 'Real Madrid Club de Fútbol', nickname: 'Merengues', city: 'Madrid',
    colors: 'blanco', rival: 'Barcelona', stadium: 'Santiago Bernabéu', founded: '1902',
    scorer: 'Cristiano Ronaldo', supporters: 'madridistas', idol: 'Alfredo Di Stéfano', player: 'Raúl González',
    defender: 'Sergio Ramos', legend: 'Paco Gento', manager: 'Miguel Muñoz',
    achievement: 'Decimoquinta Copa de Europa', trophy: 'quince Copas de Europa', symbol: 'corona real',
    famousWin: 'cuatro a uno a Juventus en Cardiff', website: 'realmadrid.com', formerPlayer: 'Zinedine Zidane',
  },
  sevilla: {
    name: 'Sevilla', fullName: 'Sevilla Fútbol Club', nickname: 'Nervionenses', city: 'Sevilla',
    colors: 'blanco y rojo', rival: 'Real Betis', stadium: 'Ramón Sánchez-Pizjuán', founded: '1890',
    scorer: 'Juan Arza', supporters: 'Biris Norte', idol: 'Jesús Navas', player: 'Frédéric Kanouté',
    defender: 'Javi Navarro', legend: 'Antonio Puerta', manager: 'Unai Emery',
    achievement: 'siete Europa League', trophy: 'siete Europa League', symbol: 'Giralda',
    famousWin: 'tres a dos a Inter en Colonia', website: 'sevillafc.es', formerPlayer: 'Ivan Rakitić',
  },
  valencia: {
    name: 'Valencia', fullName: 'Valencia Club de Fútbol', nickname: 'Ches', city: 'Valencia',
    colors: 'blanco y negro', rival: 'Levante', stadium: 'Mestalla', founded: '1919',
    scorer: 'Edmundo Suárez Mundo', supporters: 'Curva Nord', idol: 'Mario Kempes', player: 'David Villa',
    defender: 'Ricardo Arias', legend: 'Gaizka Mendieta', manager: 'Rafa Benítez',
    achievement: 'doblete de 2004', trophy: 'seis ligas españolas', symbol: 'murciélago',
    famousWin: 'tres a cero a Marseille en Gotemburgo', website: 'valenciacf.com', formerPlayer: 'Pablo Aimar',
  },
  inter: {
    name: 'Inter', fullName: 'Football Club Internazionale Milano', nickname: 'Nerazzurri', city: 'Milán',
    colors: 'negro y azul', rival: 'Milan', stadium: 'Giuseppe Meazza', founded: '1908',
    scorer: 'Giuseppe Meazza', supporters: 'Curva Nord', idol: 'Javier Zanetti', player: 'Ronaldo Nazário',
    defender: 'Giacinto Facchetti', legend: 'Sandro Mazzola', manager: 'Helenio Herrera',
    achievement: 'triplete de 2010', trophy: 'tres Copas de Europa', symbol: 'biscione',
    famousWin: 'dos a cero a Bayern en Madrid', website: 'inter.it', formerPlayer: 'Diego Milito',
  },
  juventus: {
    name: 'Juventus', fullName: 'Juventus Football Club', nickname: 'Vecchia Signora', city: 'Turín',
    colors: 'blanco y negro', rival: 'Torino', stadium: 'Allianz Stadium', founded: '1897',
    scorer: 'Alessandro Del Piero', supporters: 'bianconeri', idol: 'Gianluigi Buffon', player: 'Michel Platini',
    defender: 'Giorgio Chiellini', legend: 'Giampiero Boniperti', manager: 'Marcello Lippi',
    achievement: 'triplete continental de 1985', trophy: 'treinta y seis ligas italianas', symbol: 'cebra',
    famousWin: 'tres a uno a Real Madrid en 2003', website: 'juventus.com', formerPlayer: 'Zinedine Zidane',
  },
  milan: {
    name: 'Milan', fullName: 'Associazione Calcio Milan', nickname: 'Rossoneri', city: 'Milán',
    colors: 'rojo y negro', rival: 'Inter', stadium: 'San Siro', founded: '1899',
    scorer: 'Gunnar Nordahl', supporters: 'Curva Sud', idol: 'Paolo Maldini', player: 'Kaká',
    defender: 'Franco Baresi', legend: 'Gianni Rivera', manager: 'Arrigo Sacchi',
    achievement: 'Champions League 1994', trophy: 'siete Copas de Europa', symbol: 'diablo rossonero',
    famousWin: 'cuatro a cero a Barcelona en Atenas', website: 'acmilan.com', formerPlayer: 'Andriy Shevchenko',
  },
  napoli: {
    name: 'Napoli', fullName: 'Società Sportiva Calcio Napoli', nickname: 'Partenopei', city: 'Nápoles',
    colors: 'celeste', rival: 'Roma', stadium: 'Diego Armando Maradona', founded: '1926',
    scorer: 'Dries Mertens', supporters: 'tifosi azzurri', idol: 'Diego Maradona', player: 'Marek Hamšík',
    defender: 'Giuseppe Bruscolotti', legend: 'Careca', manager: 'Luciano Spalletti',
    achievement: 'Scudetto de 2023', trophy: 'tres ligas italianas', symbol: 'O Ciuccio',
    famousWin: 'cinco a uno a Juventus en 2023', website: 'sscnapoli.it', formerPlayer: 'Ezequiel Lavezzi',
  },
  roma: {
    name: 'Roma', fullName: 'Associazione Sportiva Roma', nickname: 'Giallorossi', city: 'Roma',
    colors: 'rojo y amarillo', rival: 'Lazio', stadium: 'Olímpico de Roma', founded: '1927',
    scorer: 'Francesco Totti', supporters: 'Curva Sud', idol: 'Daniele De Rossi', player: 'Bruno Conti',
    defender: 'Giacomo Losi', legend: 'Paulo Roberto Falcão', manager: 'Nils Liedholm',
    achievement: 'Conference League 2022', trophy: 'tres ligas italianas', symbol: 'Loba Capitolina',
    famousWin: 'tres a cero a Barcelona en 2018', website: 'asroma.com', formerPlayer: 'Gabriel Batistuta',
  },
  'bayern-munich': {
    name: 'Bayern Múnich', fullName: 'Fußball-Club Bayern München', nickname: 'Die Roten', city: 'Múnich',
    colors: 'rojo y blanco', rival: 'Borussia Dortmund', stadium: 'Allianz Arena', founded: '1900',
    scorer: 'Gerd Müller', supporters: 'Schickeria München', idol: 'Franz Beckenbauer', player: 'Philipp Lahm',
    defender: 'Hans-Georg Schwarzenbeck', legend: 'Uli Hoeneß', manager: 'Jupp Heynckes',
    achievement: 'sextete de 2020', trophy: 'seis Copas de Europa', symbol: 'rombos bávaros',
    famousWin: 'ocho a dos a Barcelona en Lisboa', website: 'fcbayern.com', formerPlayer: 'Zé Roberto',
  },
  'borussia-dortmund': {
    name: 'Borussia Dortmund', fullName: 'Ballspielverein Borussia 09 Dortmund', nickname: 'Schwarzgelben', city: 'Dortmund',
    colors: 'amarillo y negro', rival: 'Schalke 04', stadium: 'Westfalenstadion', founded: '1909',
    scorer: 'Alfred Preißler', supporters: 'Muro Amarillo', idol: 'Marco Reus', player: 'Mario Götze',
    defender: 'Mats Hummels', legend: 'Matthias Sammer', manager: 'Jürgen Klopp',
    achievement: 'Champions League 1997', trophy: 'ocho campeonatos alemanes', symbol: 'abeja Emma',
    famousWin: 'tres a uno a Juventus en Múnich', website: 'bvb.de', formerPlayer: 'Robert Lewandowski',
  },
  'bayer-leverkusen': {
    name: 'Bayer Leverkusen', fullName: 'Bayer 04 Leverkusen Fußball', nickname: 'Werkself', city: 'Leverkusen',
    colors: 'rojo y negro', rival: 'Colonia', stadium: 'BayArena', founded: '1904',
    scorer: 'Ulf Kirsten', supporters: 'Nordkurve', idol: 'Florian Wirtz', player: 'Michael Ballack',
    defender: 'Lúcio', legend: 'Rudi Völler', manager: 'Xabi Alonso',
    achievement: 'Bundesliga invicta 2024', trophy: 'Copa UEFA 1988', symbol: 'cruz de Bayer',
    famousWin: 'remontada ante Espanyol en 1988', website: 'bayer04.de', formerPlayer: 'Zé Roberto',
  },
  'rb-leipzig': {
    name: 'RB Leipzig', fullName: 'RasenBallsport Leipzig', nickname: 'Roten Bullen', city: 'Leipzig',
    colors: 'blanco y rojo', rival: 'Borussia Dortmund', stadium: 'Red Bull Arena', founded: '2009',
    scorer: 'Timo Werner', supporters: 'Rasenballisten', idol: 'Emil Forsberg', player: 'Yussuf Poulsen',
    defender: 'Willi Orbán', legend: 'Diego Demme', manager: 'Ralf Rangnick',
    achievement: 'dos Copas de Alemania', trophy: 'DFB-Pokal 2022 y 2023', symbol: 'toros rojos',
    famousWin: 'tres a cero a Bayern en la Supercopa 2023', website: 'rbleipzig.com', formerPlayer: 'Naby Keïta',
  },
  'eintracht-frankfurt': {
    name: 'Eintracht Frankfurt', fullName: 'Eintracht Frankfurt Fußball', nickname: 'Die Adler', city: 'Frankfurt',
    colors: 'rojo negro y blanco', rival: 'Kickers Offenbach', stadium: 'Waldstadion', founded: '1899',
    scorer: 'Bernd Nickel', supporters: 'Nordwestkurve', idol: 'Jürgen Grabowski', player: 'Cha Bum-kun',
    defender: 'Charly Körbel', legend: 'Bernd Hölzenbein', manager: 'Oliver Glasner',
    achievement: 'Europa League 2022', trophy: 'dos Copas UEFA y Europa League', symbol: 'águila',
    famousWin: 'final por penales ante Rangers', website: 'eintracht.de', formerPlayer: 'Luka Jović',
  },
  psg: {
    name: 'Paris Saint-Germain', fullName: 'Paris Saint-Germain Football Club', nickname: 'Parisiens', city: 'París',
    colors: 'azul rojo y blanco', rival: 'Olympique de Marseille', stadium: 'Parque de los Príncipes', founded: '1970',
    scorer: 'Kylian Mbappé', supporters: 'Collectif Ultras Paris', idol: 'Zlatan Ibrahimović', player: 'Ronaldinho',
    defender: 'Marquinhos', legend: 'Raí', manager: 'Laurent Blanc',
    achievement: 'Recopa de Europa 1996', trophy: 'Recopa de Europa', symbol: 'Torre Eiffel',
    famousWin: 'cuatro a cero a Barcelona en 2017', website: 'psg.fr', formerPlayer: 'Neymar',
  },
  marseille: {
    name: 'Olympique de Marseille', fullName: 'Olympique de Marseille', nickname: 'Phocéens', city: 'Marsella',
    colors: 'blanco y celeste', rival: 'Paris Saint-Germain', stadium: 'Stade Vélodrome', founded: '1899',
    scorer: 'Gunnar Andersson', supporters: 'Commando Ultra', idol: 'Jean-Pierre Papin', player: 'Didier Drogba',
    defender: 'Basile Boli', legend: 'Josip Skoblar', manager: 'Raymond Goethals',
    achievement: 'Champions League 1993', trophy: 'una Copa de Europa', symbol: 'Droit au but',
    famousWin: 'uno a cero a Milan en Múnich', website: 'om.fr', formerPlayer: 'Chris Waddle',
  },
  lyon: {
    name: 'Olympique de Lyon', fullName: 'Olympique Lyonnais', nickname: 'Les Gones', city: 'Lyon',
    colors: 'blanco rojo y azul', rival: 'Saint-Étienne', stadium: 'Parc Olympique Lyonnais', founded: '1950',
    scorer: 'Fleury Di Nallo', supporters: 'Bad Gones', idol: 'Juninho Pernambucano', player: 'Karim Benzema',
    defender: 'Cris', legend: 'Bernard Lacombe', manager: 'Gérard Houllier',
    achievement: 'siete ligas consecutivas', trophy: 'siete Ligue 1', symbol: 'león',
    famousWin: 'tres a cero a Real Madrid en 2005', website: 'ol.fr', formerPlayer: 'Michael Essien',
  },
  monaco: {
    name: 'Monaco', fullName: 'Association Sportive de Monaco Football Club', nickname: 'Monégasques', city: 'Mónaco',
    colors: 'rojo y blanco', rival: 'Niza', stadium: 'Stade Louis II', founded: '1924',
    scorer: 'Delio Onnis', supporters: 'Ultras Monaco', idol: 'Thierry Henry', player: 'Kylian Mbappé',
    defender: 'Manuel Amoros', legend: 'Jean-Luc Ettori', manager: 'Arsène Wenger',
    achievement: 'final de Champions 2004', trophy: 'ocho ligas francesas', symbol: 'corona del principado',
    famousWin: 'tres a uno a Real Madrid en 2004', website: 'asmonaco.com', formerPlayer: 'Radamel Falcao',
  },
  lille: {
    name: 'Lille', fullName: 'Lille Olympique Sporting Club', nickname: 'Dogues', city: 'Lille',
    colors: 'rojo y blanco', rival: 'Lens', stadium: 'Stade Pierre-Mauroy', founded: '1944',
    scorer: 'Jean Baratte', supporters: 'Dogues Virage Est', idol: 'Eden Hazard', player: 'Yohan Cabaye',
    defender: 'José Fonte', legend: 'Gervinho', manager: 'Christophe Galtier',
    achievement: 'Ligue 1 de 2021', trophy: 'cuatro ligas francesas', symbol: 'dogo',
    famousWin: 'uno a cero a PSG en 2021', website: 'losc.fr', formerPlayer: 'Leny Yoro',
  },
};

export const EUROPEAN_CLUB_QUESTIONS = Object.fromEntries(
  Object.entries(CLUB_PROFILES).map(([category, profile]) => [category, clubRosco(profile)]),
) as Record<EuropeanClubCategory, RoscoQuestion[]>;
