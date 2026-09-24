import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LOL_EDITORIAL_CONTENT } from './lol-editorial-content';

interface EditorialSource {
  label: string;
  url: string;
  note: string;
}

interface EditorialFaq {
  question: string;
  answer: string;
}

interface RelatedGame {
  name: string;
  route: string;
  reason: string;
}

export interface GameEditorialContent {
  name: string;
  kicker: string;
  title: string;
  intro: string;
  rules: string[];
  methodology: string;
  feedback: string;
  sources: EditorialSource[];
  faqs: EditorialFaq[];
  related: RelatedGame[];
  reviewed: string;
}

const CONTENT: Record<string, GameEditorialContent> = {
  ...LOL_EDITORIAL_CONTENT,
  wordle: {
    name: 'Wordle', kicker: 'Guía de juego', title: 'Una palabra, seis intentos y ninguna pista desperdiciada.',
    intro: 'Wordle propone descubrir una palabra española de cinco letras. El desafío cambia cada día y todas las personas reciben la misma solución, por lo que el resultado puede compartirse sin revelar la respuesta.',
    rules: ['Escribí una palabra válida de cinco letras.', 'Verde indica letra y posición correctas; amarillo, letra presente en otra posición; gris, letra ausente.', 'Usá la información acumulada para resolver antes del sexto intento.'],
    methodology: 'El catálogo se mantiene dentro de Game-DLE y se revisa para excluir entradas impropias, abreviaturas y formas que arruinen la experiencia. La solución diaria se obtiene de forma determinista según la fecha de Argentina; recargar la página no cambia la palabra.',
    feedback: 'Las letras repetidas se evalúan respetando cuántas veces aparecen realmente en la solución. Una segunda copia puede mostrarse gris aunque la misma letra ya tenga una coincidencia verde o amarilla.',
    sources: [
      { label: 'Diccionario de la lengua española', url: 'https://dle.rae.es/', note: 'Referencia para significado y vigencia de palabras.' },
      { label: 'FundéuRAE', url: 'https://www.fundeu.es/', note: 'Consulta complementaria de uso y escritura en español.' },
    ],
    faqs: [{ question: '¿La palabra cambia si recargo?', answer: 'No. La solución es la misma durante todo el día según la fecha de Argentina.' }, { question: '¿Se tienen en cuenta las tildes?', answer: 'El campo transforma a mayúsculas y elimina tildes. En esta implementación Ñ se normaliza a N. La guía explica la validación y el tratamiento de letras repetidas.' }],
    related: [{ name: 'RoscoDLE', route: '/games/roscodle', reason: 'Más vocabulario' }, { name: 'FutbolDLE', route: '/games/futboldle', reason: 'Cinco letras y fútbol' }], reviewed: '25 de agosto de 2026',
  },
  'clave-extrema': {
    name: 'Clave Extrema', kicker: 'Manual de criptografía', title: 'La palabra no cambia de color: los números cuentan la historia.',
    intro: 'Clave Extrema convierte la deducción de cinco letras en un problema de totales. Cada intento informa cuántas letras están bien ubicadas, cuántas pertenecen a la palabra en otro lugar y cuántas quedan fuera.',
    rules: ['Escribí una palabra válida de cinco letras.', 'Leé los tres totales de la fila; ninguna letra individual revela su estado.', 'Compará intentos y resolvé el código antes de la octava oportunidad.'],
    methodology: 'La solución diaria se selecciona de forma determinista según la fecha de Argentina. La validación reutiliza el catálogo local de palabras de Game-DLE y el cálculo descuenta cada ocurrencia para tratar correctamente las letras repetidas.',
    feedback: 'Exactas suma letras correctas en su posición; Movidas suma ocurrencias correctas en otra posición; Fuera completa siempre un total de cinco. El teclado permanece neutral para no revelar qué letra produjo cada dato.',
    sources: [
      { label: 'Diccionario de la lengua española', url: 'https://dle.rae.es/', note: 'Referencia de vocabulario español.' },
      { label: 'Reglas de Game-DLE', url: '/acerca-de', note: 'Implementación y sistema de puntuación propios.' },
    ],
    faqs: [{ question: '¿Por qué el teclado no descarta letras?', answer: 'Porque hacerlo revelaría qué letra individual está ausente. En este modo sólo se conocen los tres totales de la fila.' }, { question: '¿Cómo se cuentan las letras repetidas?', answer: 'Cada copia puede coincidir una sola vez con una copia de la solución, empezando por las posiciones exactas.' }],
    related: [{ name: 'Wordle', route: '/games/wordle', reason: 'Modo clásico' }, { name: 'RoscoDLE', route: '/games/roscodle', reason: 'Más vocabulario' }], reviewed: '4 de septiembre de 2026',
  },
  onepiecedle: {
    name: 'One Piece DLE', kicker: 'Guía del Grand Line', title: 'Compará pistas hasta encontrar al personaje del día.',
    intro: 'One Piece DLE es un desafío diario para fans de la obra de Eiichiro Oda. Cada intento compara un personaje con la respuesta oculta mediante atributos del universo de One Piece.',
    rules: ['Elegí un personaje del buscador.', 'Leé los colores y flechas de cada atributo.', 'Descartá opciones y encontrá el personaje antes de agotar los intentos.'],
    methodology: 'El catálogo es curado manualmente a partir de personajes relevantes y datos públicos de la obra. Las categorías se normalizan para que traducciones o variantes de nombres no produzcan comparaciones contradictorias.',
    feedback: 'Verde representa coincidencia; los demás estados señalan diferencia o dirección cuando el atributo admite un orden. Ninguna pista modifica la respuesta diaria.',
    sources: [{ label: 'Portal oficial de One Piece', url: 'https://one-piece.com/', note: 'Referencia oficial de la franquicia.' }, { label: 'One Piece Wiki', url: 'https://onepiece.fandom.com/wiki/One_Piece_Wiki', note: 'Referencia comunitaria contrastada manualmente.' }],
    faqs: [{ question: '¿Incluye personajes del manga?', answer: 'El alcance depende de la versión publicada del catálogo y puede incorporar información conocida de la obra; evitamos usar el juego como fuente libre de spoilers.' }, { question: '¿Es un juego oficial?', answer: 'No. Game-DLE es un proyecto independiente y no está afiliado con Shueisha, Toei Animation ni Eiichiro Oda.' }],
    related: [{ name: 'LoL DLE', route: '/games/loldle', reason: 'Comparar personajes' }, { name: 'ChronoDLE', route: '/games/chronodle', reason: 'Ordenar pistas' }], reviewed: '25 de agosto de 2026',
  },
  loldle: {
    name: 'LoL DLE', kicker: 'Guía de la Grieta', title: 'Cada campeón deja una pista distinta.',
    intro: 'LoL DLE desafía a identificar un campeón de League of Legends mediante comparaciones de rol, región, recurso, alcance y otros atributos del catálogo.',
    rules: ['Buscá y seleccioná un campeón.', 'Compará cada celda con la respuesta oculta.', 'Combiná coincidencias y diferencias hasta descubrirlo.'],
    methodology: 'El catálogo local se actualiza a partir de información pública de Riot Games y se revisa para mantener nombres y atributos consistentes. Una actualización del juego original puede requerir una revisión posterior en Game-DLE.',
    feedback: 'Las coincidencias exactas se distinguen visualmente. En valores ordenables, una flecha indica si la respuesta se encuentra por encima o por debajo del intento.',
    sources: [{ label: 'Campeones de League of Legends', url: 'https://www.leagueoflegends.com/es-es/champions/', note: 'Perfiles oficiales de campeones.' }, { label: 'Riot Developer Portal', url: 'https://developer.riotgames.com/docs/lol', note: 'Documentación oficial de datos y recursos.' }],
    faqs: [{ question: '¿Los cambios de parche se reflejan de inmediato?', answer: 'No siempre. Los atributos se revisan por catálogo y pueden tener una fecha posterior a la publicación de un parche.' }, { question: '¿Game-DLE pertenece a Riot Games?', answer: 'No. League of Legends y sus campeones pertenecen a Riot Games; este es un proyecto independiente para fans.' }],
    related: [{ name: 'One Piece DLE', route: '/games/onepiecedle', reason: 'Adivinar personajes' }, { name: 'RankDLE', route: '/games/rankdle', reason: 'Comparar atributos' }], reviewed: '25 de agosto de 2026',
  },
  musicdle: {
    name: 'MusicDLE', kicker: 'Notas del estudio', title: 'Reconocé la canción antes de que se abra toda la señal.',
    intro: 'MusicDLE reproduce fragmentos breves de una canción y permite desbloquear más segundos con cada intento. El objetivo es reconocer título y artista usando la menor cantidad de audio posible.',
    rules: ['Escuchá el fragmento disponible.', 'Buscá una canción o pasá para desbloquear más audio.', 'Acertá antes de consumir todos los intentos.'],
    methodology: 'La selección musical se cura manualmente, se organiza por categorías y utiliza identificadores de videos disponibles en YouTube. La posición inicial y los fragmentos se revisan para que la pista sea reconocible sin revelar inmediatamente la respuesta.',
    feedback: 'Cada intento muestra coincidencias parciales de título o artista cuando corresponda. Pasar no cuenta como una respuesta correcta: intercambia un intento por más segundos de escucha.',
    sources: [{ label: 'YouTube', url: 'https://www.youtube.com/', note: 'Reproducción mediante el reproductor incorporado.' }, { label: 'Términos de YouTube', url: 'https://www.youtube.com/static?template=terms', note: 'Condiciones del servicio externo de reproducción.' }],
    faqs: [{ question: '¿Game-DLE aloja los videos?', answer: 'No. La reproducción se realiza mediante el reproductor incorporado de YouTube.' }, { question: '¿Por qué una canción puede dejar de funcionar?', answer: 'La disponibilidad depende del video original, su región y las decisiones de su titular en YouTube.' }],
    related: [{ name: 'Wordle', route: '/games/wordle', reason: 'Desafío diario' }, { name: 'RankDLE', route: '/games/rankdle', reason: 'Cultura general' }], reviewed: '25 de agosto de 2026',
  },
  serpentile: {
    name: 'Serpentile', kicker: 'Manual del tablero', title: 'Un recorrido lógico construido para tener solución.',
    intro: 'Serpentile es un juego de recorrido hexagonal en movimiento. Cada bloque gira 60 grados y el objetivo es alcanzar luciérnagas sin que la serpiente salga del tablero.',
    rules: ['Tocá una pieza para girarla.', 'Orientá el cauce según el lado por el que entra la serpiente.', 'Recogé los objetivos y usá Pausar para planificar el próximo recorrido.'],
    methodology: 'El tablero y sus objetivos se preparan localmente según fecha y número de ronda. La entrada en cada hexágono determina el cauce que sigue la serpiente; los objetivos se reemplazan al recogerlos.',
    feedback: 'Las conexiones y bordes muestran por dónde puede continuar el recorrido. El puntaje suma 100 por objetivo recogido; los pasos cuentan avance y no clics de rotación.',
    sources: [{ label: 'Generador propio de Game-DLE', url: '/acerca-de', note: 'La lógica y validación del tablero se ejecutan localmente.' }],
    faqs: [{ question: '¿El tablero puede ser imposible?', answer: 'El resultado depende de cómo orientás los cauces. Si encontrás un problema del generador, informá fecha y número de ronda.' }, { question: '¿Recargar cambia el tablero?', answer: 'No. El desafío diario se mantiene estable durante esa fecha.' }],
    related: [{ name: 'Wordle', route: '/games/wordle', reason: 'Otro desafío diario' }, { name: 'GeoDLE', route: '/games/geodle', reason: 'Resolver con pistas' }], reviewed: '25 de agosto de 2026',
  },
  enclosure: {
    name: 'Cerco Óptimo', kicker: 'Manual de la reserva', title: 'Cada pared cuenta; el agua también juega.',
    intro: 'Cerco Óptimo propone aislar la región conectada del caballo usando una cantidad fija de paredes. El objetivo no es dibujar una figura bonita ni gastar todos los recursos: hay que proteger la mayor cantidad posible de césped y aprovechar el agua como parte natural del perímetro.',
    rules: ['Elegí uno de los tres niveles; cada dificultad fija dimensiones y presupuesto.', 'Tocá casillas de césped para colocar o retirar paredes sin superar K.', 'Comprobá tu propuesta o pedí la solución óptima para comparar área y posiciones.'],
    methodology: 'Cada ronda genera localmente un mapa nuevo de 30 × 30 bloques. El contorno exterior permanece transitable y nunca se construye un anillo o rectángulo preparado alrededor del caballo. Las cuatro casillas vecinas al caballo comienzan libres: ya no existe una solución prefabricada por agua adyacente. La dificultad cambia el presupuesto y la geometría con 8, 9 o 10 paredes: el nivel inicial usa pocas lagunas grandes y legibles; el intermedio mezcla cauces medianos; el experto distribuye muchos fragmentos pequeños y multiplica las formas de gastar el presupuesto. El motor interpreta el exterior como un nodo adicional y enumera únicamente los separadores relevantes entre ese exterior y el caballo. Los cortes de flujo máximo descartan familias completas de alternativas sin perder la garantía de optimalidad global.',
    feedback: 'El color dorado identifica la única región puntuada: debe ser transitable, conectada y contener al caballo. Las paredes quedan fuera del score. Una región que alcanza cualquier casilla transitable del borde permanece abierta, aunque visualmente parezca rodeada. Mostrar la solución no aplica una heurística: devuelve un óptimo global para el mapa y el presupuesto actuales.',
    sources: [{ label: 'Motor propio de Game-DLE', url: '/acerca-de', note: 'Generación, validación y optimización se ejecutan localmente, sin enviar el tablero a servicios externos.' }],
    faqs: [{ question: '¿Por qué el mapa cambia?', answer: 'Cada entrada y cada uso de Nuevo mapa generan otra distribución de agua y aberturas, manteniendo dimensiones, dificultad y solución garantizada.' }, { question: '¿Puede usar menos paredes que K?', answer: 'Sí. K es el máximo fijo del nivel: si la forma aleatoria del agua permite un cerramiento óptimo con menos paredes, no hace falta gastar las restantes.' }],
    related: [{ name: 'Serpentile', route: '/games/serpentile', reason: 'Otro tablero original' }, { name: 'RankDLE', route: '/games/rankdle', reason: 'Optimización y orden' }], reviewed: '22 de septiembre de 2026',
  },
  tuttifrutti: {
    name: 'Tutti Frutti', kicker: 'Reglamento de mesa', title: 'La clásica ronda de palabras, compartida en tiempo real.',
    intro: 'Tutti Frutti permite crear una sala, elegir categorías y competir con amigos usando la misma letra. Las respuestas se revisan entre participantes antes de calcular los puntos.',
    rules: ['Una persona crea la sala y comparte el código.', 'Todos completan las categorías con la letra indicada.', 'La mesa valida respuestas y el puntaje se acumula durante las rondas.'],
    methodology: 'Las salas utilizan Firebase para sincronizar participantes, configuración, respuestas, votos y puntajes. La validación es social: Game-DLE no afirma que cada palabra aceptada por una mesa sea universalmente correcta.',
    feedback: 'Una respuesta válida y única vale más; una repetida comparte puntaje y una rechazada vale cero. La pantalla de resultados detalla el cálculo de cada categoría.',
    sources: [{ label: 'Reglas propias de Game-DLE', url: '/terminos', note: 'Adaptación digital y sistema de votación.' }, { label: 'Privacidad de Firebase', url: 'https://firebase.google.com/support/privacy', note: 'Información del servicio usado para las salas.' }],
    faqs: [{ question: '¿Quién decide si una palabra vale?', answer: 'Las personas de la sala votan. El anfitrión coordina las rondas, pero la revisión queda visible para el grupo.' }, { question: '¿Qué se guarda?', answer: 'Se sincronizan el nombre elegido, respuestas, votos, puntajes y estado necesarios para operar la sala.' }],
    related: [{ name: 'RoscoDLE', route: '/games/roscodle', reason: 'Palabras y categorías' }, { name: 'Wordle', route: '/games/wordle', reason: 'Jugar en solitario' }], reviewed: '25 de agosto de 2026',
  },
  geodle: {
    name: 'GeoDLE', kicker: 'Cuaderno de viaje', title: 'Compará países sin confundir valores con distancias.',
    intro: 'GeoDLE propone descubrir un país en seis intentos comparando continente, subregión, hemisferios, idiomas, superficie, población y cantidad de fronteras terrestres. Las rondas son ilimitadas.',
    rules: ['Escribí un país y seleccioná una entrada del buscador.', 'Compará sus siete atributos con los del país oculto.', 'Usá coincidencias, coincidencias parciales y flechas para resolver en seis intentos.'],
    methodology: 'El catálogo local reúne 195 estados: 193 miembros de la ONU y dos observadores. Los datos proceden de countries.dev, se normalizan al español y se guardan en una versión local; no se consultan indicadores en vivo durante cada intento. Los hemisferios se derivan de coordenadas representativas, no de toda la extensión territorial.',
    feedback: 'Verde indica coincidencia exacta. Idiomas y hemisferios pueden ser parciales si comparten algún valor. En superficie y población se marca cercanía hasta un 15 % de diferencia respecto del destino; en fronteras se exige igualdad. La flecha arriba indica que el país oculto tiene un valor mayor. No se calcula distancia ni rumbo geográfico.',
    sources: [{ label: 'countries.dev', url: 'https://countries.dev/countries?full=true', note: 'Fuente del catálogo geográfico local.' }, { label: 'Metodología de Game-DLE', url: '/metodologia', note: 'Normalización, fechas y límites del catálogo.' }],
    faqs: [{ question: '¿La flecha apunta hacia el país?', answer: 'No. Indica mayor o menor superficie, población o cantidad de fronteras.' }, { question: '¿Se incluyen todos los territorios?', answer: 'Se usan 195 estados. Los territorios dependientes no forman parte del conjunto jugable.' }, { question: '¿Los indicadores son actuales en tiempo real?', answer: 'No. Son una instantánea del catálogo local; la fecha de generación se informa en Metodología.' }],
    related: [{ name: 'Guía de GeoDLE', route: '/guias/geodle', reason: 'Ejemplos de pistas' }, { name: 'ChronoDLE', route: '/games/chronodle', reason: 'Historia mundial' }], reviewed: '15 de septiembre de 2026',
  },
  banderadle: {
    name: 'BanderaDLE', kicker: 'Manual de identificación', title: 'Una bandera que se enfoca intento a intento.',
    intro: 'BanderaDLE propone reconocer uno de 195 países a partir de su bandera pixelada. Las rondas son ilimitadas y cada respuesta incorrecta aumenta la resolución hasta revelar la imagen completa.',
    rules: ['Observá la bandera pixelada y elegí un país del buscador.', 'Cada error o intento pasado consume una oportunidad y agrega más detalle a la imagen.', 'Acertá antes del sexto intento; al terminar se revela la bandera completa y el país correcto.'],
    methodology: 'El juego reutiliza el catálogo geográfico local de Game-DLE y las banderas SVG de flag-icons 7.5.0. El conjunto jugable incluye 193 miembros de las Naciones Unidas y sus dos estados observadores. Las imágenes y los datos se sirven desde el propio sitio: no se consulta una API durante la partida. La selección de cada ronda es aleatoria y evita repetir inmediatamente el país anterior.',
    feedback: 'La bandera comienza renderizada al cinco por ciento de su resolución y sube progresivamente a 7, 10, 14, 20 y 28 por ciento. Un acierto, el sexto error o el sexto intento pasado revela la imagen completa. Las banderas de diseños simples pueden seguir siendo reconocibles desde el comienzo; esa diferencia forma parte de la dificultad natural del catálogo.',
    sources: [{ label: 'flag-icons', url: 'https://github.com/lipis/flag-icons', note: 'Colección SVG utilizada, distribuida con licencia MIT.' }, { label: 'countries.dev', url: 'https://countries.dev/countries?full=true', note: 'Fuente del catálogo local de nombres y códigos de países.' }],
    faqs: [{ question: '¿Puedo seguir jugando después de una ronda?', answer: 'Sí. BanderaDLE no tiene límite diario y el botón Nueva bandera inicia otra ronda inmediatamente.' }, { question: '¿Por qué algunas banderas siguen siendo fáciles pixeladas?', answer: 'El pixelado oculta detalles y escudos, pero conserva grandes bloques de color. Los diseños simples ofrecen menos información que ocultar.' }, { question: '¿Se incluyen territorios dependientes?', answer: 'No. El conjunto actual utiliza 195 estados y no incorpora territorios dependientes.' }],
    related: [{ name: 'GeoDLE', route: '/games/geodle', reason: 'Más países y pistas' }, { name: '¿Quién es?', route: '/games/lol-who', reason: 'Otra imagen progresiva' }], reviewed: '23 de septiembre de 2026',
  },
  chronodle: {
    name: 'ChronoDLE', kicker: 'Notas del archivo', title: 'La historia se entiende mejor cuando cada hecho encuentra su lugar.',
    intro: 'ChronoDLE presenta cinco acontecimientos y pide ordenarlos del más antiguo al más reciente. Las fechas permanecen ocultas hasta el final para que la decisión dependa del contexto histórico.',
    rules: ['Arrastrá las tarjetas para construir una línea temporal.', 'Comprobá el orden y seguí las indicaciones.', 'Resolvé la ronda en un máximo de cuatro intentos.'],
    methodology: 'Cada acontecimiento incluye fecha, región, categoría, resumen y fuente. Las rondas combinan eventos de distintas épocas mediante una semilla estable; el orden inicial nunca coincide deliberadamente con la solución completa.',
    feedback: 'Verde indica posición correcta. Las flechas señalan que el acontecimiento debe moverse hacia una época anterior o posterior dentro de la lista.',
    sources: [{ label: 'Fuentes por acontecimiento', url: '/historia', note: 'Archivo público de acontecimientos y referencias, sin necesidad de terminar una partida.' }],
    faqs: [{ question: '¿Por qué algunas fechas históricas varían?', answer: 'Cuando existen calendarios o interpretaciones diferentes, elegimos una fecha de referencia y procuramos respaldarla con la fuente enlazada.' }, { question: '¿Las rondas se terminan?', answer: 'No. El archivo combina acontecimientos en rondas ilimitadas.' }],
    related: [{ name: 'Palmó Primero', route: '/games/palmodle', reason: 'Fechas y personajes' }, { name: 'GeoDLE', route: '/games/geodle', reason: 'Contexto mundial' }], reviewed: '25 de agosto de 2026',
  },
  rankdle: {
    name: 'RankDLE', kicker: 'Manual de clasificación', title: 'Ordenar también es una forma de aprender.',
    intro: 'RankDLE combina cinco elementos de una categoría y propone clasificarlos según una magnitud concreta: altura, superficie, fecha, velocidad u otro criterio indicado en la ronda.',
    rules: ['Leé con atención el criterio y la dirección solicitada.', 'Arrastrá los cinco elementos hasta formar el ranking.', 'Usá el feedback para corregir posiciones en cuatro intentos.'],
    methodology: 'Cada categoría define unidad, sentido del orden, valores, explicación y fuente. Los conjuntos se revisan manualmente y mantienen valores comparables dentro de la misma referencia.',
    feedback: 'Una posición correcta queda marcada; las flechas indican hacia qué extremo del ranking debe moverse el elemento. Los valores exactos se revelan al terminar.',
    sources: [{ label: 'Fuentes por categoría', url: '/rankings', note: 'Categorías, valores y referencias disponibles sin jugar.' }],
    faqs: [{ question: '¿Se mezclan fuentes dentro de una ronda?', answer: 'Cada desafío busca mantener una referencia principal para que las cifras sean comparables.' }, { question: '¿Los rankings pueden cambiar?', answer: 'Sí, especialmente los basados en población o récords. La fecha de revisión indica la vigencia del catálogo.' }],
    related: [{ name: 'ChronoDLE', route: '/games/chronodle', reason: 'Orden cronológico' }, { name: 'GeoDLE', route: '/games/geodle', reason: 'Datos geográficos' }], reviewed: '25 de agosto de 2026',
  },
  'futbol-mayor': {
    name: '¿Quién tiene más?', kicker: 'Mesa de estadísticas', title: 'El dato vale sólo cuando el alcance está claro.',
    intro: '¿Quién tiene más? enfrenta a dos futbolistas, clubes o selecciones y pide elegir cuál registra la cifra mayor. Cada edición mezcla diez duelos de goles, asistencias, partidos, disciplina y títulos, con tres vidas para llegar hasta el final.',
    rules: ['Leé la métrica: la competición y el período importan tanto como los nombres.', 'Elegí la tarjeta que creas que tiene el valor más alto.', 'Revisá ambos números, el alcance, la fecha de corte y la fuente antes de continuar.'],
    methodology: 'El catálogo inicial es una selección editorial construida con publicaciones oficiales de FIFA, UEFA y Premier League. Cada registro guarda la métrica, la unidad, el período cubierto, la fecha de corte y el enlace de procedencia. No sumamos datos de competiciones distintas ni presentamos un total de carrera cuando la referencia sólo cubre una liga. Los duelos sin una diferencia real se excluyen para que siempre exista una respuesta única. Las cifras se guardan localmente junto con el juego: una partida no depende de que una API externa responda en ese momento y una actualización de la fuente no puede cambiar una respuesta a mitad de ronda.',
    feedback: 'Al elegir, las dos tarjetas revelan su valor y una barra ayuda a comparar la magnitud. “Tiene más” marca la respuesta correcta; una selección equivocada consume una vida. El panel inferior explica cuánta diferencia hubo y define si el dato corresponde a Champions League, Premier League, Copa Mundial u otro alcance concreto.',
    sources: [
      { label: 'UEFA Champions League', url: 'https://www.uefa.com/uefachampionsleague/history/rankings/players/goals_scored/', note: 'Goleadores y registros históricos de competiciones UEFA.' },
      { label: 'FIFA World Cup', url: 'https://www.fifa.com/en/tournaments/mens/worldcup/articles/teams-most-victories-wins', note: 'Victorias y títulos de selecciones en la Copa Mundial masculina.' },
      { label: 'Premier League Records', url: 'https://www.premierleague.com/en/stats/records', note: 'Récords oficiales de jugadores, clubes y temporadas.' },
    ],
    faqs: [{ question: '¿Por qué la fecha de corte cambia entre preguntas?', answer: 'Cada fuente actualiza sus publicaciones en momentos distintos. El corte que aparece al revelar una respuesta indica exactamente qué versión respalda esa cifra.' }, { question: '¿Los goles incluyen amistosos y fases previas?', answer: 'Sólo cuando el alcance lo indica. Por ejemplo, los duelos de Champions League distinguen la competición principal de las rondas de clasificación.' }, { question: '¿Los datos se consultan en vivo?', answer: 'No. El catálogo se versiona y revisa antes de publicarse para que la misma ronda conserve la misma respuesta.' }],
    related: [{ name: 'FutbolDLE', route: '/games/futboldle', reason: 'Apellidos de jugadores' }, { name: 'RoscoDLE', route: '/games/roscodle', reason: 'Más cultura futbolera' }], reviewed: '23 de septiembre de 2026',
  },
  futboldle: {
    name: 'FutbolDLE', kicker: 'Guía de cancha', title: 'Cinco letras separan la pista del apellido correcto.',
    intro: 'FutbolDLE adapta el formato de palabras a apellidos de futbolistas. Cada ronda es ilimitada y utiliza jugadores reconocibles cuyo apellido normalizado tiene cinco letras.',
    rules: ['Escribí un apellido válido de cinco letras.', 'Interpretá colores como en un juego de palabras.', 'Encontrá al futbolista antes de agotar los intentos.'],
    methodology: 'El catálogo es manual y normaliza tildes, espacios y variantes para comparar exactamente cinco letras. La inclusión de un jugador considera reconocimiento y claridad del apellido, no una valoración deportiva.',
    feedback: 'Verde significa letra y posición correctas; amarillo, letra presente en otra posición; gris, letra ausente o una repetición que excede la solución.',
    sources: [{ label: 'FIFA', url: 'https://www.fifa.com/', note: 'Consulta de competiciones y perfiles internacionales.' }, { label: 'AFA', url: 'https://www.afa.com.ar/', note: 'Referencia para fútbol argentino.' }, { label: 'UEFA', url: 'https://www.uefa.com/', note: 'Referencia de competiciones europeas.' }],
    faqs: [{ question: '¿Se escriben las tildes?', answer: 'La comparación normaliza los apellidos para conservar el formato de cinco letras.' }, { question: '¿Puede repetirse un jugador?', answer: 'Las rondas son ilimitadas y el catálogo puede volver a utilizarse, pero la selección cambia entre partidas.' }],
    related: [{ name: 'RoscoDLE', route: '/games/roscodle', reason: 'Especiales de clubes' }, { name: 'Wordle', route: '/games/wordle', reason: 'Palabras diarias' }], reviewed: '25 de agosto de 2026',
  },
  roscodle: {
    name: 'RoscoDLE', kicker: 'Reglamento del rosco', title: 'Un abecedario de fútbol contra el reloj.',
    intro: 'RoscoDLE propone responder definiciones futboleras letra por letra. Incluye categorías generales y especiales dedicados a clubes, ligas o temas concretos.',
    rules: ['Elegí una categoría y comenzá el rosco.', 'Respondé o pasá para volver a esa letra después.', 'Completá la mayor cantidad antes de que termine el tiempo.'],
    methodology: 'Las definiciones y respuestas se redactan y agrupan manualmente. Los especiales de clubes distinguen relaciones directas y respuestas que contienen la letra cuando no es razonable exigir que comiencen con ella.',
    feedback: 'Verde marca acierto, rojo error y el estado neutral conserva preguntas pendientes. Antes de iniciar se informa qué relación tiene cada respuesta con la letra.',
    sources: [{ label: 'FIFA', url: 'https://www.fifa.com/', note: 'Referencia internacional.' }, { label: 'CONMEBOL', url: 'https://www.conmebol.com/', note: 'Competiciones sudamericanas.' }, { label: 'AFA', url: 'https://www.afa.com.ar/', note: 'Referencia argentina.' }],
    faqs: [{ question: '¿Se aceptan variantes?', answer: 'Las respuestas pueden contemplar formas conocidas, pero se evita aceptar términos ambiguos que cambien el sentido de la definición.' }, { question: '¿Los planteles están siempre actualizados?', answer: 'Los especiales indican su catálogo vigente; transferencias recientes pueden requerir una revisión posterior.' }],
    related: [{ name: 'FutbolDLE', route: '/games/futboldle', reason: 'Apellidos de jugadores' }, { name: 'Tutti Frutti', route: '/games/tuttifrutti', reason: 'Categorías con amigos' }], reviewed: '25 de agosto de 2026',
  },
  palmodle: {
    name: 'Palmó Primero', kicker: 'Notas del obituario', title: 'Una comparación rápida entre las últimas páginas de la historia.',
    intro: 'Palmó Primero enfrenta a dos figuras conocidas y pregunta cuál murió antes. Una partida mezcla diez duelos al azar, no repite personas y conserva la combinación si recargás la página.',
    rules: ['Leé los dos nombres, profesiones y países.', 'Elegí a quien creas que murió primero.', 'Después de responder se revelan ambas fechas y la distancia entre ellas.'],
    methodology: 'El catálogo reúne figuras históricas, científicas, artísticas, políticas y deportivas. Las fechas se normalizan con calendario gregoriano cuando corresponde y cada partida utiliza una semilla aleatoria almacenada localmente.',
    feedback: 'La tarjeta correcta muestra “Fue primero”; una elección incorrecta consume una de las tres vidas. La partida termina al completar diez duelos o perder todas las vidas.',
    sources: [{ label: 'Encyclopaedia Britannica', url: 'https://www.britannica.com/biography', note: 'Referencia biográfica general contrastada con archivos y fundaciones.' }, { label: 'Biography.com', url: 'https://www.biography.com/', note: 'Consulta complementaria de cronologías personales.' }],
    faqs: [{ question: '¿Las parejas se repiten?', answer: 'Una persona no vuelve a aparecer dentro de la misma partida de diez duelos. Una partida futura puede combinarla de otra manera.' }, { question: '¿Por qué dos fechas pueden estar muy cerca?', answer: 'Es intencional: algunos duelos buscan poner a prueba diferencias de días o meses, no solamente de décadas.' }],
    related: [{ name: 'ChronoDLE', route: '/games/chronodle', reason: 'Ordenar la historia' }, { name: 'RankDLE', route: '/games/rankdle', reason: 'Clasificar datos' }], reviewed: '25 de agosto de 2026',
  },
};

@Component({
  selector: 'app-game-editorial-content',
  imports: [RouterLink],
  templateUrl: './game-editorial-content.component.html',
  styleUrl: './game-editorial-content.component.css',
})
export class GameEditorialContentComponent {
  readonly gameId = input.required<string>();
  readonly content = computed(() => CONTENT[this.gameId()] ?? null);
}
