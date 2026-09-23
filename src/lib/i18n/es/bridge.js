/*
 * Language Bridge — the SIOP support layer.
 *
 * Interface Spanish, English content. The frames, starters and phrase-bank
 * items a student types are NOT here on purpose: they write in English, so
 * the scaffold they copy has to stay English. Everything that explains,
 * labels or coaches is translated.
 */
export const bridge = {
  // ---- levels ----
  'Beginning': 'Principiante',
  'New to English': 'Empieza a aprender inglés',
  'Intermediate': 'Intermedio',
  'Developing academic English': 'Desarrolla el inglés académico',
  'Advanced': 'Avanzado',
  'Near grade-level proficiency': 'Casi al nivel de su grado',

  // ---- panel chrome ----
  'Language Bridge': 'Puente de Lenguaje',
  'RACE organizer': 'Organizador RACE',
  'Add this to your writing': 'Agrega esto a tu escritura',
  'Your goal right now': 'Tu meta ahora',
  '✏️ Start me off with the frames': '✏️ Empieza con los modelos',
  'Language objective': 'Objetivo de lenguaje',

  // ---- sentence support ----
  'Sentence frames': 'Modelos de oraciones',
  'Finish each sentence. The blanks show you what goes there.': 'Completa cada oración. Los espacios en blanco te muestran qué va ahí.',
  'Sentence starters': 'Inicios de oración',
  'Start with one of these, then finish the idea in your own words.': 'Empieza con uno de estos y termina la idea con tus propias palabras.',
  'Academic phrase bank': 'Banco de frases académicas',
  'Optional. Reach for these when you want a more precise move.': 'Opcional. Úsalas cuando quieras decirlo con más precisión.',

  // ---- RACE parts ----
  // 'Restate the question' already lives in growth.js with the same wording.
  'Answer it': 'Respóndela',
  'Cite the text': 'Cita el texto',
  'Explain your proof': 'Explica tu prueba',
  'Turn the question into the start of your answer.': 'Convierte la pregunta en el inicio de tu respuesta.',
  'Answer it in one clear sentence.': 'Respóndela en una oración clara.',
  'Bring in proof from the text.': 'Trae una prueba del texto.',
  'Say how your proof answers the question.': 'Di cómo tu prueba responde la pregunta.',

  // ---- language expectation by level ----
  'Words, phrases, simple patterns': 'Palabras, frases y patrones sencillos',
  'Short connected sentences; errors expected': 'Oraciones cortas conectadas; se esperan errores',
  'Connected sentences moving toward academic discourse': 'Oraciones conectadas que avanzan hacia el discurso académico',

  // ---- feedback: the one next move ----
  'Start by turning the question into your first sentence, then answer it.': 'Empieza convirtiendo la pregunta en tu primera oración y luego respóndela.',
  'Open with one sentence that says exactly what you think.': 'Empieza con una oración que diga exactamente lo que piensas.',
  'Say your idea in a full sentence so your reader knows where you stand.': 'Di tu idea en una oración completa para que tu lector sepa qué piensas.',
  'Add a detail or a short quote from the text that proves your answer.': 'Agrega un detalle o una cita corta del texto que compruebe tu respuesta.',
  'Add a sentence starting with "This shows…" or "because…" to connect your evidence to your answer.': 'Agrega una oración que empiece con "This shows…" o "because…" para conectar tu evidencia con tu respuesta.',

  // ---- feedback: the plainer Beginning wording ----
  'Start with the words from the question.': 'Empieza con las palabras de la pregunta.',
  'Say what you think in one sentence.': 'Di lo que piensas en una oración.',
  'Add one thing the text says.': 'Agrega algo que dice el texto.',
  'Add "This shows ______." at the end.': 'Agrega "This shows ______." al final.',
  'You used words from the question. Good.': 'Usaste palabras de la pregunta. Muy bien.',
  'Use words from the question first.': 'Primero usa palabras de la pregunta.',
  'You said what you think. Good.': 'Dijiste lo que piensas. Muy bien.',
  'Say what you think.': 'Di lo que piensas.',
  'You used the text. Good.': 'Usaste el texto. Muy bien.',
  'You told why. Good.': 'Dijiste por qué. Muy bien.',
  'Tell why. Try "This shows ______."': 'Di por qué. Prueba con "This shows ______."',

  // ---- feedback: the coaching paragraph ----
  'You did every part. Nice work. Keep writing like this.': 'Hiciste todas las partes. Buen trabajo. Sigue escribiendo así.',
  'You hit every part of the strategy — your answer restates, answers, backs itself up with the text, and explains the connection. Keep writing like this.': 'Cumpliste con todas las partes de la estrategia: tu respuesta repite la pregunta, responde, se apoya en el texto y explica la conexión. Sigue escribiendo así.',
  'Good start. Now do one thing: {move}': 'Buen comienzo. Ahora haz una cosa: {move}',
  "Let's do one thing: {move}": 'Hagamos una cosa: {move}',
  "Let's build this answer one step at a time. {move}": 'Vamos a construir esta respuesta paso a paso. {move}',
  'Your answer already handles {a} and {b} — that part is working. {move}': 'Tu respuesta ya maneja {a} y {b}: esa parte funciona. {move}',
  'Your answer already handles {a} — that part is working. {move}': 'Tu respuesta ya maneja {a}: esa parte funciona. {move}',

  // ---- feedback screen chrome ----
  'Your next step': 'Tu siguiente paso',
  'Graded for {level} English — the content bar is the same for everyone.': 'Calificado para inglés de nivel {level}: el nivel de contenido es el mismo para todos.',
  'One step at a time. Fix this, then we will look at the rest.': 'Un paso a la vez. Arregla esto y después vemos lo demás.',

  // ---- strategy-anchor notes that are fixed strings ----
  // The "hit" notes that quote the student's own words stay English on
  // purpose: the quoted fragment is their English writing.
  "You didn't restate the question in your answer.": 'No reformulaste la pregunta en tu respuesta.',
  "You didn't state a clear claim to start your answer.": 'No planteaste una afirmación clara al empezar tu respuesta.',
  'Your answer stops before it says what you think — say your idea in a full sentence.': 'Tu respuesta se detiene antes de decir lo que piensas. Di tu idea en una oración completa.',
  "You didn't provide any evidence from the text to support your answer.": 'No diste evidencia del texto para apoyar tu respuesta.',
  "You didn't explain how your answer connects to the story.": 'No explicaste cómo tu respuesta se conecta con el cuento.',
  'You used evidence from the text to back up your answer.': 'Usaste evidencia del texto para apoyar tu respuesta.',
  'You explained how your evidence connects to your answer.': 'Explicaste cómo tu evidencia se conecta con tu respuesta.',

  // ---- prompt support chrome ----
  'What this is asking': 'Qué te está pidiendo',
  'The prompt, one piece at a time': 'La instrucción, parte por parte',
  'Tap a word you do not know': 'Toca una palabra que no conozcas',

  // ---- the dashboard strip ----
  '{n} supports are on for you': 'Tienes {n} apoyos activos',
  'Your teacher set this. The writing you are asked to do is the same as everyone else.': 'Tu maestra lo configuró. La escritura que se te pide es la misma que la de todos.',
  'See what I get': 'Ver mis apoyos',
  'Hide': 'Ocultar',

  // ---- the nine support areas ----
  'Prompt support': 'Apoyo con la instrucción',
  'Vocabulary': 'Vocabulario',
  'Comprehensible input': 'Entrada comprensible',
  'Sentence support': 'Apoyo con las oraciones',
  'Response structure': 'Estructura de la respuesta',
  'Evidence': 'Evidencia',
  'Language production': 'Producción del lenguaje',
  'Translanguaging': 'Translenguaje',
  'Feedback': 'Comentarios',

  // ---- the matrix, Beginning ----
  'Prompt broken into small steps with visuals and simplified language': 'La instrucción dividida en pasos pequeños, con imágenes y lenguaje sencillo',
  'Picture glossary, bilingual glossary, audio pronunciation': 'Glosario con imágenes, glosario bilingüe y pronunciación en audio',
  'Read aloud, slowed pacing, sentence-by-sentence highlighting': 'Lectura en voz alta, ritmo más lento y resaltado oración por oración',
  'Full sentence frames': 'Modelos de oración completos',
  'Color-coded RACE organizer with frames filled in': 'Organizador RACE por colores con los modelos ya puestos',
  'Evidence choices highlighted for you': 'Las opciones de evidencia resaltadas para ti',
  'Say it aloud first, then speech-to-text': 'Dilo en voz alta primero y luego usa voz a texto',
  'Fully translated directions and home-language brainstorming': 'Instrucciones totalmente traducidas y lluvia de ideas en tu idioma',
  'One thing at a time, in both languages': 'Una cosa a la vez, en los dos idiomas',

  // ---- the matrix, Intermediate ----
  'Prompt chunked with academic vocabulary clarified': 'La instrucción en partes, con el vocabulario académico aclarado',
  'Click a word for its definition': 'Haz clic en una palabra para ver su definición',
  'Read aloud optional, key words highlighted': 'Lectura en voz alta opcional y palabras clave resaltadas',
  'RACE structure on the side for reference': 'La estructura RACE a un lado como referencia',
  'You highlight evidence, we check it matches': 'Tú resaltas la evidencia y nosotros revisamos que coincida',
  'Speech-to-text on the side': 'Voz a texto a un lado',
  'Key words and false cognates': 'Palabras clave y cognados falsos',
  'Language-focused coaching': 'Orientación centrada en el lenguaje',

  // ---- the matrix, Advanced ----
  'The original prompt, with optional vocabulary support': 'La instrucción original, con apoyo de vocabulario opcional',
  'Nuance and precision only': 'Solo matiz y precisión',
  'Optional academic phrase bank': 'Banco de frases académicas opcional',
  'Elaboration and precision': 'Desarrollo y precisión',

  /* ---- Beginning prompt deconstruction ----
   * Support area 8 (translanguaging) says Beginning gets fully translated
   * directions. These are the simplified restatement and the step questions
   * only. The real prompt and the Intermediate chunks are NEVER translated —
   * those are the grade-level English the student has to read.
   */
  'Should recess be longer? Write to your principal. Tell why.': '¿Debe ser más largo el recreo? Escríbele al director. Di por qué.',
  'What is recess?': '¿Qué es el recreo?',
  'Do you want more recess? Yes or no?': '¿Quieres más recreo? ¿Sí o no?',
  'Why? Give two reasons.': '¿Por qué? Da dos razones.',

  'Is the refrigerator very important? Say yes or no. Tell why.': '¿Es muy importante el refrigerador? Di sí o no. Di por qué.',
  'What does a refrigerator do?': '¿Qué hace un refrigerador?',
  'Is it important? Yes or no?': '¿Es importante? ¿Sí o no?',

  'A robot wakes up in a garden. Write what happens next.': 'Un robot despierta en un jardín. Escribe qué pasa después.',
  'Where is the robot?': '¿Dónde está el robot?',
  'What does the robot see?': '¿Qué ve el robot?',
  'What does the robot do?': '¿Qué hace el robot?',

  'A desert is very hot and dry. How do people live there? Tell how.': 'Un desierto es muy caluroso y seco. ¿Cómo vive la gente ahí? Di cómo.',
  'What is a desert like?': '¿Cómo es un desierto?',
  'What do people need to live?': '¿Qué necesita la gente para vivir?',
  'How do people get what they need in a desert?': '¿Cómo consigue la gente lo que necesita en un desierto?',

  'You live long ago, during a war. Write about one brave day.': 'Vives hace mucho tiempo, durante una guerra. Escribe sobre un día valiente.',
  'Who are you in the story?': '¿Quién eres tú en la historia?',
  'What brave thing happens?': '¿Qué cosa valiente pasa?',
  'How do you feel?': '¿Cómo te sientes?',

  'Why is kindness important in class? Tell why. Give examples.': '¿Por qué es importante la amabilidad en clase? Di por qué. Da ejemplos.',
  'What is kindness?': '¿Qué es la amabilidad?',
  'Why does kindness help a class?': '¿Por qué la amabilidad ayuda a una clase?',
  'What is one example?': '¿Cuál es un ejemplo?',
}
