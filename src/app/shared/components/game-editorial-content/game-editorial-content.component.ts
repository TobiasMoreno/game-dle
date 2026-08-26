import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

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

interface GameEditorialContent {
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
    faqs: [{ question: '¿La palabra cambia si recargo?', answer: 'No. La solución es la misma durante todo el día según la fecha de Argentina.' }, { question: '¿Se tienen en cuenta las tildes?', answer: 'El tablero prioriza las cinco letras de la palabra; las reglas concretas de normalización se aplican de manera uniforme a todos los intentos.' }],
    related: [{ name: 'RoscoDLE', route: '/games/roscodle', reason: 'Más vocabulario' }, { name: 'FutbolDLE', route: '/games/futboldle', reason: 'Cinco letras y fútbol' }], reviewed: '25 de agosto de 2026',
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
    intro: 'Serpentile es un rompecabezas diario de conexiones. Cada bloque puede girarse y el objetivo es construir un camino continuo para la serpiente sin dejarla salir del tablero.',
    rules: ['Tocá una pieza para girarla.', 'Conectá la entrada con la salida sin cortes.', 'Terminá usando la menor cantidad posible de movimientos.'],
    methodology: 'Los tableros se generan dentro de Game-DLE a partir de un recorrido válido y luego se mezclan sus orientaciones. Antes de jugar se verifica que exista una solución y que el estado inicial no esté ya resuelto.',
    feedback: 'Las conexiones y bordes muestran por dónde puede continuar el recorrido. El puntaje considera resolución, movimientos y tiempo según las reglas visibles de la partida.',
    sources: [{ label: 'Generador propio de Game-DLE', url: '/acerca-de', note: 'La lógica y validación del tablero se ejecutan localmente.' }],
    faqs: [{ question: '¿El tablero puede ser imposible?', answer: 'La generación parte de una solución válida. Si encontrás un caso imposible, podés informarlo con la fecha del desafío.' }, { question: '¿Recargar cambia el tablero?', answer: 'No. El desafío diario se mantiene estable durante esa fecha.' }],
    related: [{ name: 'Wordle', route: '/games/wordle', reason: 'Otro desafío diario' }, { name: 'GeoDLE', route: '/games/geodle', reason: 'Resolver con pistas' }], reviewed: '25 de agosto de 2026',
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
    name: 'GeoDLE', kicker: 'Cuaderno de viaje', title: 'Cada intento dibuja un camino hacia el país oculto.',
    intro: 'GeoDLE propone encontrar un país mediante distancia, dirección, continente y otras pistas geográficas. Las rondas son ilimitadas y cada respuesta reduce el mapa posible.',
    rules: ['Elegí un país como primer intento.', 'Usá la distancia y la flecha para orientar la búsqueda.', 'Combiná continente, superficie y población hasta encontrar la respuesta.'],
    methodology: 'El catálogo normaliza nombres, coordenadas representativas, códigos y atributos de países. Las distancias son aproximaciones geodésicas entre puntos de referencia y no representan la separación mínima exacta entre fronteras.',
    feedback: 'La flecha marca una dirección general hacia la respuesta. Los colores indican coincidencia o cercanía según el tipo de dato; deben interpretarse junto con la distancia mostrada.',
    sources: [{ label: 'World Bank Open Data', url: 'https://data.worldbank.org/', note: 'Referencia de indicadores por país.' }, { label: 'UN M49', url: 'https://unstats.un.org/unsd/methodology/m49/', note: 'Regiones y códigos geográficos.' }, { label: 'Natural Earth', url: 'https://www.naturalearthdata.com/', note: 'Referencia cartográfica pública.' }],
    faqs: [{ question: '¿La distancia es hasta la frontera?', answer: 'No. Es una aproximación entre coordenadas representativas, útil como pista del juego.' }, { question: '¿Qué pasa con territorios y países transcontinentales?', answer: 'Game-DLE usa una clasificación normalizada para que cada ronda tenga una comparación consistente.' }],
    related: [{ name: 'ChronoDLE', route: '/games/chronodle', reason: 'Historia mundial' }, { name: 'RankDLE', route: '/games/rankdle', reason: 'Comparar magnitudes' }], reviewed: '25 de agosto de 2026',
  },
  chronodle: {
    name: 'ChronoDLE', kicker: 'Notas del archivo', title: 'La historia se entiende mejor cuando cada hecho encuentra su lugar.',
    intro: 'ChronoDLE presenta cinco acontecimientos y pide ordenarlos del más antiguo al más reciente. Las fechas permanecen ocultas hasta el final para que la decisión dependa del contexto histórico.',
    rules: ['Arrastrá las tarjetas para construir una línea temporal.', 'Comprobá el orden y seguí las indicaciones.', 'Resolvé la ronda en un máximo de cuatro intentos.'],
    methodology: 'Cada acontecimiento incluye fecha, región, categoría, resumen y fuente. Las rondas combinan eventos de distintas épocas mediante una semilla estable; el orden inicial nunca coincide deliberadamente con la solución completa.',
    feedback: 'Verde indica posición correcta. Las flechas señalan que el acontecimiento debe moverse hacia una época anterior o posterior dentro de la lista.',
    sources: [{ label: 'Fuentes por acontecimiento', url: '/games/chronodle', note: 'La cronología final enlaza archivos, instituciones y referencias utilizadas en cada tarjeta.' }],
    faqs: [{ question: '¿Por qué algunas fechas históricas varían?', answer: 'Cuando existen calendarios o interpretaciones diferentes, elegimos una fecha de referencia y procuramos respaldarla con la fuente enlazada.' }, { question: '¿Las rondas se terminan?', answer: 'No. El archivo combina acontecimientos en rondas ilimitadas.' }],
    related: [{ name: 'Palmó Primero', route: '/games/palmodle', reason: 'Fechas y personajes' }, { name: 'GeoDLE', route: '/games/geodle', reason: 'Contexto mundial' }], reviewed: '25 de agosto de 2026',
  },
  rankdle: {
    name: 'RankDLE', kicker: 'Manual de clasificación', title: 'Ordenar también es una forma de aprender.',
    intro: 'RankDLE combina cinco elementos de una categoría y propone clasificarlos según una magnitud concreta: altura, superficie, fecha, velocidad u otro criterio indicado en la ronda.',
    rules: ['Leé con atención el criterio y la dirección solicitada.', 'Arrastrá los cinco elementos hasta formar el ranking.', 'Usá el feedback para corregir posiciones en cuatro intentos.'],
    methodology: 'Cada categoría define unidad, sentido del orden, valores, explicación y fuente. Los conjuntos se revisan manualmente y mantienen valores comparables dentro de la misma referencia.',
    feedback: 'Una posición correcta queda marcada; las flechas indican hacia qué extremo del ranking debe moverse el elemento. Los valores exactos se revelan al terminar.',
    sources: [{ label: 'Fuentes por categoría', url: '/games/rankdle', note: 'La explicación final enlaza NASA, Banco Mundial, IUPAC y otras referencias según la ronda.' }],
    faqs: [{ question: '¿Se mezclan fuentes dentro de una ronda?', answer: 'Cada desafío busca mantener una referencia principal para que las cifras sean comparables.' }, { question: '¿Los rankings pueden cambiar?', answer: 'Sí, especialmente los basados en población o récords. La fecha de revisión indica la vigencia del catálogo.' }],
    related: [{ name: 'ChronoDLE', route: '/games/chronodle', reason: 'Orden cronológico' }, { name: 'GeoDLE', route: '/games/geodle', reason: 'Datos geográficos' }], reviewed: '25 de agosto de 2026',
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
