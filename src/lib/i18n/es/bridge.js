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
}
