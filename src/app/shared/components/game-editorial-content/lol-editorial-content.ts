import type { GameEditorialContent } from './game-editorial-content.component';

const sources = [
  { label: 'Campeones de League of Legends', url: 'https://www.leagueoflegends.com/es-es/champions/', note: 'Perfiles oficiales para consultar identidad y universo de los campeones.' },
  { label: 'Riot Developer Portal', url: 'https://developer.riotgames.com/docs/lol', note: 'Documentación de Data Dragon y recursos del juego original.' },
  { label: 'Catálogos y límites', url: '/metodologia', note: 'Cómo se usa la instantánea local de campeones en Game-DLE.' },
];

export const LOL_EDITORIAL_CONTENT: Record<string, GameEditorialContent> = {
  'lol-memory': {
    name: 'Memoria de campeones', kicker: 'Guía de memoria', title: 'Recordá la identidad, no solamente dónde viste una imagen.',
    intro: 'Este modo adapta el juego de parejas a League of Legends. Cada ronda selecciona seis campeones y crea doce cartas: una con el retrato y otra con el nombre de cada uno. No se buscan dos imágenes iguales; hay que relacionar una identidad visual con su nombre.',
    rules: ['Revelá dos cartas que todavía no estén emparejadas.', 'Si corresponden al mismo campeón, quedan descubiertas y dejan de poder seleccionarse.', 'Si no coinciden, observá ambas y recordá sus posiciones antes de que se oculten.', 'Completá las seis parejas para sumar una ronda y comenzar otra.'],
    methodology: 'La ronda utiliza el catálogo local campeones_lol.json y descarta entradas sin los datos mínimos. Se mezclan tanto los campeones elegidos como las doce cartas. La ubicación de una carta no indica su rol, región ni antigüedad. Es una actividad de reconocimiento y memoria, no una prueba de habilidad competitiva dentro de LoL.',
    feedback: 'El contador de parejas permite distinguir el progreso del puntaje global. Una carta acertada queda marcada; seleccionar una carta ya descubierta no produce una nueva pareja. Para practicar, intentá decir mentalmente el nombre al ver cada retrato y ubicarlo en una fila concreta, en lugar de hacer clic al azar.',
    sources,
    faqs: [
      { question: '¿Puedo unir dos retratos?', answer: 'Cada campeón tiene una carta visual y una de texto. La pareja se identifica por el campeón, no por compartir un tipo de carta.' },
      { question: '¿Las cartas cambian durante la ronda?', answer: 'No. La distribución permanece mientras resolvés esa ronda; Nueva ronda prepara otra selección.' },
      { question: '¿Necesito una cuenta de Riot?', answer: 'No. Este modo se juega directamente en Game-DLE y no consulta tu cuenta ni tu rango de League of Legends.' },
    ],
    related: [{ name: '¿Quién es?', route: '/games/lol-who', reason: 'Practicar reconocimiento' }, { name: 'Guía de memoria', route: '/guias/lol-memory', reason: 'Estrategias y reglas' }], reviewed: '15 de septiembre de 2026',
  },
  'lol-timeline': {
    name: 'Timeline de campeones', kicker: 'Guía de cronología', title: 'La fecha del campeón no es la fecha de su último cambio.',
    intro: 'Timeline propone ordenar cinco campeones desde el lanzamiento más antiguo al más reciente. El reto se centra en el año original registrado en el catálogo, no en la salida de una skin ni en una actualización visual. Las imágenes sirven para reconocer los nombres; la respuesta exige una relación cronológica.',
    rules: ['Leé los cinco campeones y ubicá primero los extremos que reconocés.', 'Usá las flechas de cada tarjeta para moverla hacia el principio o el final.', 'Comprobá cuando todas las tarjetas estén ordenadas.', 'La resolución revela años y permite preparar una nueva ronda.'],
    methodology: 'Los campeones proceden de campeones_lol.json. La comparación usa anio_de_lanzamiento, que conserva años enteros: el juego no pretende distinguir días o meses de lanzamiento. Dos campeones del mismo año pueden intercambiarse sin quebrar el orden no decreciente. Las rondas se mezclan localmente y no representan el calendario completo de Riot.',
    feedback: 'El extremo izquierdo corresponde a lo más antiguo y el derecho a lo más reciente. El resultado confirma el orden o lo corrige y muestra los años. Una forma de razonar es agrupar por épocas conocidas antes de resolver las posiciones intermedias; la complejidad visual del retrato no permite inferir la fecha de salida.',
    sources,
    faqs: [
      { question: '¿Qué ocurre si dos campeones salieron el mismo año?', answer: 'Como el catálogo usa años, el orden entre esos dos nombres puede variar. Ambos deben quedar entre los años anteriores y posteriores.' },
      { question: '¿Un rework cambia el año usado?', answer: 'No se compara el último rework. La referencia es el año original incluido en el catálogo del campeón.' },
      { question: '¿Puedo consultar el criterio antes de jugar?', answer: 'Sí. Esta explicación y la guía de Timeline están disponibles sin completar una ronda.' },
    ],
    related: [{ name: 'ChronoDLE', route: '/games/chronodle', reason: 'Otra cronología' }, { name: 'Guía de Timeline', route: '/guias/lol-timeline', reason: 'Años y empates' }], reviewed: '15 de septiembre de 2026',
  },
  'lol-who': {
    name: 'LoL: ¿Quién es?', kicker: 'Guía de reconocimiento', title: 'Separá el nombre del campeón de la apariencia que estás viendo.',
    intro: '¿Quién es? muestra un detalle ampliado de una ilustración de League of Legends. El primer objetivo es reconocer al campeón; después aparece una segunda fase para identificar la skin de esa imagen. Esto distingue la identidad del personaje de una apariencia concreta del catálogo.',
    rules: ['Observá formas, arma, postura y colores antes de responder.', 'Escribí un nombre y elegí un campeón del buscador.', 'Cada intento incorrecto reduce el zoom y muestra más contexto.', 'Al acertar el campeón, elegí el nombre de la skin y completá la ronda.'],
    methodology: 'El modo usa campeones y skins del catálogo local, con identificadores e imágenes públicas de la franquicia. El encuadre y la selección se preparan por ronda. La disponibilidad de ilustraciones depende de los recursos externos; no se consulta una cuenta de jugador ni se detectan las skins que compraste. Game-DLE es independiente de Riot Games.',
    feedback: 'Un error en la primera fase sirve como pista al ampliar el área visible. La segunda fase utiliza las opciones de skins correspondientes al campeón acertado. Reconocer colores aislados puede confundir porque distintas líneas de skins comparten paletas; conviene sumar silueta y elementos característicos antes de decidir.',
    sources,
    faqs: [
      { question: '¿Por qué cambia el estilo de un campeón conocido?', answer: 'La ilustración puede corresponder a una skin. La identidad se adivina antes que el nombre de esa apariencia.' },
      { question: '¿Se necesita haber comprado la skin?', answer: 'No. La actividad usa el catálogo de Game-DLE y no verifica inventarios de cuentas.' },
      { question: '¿Qué hago si una imagen no carga?', answer: 'Probá recargar y reportá la ronda o el campeón desde Contacto si el recurso sigue fallando.' },
    ],
    related: [{ name: 'Memoria', route: '/games/lol-memory', reason: 'Retratos y nombres' }, { name: 'Guía de reconocimiento', route: '/guias/lol-who', reason: 'Las dos fases' }], reviewed: '15 de septiembre de 2026',
  },
  'lol-connections': {
    name: 'Conexiones LoL', kicker: 'Guía de conexiones', title: 'Compartir una característica no basta: buscá el grupo completo.',
    intro: 'Conexiones LoL reúne dieciséis campeones en cuatro grupos ocultos de cuatro. Cada solución combina características del catálogo y debe interpretarse dentro del tablero de esa ronda. Un campeón puede compartir un atributo con varios nombres, pero la partición preparada asigna cada carta a una sola solución.',
    rules: ['Seleccioná exactamente cuatro campeones.', 'Comprobá si forman uno de los grupos ocultos.', 'Cuando acertás, los nombres se retiran y aparece el criterio de la conexión.', 'Usá Mezclar para cambiar la disposición o Deseleccionar para replantear una hipótesis.', 'Después de suficientes errores podés rendirte y consultar las conexiones.'],
    methodology: 'El generador local combina atributos normalizados de campeones_lol.json. Los grupos preparados contienen cuatro coincidencias y evitan repetir campeones entre soluciones. No se trata de una taxonomía oficial ni de una afirmación de que solo esos cuatro campeones comparten el rasgo en todo LoL: el alcance es el conjunto seleccionado para jugar.',
    feedback: 'Una selección acertada revela un título y sus cuatro miembros. Una selección incorrecta suma un error, pero no cambia las conexiones de esa ronda. Conviene probar una relación completa y pensar en atributos adicionales cuando una categoría parece abarcar más de cuatro cartas. Mezclar solo cambia posiciones, no respuestas.',
    sources,
    faqs: [
      { question: '¿Una región por sí sola siempre es la respuesta?', answer: 'No. La conexión puede combinar dos características. Buscá una hipótesis que explique los cuatro miembros y encaje con los grupos restantes.' },
      { question: '¿Mezclar genera otro tablero?', answer: 'No. Reordena visualmente las mismas cartas de la ronda actual.' },
      { question: '¿El grupo describe a todos los campeones de esa categoría?', answer: 'No. Es una solución del tablero seleccionado, no un listado exhaustivo de la franquicia.' },
    ],
    related: [{ name: 'LoL DLE', route: '/games/loldle', reason: 'Comparar atributos' }, { name: 'Guía de conexiones', route: '/guias/lol-connections', reason: 'Razonar una partición' }], reviewed: '15 de septiembre de 2026',
  },
};
