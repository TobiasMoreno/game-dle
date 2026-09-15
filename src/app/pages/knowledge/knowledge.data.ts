export interface KnowledgeSection {
  title: string;
  paragraphs: string[];
  rows?: string[][];
}
export interface KnowledgeArticle {
  title: string;
  lead: string;
  game?: string;
  sections: KnowledgeSection[];
}

export const ARTICLES: Record<string, KnowledgeArticle> = {
  'como-jugar': {
    title: 'Cómo jugar en Game-DLE',
    lead: 'Elegí una mecánica, entendé sus pistas y conservá el progreso. No necesitás vincular una cuenta de Google para comenzar.',
    sections: [
      { title: 'Elegí el tipo de partida', paragraphs: ['Los desafíos diarios usan la fecha de Argentina para registrar la actividad. En los modos que permiten continuar, al terminar el desafío podés preparar rondas libres. Las rondas ilimitadas sirven para practicar sin esperar al día siguiente; no deben confundirse con un nuevo desafío diario.', 'Los juegos de palabras requieren escribir y validar una respuesta. LoL DLE y One Piece DLE comparan atributos. ChronoDLE y RankDLE piden ordenar tarjetas. Serpentile exige anticipar un recorrido en movimiento. MusicDLE permite reconocer canciones por audio. Tutti Frutti comparte una sala entre participantes.'] },
      { title: 'Antes del primer intento', paragraphs: ['Leé el objetivo y el criterio visibles en la página. En una clasificación, comprobá qué extremo representa lo menor o lo más antiguo. En los juegos de atributos, una flecha numérica no señala necesariamente una posición en el mapa. Si una palabra o nombre no se admite, elegí una entrada del catálogo o del buscador.', 'Las guías muestran ejemplos ajenos a la solución actual. Podés consultarlas sin gastar intentos ni revelar una partida. No todos los modos usan seis oportunidades: Clave Extrema tiene ocho y las rondas de ordenación tienen cuatro comprobaciones.'] },
      { title: 'Progreso y privacidad', paragraphs: ['El navegador guarda preferencias y progreso para que puedas retomar partidas. Borrar los datos del sitio o usar otro dispositivo puede cambiar lo que recuperás. La sincronización diaria mediante Firebase es una función distinta del almacenamiento de cada tablero.', 'Tutti Frutti necesita un nombre elegido y un código para compartir la mesa. Evitá usar información sensible como nombre de jugador. Los servicios externos tienen sus propias políticas; Privacidad explica qué funciones utilizan Firebase y YouTube.'] },
      { title: 'Si algo falla', paragraphs: ['Si un catálogo no carga, probá recargar una vez y comprobá tu conexión. Si persiste, informá juego, dispositivo y mensaje visible desde Contacto. Una imagen o video externo puede dejar de estar disponible sin que todas las partidas del sitio estén afectadas. No envíes contraseñas ni documentos personales al reportar un error.'] },
    ],
  },
  'wordle-letras-repetidas': {
    title: 'Wordle: letras repetidas y normalización', game: '/games/wordle',
    lead: 'Una letra puede aparecer en la solución y aun así tener una copia gris. El juego cuenta ocurrencias, no solo si un carácter existe.',
    sections: [
      { title: 'Primero se asignan las posiciones exactas', paragraphs: ['Cada verde consume una ocurrencia de la solución. Después se comparan las letras restantes con las ocurrencias todavía disponibles. Amarillo significa que queda una copia en otra posición; gris significa que no queda una copia para esa casilla.', 'Si la solución de un ejemplo fuera LLAVE y escribieras LLAMA, las primeras tres posiciones coincidirían. M no aparece y la segunda A del intento no tiene otra copia disponible. Esa A queda gris aunque ya exista una A verde.'], rows: [['Solución de ejemplo', 'Intento', 'Lectura'], ['LLAVE', 'LLAMA', 'L, L y A exactas; M y la A adicional fuera']] },
      { title: 'Qué se normaliza', paragraphs: ['El campo de Wordle transforma a mayúsculas y elimina marcas diacríticas antes de conservar A–Z. Por ejemplo, una vocal con tilde se convierte en su vocal base. En este campo Ñ se normaliza a N: no debe confundirse esta implementación con diccionarios que conservan ambos caracteres como letras distintas.', 'Una secuencia de cinco letras no es automáticamente válida. El intento necesita estar en el catálogo local. Las referencias de vocabulario permiten consultar significado, pero la aplicación no consulta la RAE en vivo al enviar cada palabra.'] },
      { title: 'Cómo aprovechar la información', paragraphs: ['Separá cantidad y posición. Si una letra tiene una coincidencia y otra copia descartada, no concluyas que la primera también está ausente. Conservá las posiciones verdes y usá las amarillas en otra casilla. Antes de enviar, revisá si la propuesta vuelve a probar una ubicación ya descartada.', 'Las rondas libres sirven para entrenar el método después del desafío. Compartir el resultado muestra el desempeño; no necesitás publicar la palabra oculta para comparar intentos con otra persona.'] },
    ],
  },
  'clave-extrema': {
    title: 'Clave Extrema: deducir con tres totales', game: '/games/clave-extrema',
    lead: 'Acá no se colorean letras individuales. Exactas, Movidas y Fuera describen el conjunto de cada intento.',
    sections: [
      { title: 'Los números suman cinco', paragraphs: ['Exactas cuenta ocurrencias en la casilla correcta. Movidas cuenta letras que pueden asignarse a otra posición de la solución. Fuera completa las cinco letras que no pudieron asignarse. Primero se descuentan las exactas para no reutilizar una ocurrencia.', 'Con LLAVE como solución de ejemplo, LLAMA produciría 3 Exactas, 0 Movidas y 2 Fuera. El total no identifica cuál de las letras causó cada número: deducirlo exige comparar varios intentos.'], rows: [['Ejemplo', 'Exactas', 'Movidas', 'Fuera'], ['LLAMA frente a LLAVE', '3', '0', '2']] },
      { title: 'Comparar hipótesis', paragraphs: ['Un intento con cero Exactas todavía puede contener letras útiles. Si Movidas es alto, hay que redistribuirlas; si Fuera es alto, conviene revisar el conjunto de letras. Cambiar muchas cosas a la vez dificulta atribuir el resultado a una hipótesis concreta.', 'Intentá formular una pregunta antes de enviar: ¿esta letra está presente?, ¿este par tiene el orden correcto?, ¿hay dos copias? Después contrastá esa idea con los tres totales y con los intentos previos. El teclado permanece neutral para no revelar una pista que los números no dan.'] },
      { title: 'Límites de una deducción', paragraphs: ['Distintas soluciones pueden producir el mismo resultado para un intento. Un total no demuestra una palabra específica. Las ocho oportunidades permiten combinar información; la guía no contiene una estrategia que garantice resolver cualquier selección del catálogo.', 'Cada intento debe ser una palabra válida del catálogo de cinco letras. Para practicar letras repetidas, compará este ejemplo con la guía de Wordle: la asignación de ocurrencias es similar, pero acá solo ves los totales.'] },
    ],
  },
  geodle: {
    title: 'GeoDLE: interpretar atributos y flechas', game: '/games/geodle',
    lead: 'El motor compara siete atributos. No calcula kilómetros ni un rumbo hacia el país oculto.',
    sections: [
      { title: 'Coincidencias exactas y parciales', paragraphs: ['Continente y subregión se comparan como categorías normalizadas. Idiomas y hemisferios pueden contener más de un valor: verde indica igualdad de conjuntos y parcial indica que comparten al menos uno.', 'Los hemisferios se derivan de una coordenada representativa del catálogo. Esa pista no describe cada extremo de un país grande ni resuelve por sí sola territorios transcontinentales. El conjunto jugable tiene 195 estados, no todos los territorios del mundo.'] },
      { title: 'Leer una comparación numérica', paragraphs: ['Si una fila muestra una flecha arriba en población, el destino tiene más población que el país intentado. Abajo significa menos. La flecha no indica norte o sur y no es una instrucción para moverte en el mapa.', 'Superficie y población admiten una diferencia relativa de hasta el 15 % respecto del valor del destino para marcar cercanía. Fronteras exige igualdad del número de vecinos terrestres. Una población cercana no demuestra cercanía territorial.'], rows: [['Celda', 'Significado'], ['↑ población', 'El destino tiene una población mayor'], ['↓ superficie', 'El destino tiene una superficie menor'], ['Parcial en idiomas', 'Comparten algún idioma, pero los conjuntos no son idénticos']] },
      { title: 'Combinar pistas', paragraphs: ['Empezá reduciendo categorías: continente, subregión y hemisferios. Después compará magnitudes e idiomas. Si un país comparte región y lengua pero difiere mucho en superficie, buscá una alternativa que cumpla ambos tipos de pistas.', 'El catálogo es una instantánea de countries.dev. La población no se actualiza durante el intento y puede diferir de otra fuente o de un año más reciente. Metodología identifica fecha y procedencia para que puedas interpretar esos límites.'] },
    ],
  },
  serpentile: {
    title: 'Serpentile: anticipar un recorrido hexagonal', game: '/games/serpentile',
    lead: 'La serpiente avanza por cauces. Girá piezas para alcanzar luciérnagas sin apuntar fuera del tablero.',
    sections: [
      { title: 'Un giro tiene seis orientaciones', paragraphs: ['Cada clic gira un bloque 60 grados. Los caminos de la pieza rotan juntos: no se cambia solamente la salida que estás mirando. La entrada por la que llega la serpiente determina qué cauce recorre y por dónde continúa.', 'Antes de girar, observá de qué lado entrará la cabeza. Una orientación que conecta dos lados puede ser útil para una entrada y peligrosa para otra. En el borde, revisá especialmente que la continuación apunte a una celda del tablero.'] },
      { title: 'Planificá antes del próximo paso', paragraphs: ['No alcanza con orientar una pieza hacia la luciérnaga. Comprobá también la pieza siguiente y el regreso después de recoger el objetivo. Cada luciérnaga recogida da lugar a otra hasta completar la cantidad de objetivos de la ronda.', 'La función de pausa permite estudiar el recorrido. Reiniciar prepara de nuevo la ronda correspondiente; Otra ronda está disponible al terminar. Estos controles tienen finalidades distintas y no conviene confundir reinicio con progreso.'] },
      { title: 'Puntaje y pasos', paragraphs: ['El puntaje mostrado suma 100 puntos por objetivo recogido. El contador de pasos registra el avance de la serpiente: no es el número de clics con que giraste piezas. Tiempo, pasos y puntaje deben leerse por separado.', 'Una pérdida indica que el último cauce apuntó fuera del dibujo. Revisá la orientación anterior para entender la causa. Esta guía describe la mecánica implementada y no afirma que cualquier disposición de giros tenga solución garantizada.'] },
    ],
  },
  tuttifrutti: {
    title: 'Tutti Frutti: salas, votos y puntos', game: '/games/tuttifrutti',
    lead: 'La mesa valida las respuestas antes de calcular el puntaje. Que una palabra sea distinta no basta si fue rechazada.',
    sections: [
      { title: 'Preparar una mesa', paragraphs: ['Elegí un nombre de jugador, creá una sala o ingresá su código. El anfitrión configura categorías, rondas y duración. Compartí el código con las personas con las que querés jugar; no es una contraseña para proteger información personal.', 'Las categorías se resuelven con una misma letra. Evitá respuestas vacías y acordá criterios de nombres propios o variantes antes de comenzar. La aplicación sincroniza respuestas y estado mediante Firebase.'] },
      { title: 'Cómo se valida', paragraphs: ['Las respuestas se presentan para votación. Hace falta una mayoría estricta: la mitad de los participantes redondeada hacia abajo más un voto. Tanto con cuatro como con cinco jugadores hacen falta tres votos positivos. La votación valida la mesa actual; no crea una definición universal de corrección lingüística.', 'El puntaje normaliza mayúsculas y marcas diacríticas para detectar respuestas repetidas. Una respuesta vacía o no aprobada suma cero. La igualdad para puntuar puede diferir de cómo dos participantes escriben visualmente la misma palabra.'] },
      { title: 'Ejemplos de puntuación por categoría', paragraphs: ['Se consideran solamente las respuestas aceptadas de esa categoría. Si la tuya es la única aceptada, suma 20. Si hay otras aceptadas pero la tuya no se repite, suma 10. Si tu respuesta aceptada coincide con la de otra persona, suma 5.', 'El resultado de la ronda suma las categorías y el acumulado suma rondas. Revisá las columnas antes de comparar únicamente el total: un rechazo o una repetición puede explicar la diferencia.'], rows: [['Situación', 'Puntos'], ['Única respuesta válida', '20'], ['Válida distinta entre varias', '10'], ['Válida repetida', '5'], ['Vacía o rechazada', '0']] },
      { title: 'Convivencia y privacidad', paragraphs: ['Votá por el criterio acordado, no para perjudicar a otra persona. Usá un apodo y evitá datos sensibles en respuestas. Privacidad explica el almacenamiento de salas y Contacto permite informar problemas; no envíes contraseñas ni documentos al reportarlos.'] },
    ],
  },
  'lol-memory': {
    title: 'Memoria LoL: relacionar retratos y nombres', game: '/games/lol-memory',
    lead: 'Doce cartas forman seis parejas de identidad. Cada campeón aparece como imagen y como nombre.',
    sections: [
      { title: 'Buscá una pareja de identidad', paragraphs: ['Reconocer un retrato es el primer paso; recordar su posición es el segundo. Una pareja correcta une las dos cartas del mismo campeón. No hace falta que tengan el mismo aspecto visual porque una es de texto.', 'Explorá por filas para construir un mapa mental estable. Cuando un intento falla, conservá la información de ambas cartas. Volver a abrir una carta que ya recordás solo ayuda si tenés una candidata para su pareja.'] },
      { title: 'Separá memoria de conocimiento', paragraphs: ['Si confundís campeones, usá el nombre revelado para aprender la identidad antes de continuar. Si reconocés todos pero olvidás posiciones, reducís el error al organizar la exploración. Son dificultades diferentes y conviene practicar cada una.', 'Las cartas emparejadas permanecen visibles. Esto reduce el conjunto pendiente y permite resolver por descarte al final. La ubicación de una carta no expresa una región o un rol del campeón.'] },
      { title: 'Qué significa completar una ronda', paragraphs: ['Completar seis parejas permite preparar una nueva mezcla. El puntaje del modo no es una medida del rango de LoL y no consulta tu cuenta de Riot. Podés jugar sin iniciar sesión.', 'La selección se basa en el catálogo local, no en un roster descargado en vivo en cada clic. Si un retrato falla, reportá el campeón y la página para revisar el recurso. En Metodología se explica el alcance y en el juego se enlazan referencias oficiales.'] },
    ],
  },
  'lol-timeline': {
    title: 'Timeline LoL: años originales y empates', game: '/games/lol-timeline',
    lead: 'El criterio es el año de lanzamiento del campeón registrado en Game-DLE. No es el año de la ilustración.',
    sections: [
      { title: 'Armá una secuencia no decreciente', paragraphs: ['Ubicá primero el campeón más antiguo que reconocés y el más reciente. Usá las flechas para mover las tarjetas intermedias. Comprobar evalúa que los años no retrocedan de izquierda a derecha.', 'El catálogo registra años, sin distinguir días y meses. Si dos campeones comparten año, su orden relativo puede intercambiarse. No intentes deducir una fecha más precisa que la que utiliza la comparación.'] },
      { title: 'No confundas lanzamiento y actualización', paragraphs: ['Una ilustración moderna puede representar un campeón antiguo. Un rework o una skin no implica que el personaje original haya aparecido ese año. Separá el diseño de la imagen del criterio cronológico.', 'Para practicar, agrupá por épocas conocidas y después contrastá los años revelados. Las posiciones corregidas explican la respuesta del conjunto elegido; no muestran todos los lanzamientos del juego original.'] },
      { title: 'Referencias y límites', paragraphs: ['El año procede de la instantánea local de campeones. Game-DLE no presenta el resultado como calendario oficial completo ni como verificación en vivo de parches.', 'Si detectás un año incorrecto, enviá el nombre y una referencia desde Contacto. Una corrección del catálogo puede modificar futuras rondas; la guía y la metodología permanecen disponibles sin jugar.'] },
    ],
  },
  'lol-who': {
    title: '¿Quién es?: campeón primero, skin después', game: '/games/lol-who',
    lead: 'El detalle ampliado exige reconocer una identidad y luego una apariencia específica.',
    sections: [
      { title: 'Reconocer con poca información', paragraphs: ['Prestá atención a arma, silueta y pose. Una paleta de color puede repetirse entre distintas líneas de skins; un único detalle no siempre identifica al campeón.', 'Cada error reduce el zoom y agrega contexto. Antes de responder otra vez, compará la nueva parte visible con tu hipótesis anterior. Si el detalle contradice tu propuesta, descartala en lugar de repetir el nombre.'] },
      { title: 'La segunda fase cambia la pregunta', paragraphs: ['Acertar el campeón no termina necesariamente la ronda. La selección de skin pregunta qué apariencia corresponde a la imagen. Las opciones pertenecen al campeón identificado.', 'No hace falta haber comprado una skin ni vincular una cuenta. El catálogo de Game-DLE contiene nombres e imágenes que usa el modo; no se accede al inventario personal de Riot.'] },
      { title: 'Cuando falla una imagen', paragraphs: ['La disponibilidad de las ilustraciones depende de recursos externos. Un error de imagen no demuestra que tu intento sea incorrecto. Recargá si la vista no permite reconocer ningún detalle y reportá la página si persiste.', 'El sitio es independiente de Riot Games. Las referencias oficiales permiten consultar el universo de campeones, mientras Metodología explica cómo se usa la selección local.'] },
    ],
  },
  'lol-connections': {
    title: 'Conexiones LoL: razonar cuatro grupos', game: '/games/lol-connections',
    lead: 'Una conexión válida tiene cuatro miembros y encaja en la partición de dieciséis cartas.',
    sections: [
      { title: 'Una relación necesita explicar el conjunto', paragraphs: ['Encontrar dos campeones de una región puede sugerir una hipótesis, pero no demuestra un grupo. Buscá los cuatro miembros y considerá si una segunda característica reduce las coincidencias.', 'El generador prepara una partición sin repetir campeones entre soluciones. Una categoría que abarque demasiadas cartas puede ser demasiado amplia para el tablero actual. El alcance de la respuesta es la ronda, no todo el catálogo oficial.'] },
      { title: 'Qué cambia cada control', paragraphs: ['Mezclar cambia la disposición y puede ayudarte a ver otras relaciones. No modifica los grupos ocultos. Deseleccionar limpia la hipótesis actual; Comprobar evalúa exactamente cuatro cartas.', 'Un grupo correcto se revela y reduce el problema restante. Los errores no reemplazan las conexiones. Cuando el modo ofrece Rendirse, podés revisar la partición y comparar el título con la relación que habías imaginado.'] },
      { title: 'Aprender de una solución', paragraphs: ['Después de revelar un grupo, identificá qué parte de la definición te faltó: región, rol, recurso u otra combinación. El objetivo no es memorizar posiciones sino distinguir atributos que separan grupos parecidos.', 'Los atributos son una normalización local de la franquicia y pueden requerir revisión. Si una conexión parece contradictoria, informá los cuatro nombres y el título del grupo desde Contacto para que pueda revisarse el caso concreto.'] },
    ],
  },
};

export const RANKING_CONTEXT: Record<string, string[]> = {
  'planetas-diametro': ['La comparación usa diámetro ecuatorial en kilómetros, no masa ni distancia al Sol. Un planeta de mayor diámetro puede tener una composición muy distinta de uno rocoso.', 'La Tierra y Venus tienen tamaños próximos; Marte es bastante menor y Neptuno pertenece a otra escala. Comparar primero familias de planetas ayuda a interpretar el orden sin confundir proximidad al Sol con tamaño.'],
  'montanas-altura': ['Se compara altura sobre el nivel del mar. No es prominencia respecto del terreno circundante ni longitud de una ruta de ascenso.', 'Las alturas pueden variar por método de medición, redondeo y cubierta de nieve. Los valores conservan la referencia del catálogo: diferencias entre fuentes deben revisarse antes de tratarlas como un error de orden.'],
  'paises-superficie': ['La unidad es el kilómetro cuadrado. Superficie no equivale a población ni a distancia entre ciudades; un territorio amplio puede tener baja densidad.', 'La definición de superficie y el tratamiento de áreas disputadas o agua pueden variar entre fuentes. Esta selección conserva valores comparables del catálogo y enlaza el indicador de referencia.'],
  'elementos-atomicos': ['El número atómico cuenta protones en el núcleo y determina qué elemento es. No es masa atómica ni abundancia en la naturaleza.', 'Carbono y oxígeno tienen números cercanos pero funciones y propiedades distintas. Comparar números atómicos ordena identidades químicas; no establece cuál elemento es más pesado en una muestra concreta.'],
  'rascacielos-altura': ['La altura arquitectónica sigue el criterio de la referencia CTBUH. No debe confundirse con piso ocupado más alto, elevación del terreno o altura hasta una antena funcional.', 'Una tabla de edificios necesita especificar qué mide. Los cinco ejemplos pertenecen a épocas y ciudades distintas; la comparación explica magnitudes, no un listado en vivo de todos los edificios del mundo.'],
  'videojuegos-lanzamiento': ['La comparación conserva el año de referencia indicado para cada título. Un prototipo, acceso temprano, lanzamiento regional y versión completa pueden tener fechas diferentes.', 'Minecraft usa el lanzamiento completo de 2011 y Fortnite la salida original de 2017. Esta selección no compara cuándo cada modo posterior ganó popularidad ni la fecha de una reedición.'],
  'animales-peso': ['Los valores son aproximaciones de masa adulta en kilogramos. Sexo, edad, región y ejemplar producen variaciones importantes: no representan un récord individual.', 'Comparar órdenes de magnitud es más útil que interpretar cada cifra como peso universal de la especie. Un símbolo de aproximación recuerda que la respuesta del juego usa un valor representativo del catálogo.'],
  'peliculas-duracion': ['Se compara duración en minutos de las versiones de referencia del catálogo. Montajes extendidos y ediciones regionales pueden tener otros tiempos.', 'Una película más larga no es necesariamente mejor ni pertenece a un género concreto. Las notas aportan contexto histórico y la fuente permite contrastar la obra, sin convertir la duración en una valoración artística.'],
};
