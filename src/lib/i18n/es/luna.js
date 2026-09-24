// Luna's Writing Nook (module page) and the lesson player.
//
// The platform teaches English writing, so the material under study is NOT in
// here on purpose: the starter sentence ("It snarled."), the three Practice
// answer options, and the example sentences stay English in both languages.
// Only the instructions and the interface around them are translated. Feedback
// lines quote English fragments ("it", "and it was") verbatim for the same
// reason.
export const luna = {
  /* ---------------- module page: journey band ---------------- */
  'YOUR PATH TO BECOMING A STRONGER WRITER': 'TU CAMINO PARA SER UN ESCRITOR MÁS FUERTE',
  '{n} Modules · A Brighter You': '{n} Módulos · Un Tú Más Brillante',

  // module labels (server data, rendered on this page)
  'Short Constructed Response': 'Respuesta Construida Corta',
  'Extended Constructed Response': 'Respuesta Construida Extendida',
  'Stellar Writers': 'Escritores Estelares',
  'The Writing Process': 'El Proceso de Escritura',
  'Revision': 'Revisión',
  'Editing': 'Edición',

  /* ---------------- mission panel ---------------- */
  'MISSION {n}': 'MISIÓN {n}',
  // Colon instead of an article: the labels differ in gender and number.
  'Master the {label}': 'Domina: {label}',
  '{done} of {total} lessons': '{done} de {total} lecciones',
  'mission complete!': '¡misión completa!',
  '{n} to go': 'faltan {n}',
  '← Back to Previous Page': '← Volver a la página anterior',

  // mission blurbs, one per module
  'Build a strong foundation for clear, thoughtful answers.': 'Construye una base sólida para respuestas claras y bien pensadas.',
  'Stretch your answers into full, well-organized responses.': 'Amplía tus respuestas hasta que sean completas y bien organizadas.',
  'Learn the moves great writers make in every piece.': 'Aprende las jugadas que hacen los grandes escritores en cada texto.',
  'Plan, draft, and polish like a pro.': 'Planea, escribe el borrador y pule como un profesional.',
  'Make good writing great by revising with purpose.': 'Convierte la buena escritura en excelente al revisar con propósito.',
  'Catch every slip so your ideas shine through.': 'Atrapa cada descuido para que tus ideas brillen.',

  /* ---------------- lesson cards ---------------- */
  'FINAL CHALLENGE': 'RETO FINAL',
  'LESSON {n}': 'LECCIÓN {n}',
  '{n} of 3 stars': '{n} de 3 estrellas',
  'View summary →': 'Ver resumen →',
  'Unlocks after lesson 5': 'Se desbloquea después de la lección 5',
  '✦ Continue →': '✦ Seguir →',

  // Lesson titles (RACE is a product name — never translated). Infinitive form
  // to match the RACE step names already set in es/growth.js, which wins the
  // merge in es.js — one Spanish per English string.
  'Restate the Question': 'Reformular la pregunta',
  'Answer the Question': 'Responder la pregunta',
  'Cite the Evidence': 'Citar la evidencia',
  'Explain Your Thinking': 'Explicar tu razonamiento',
  'Module 1 Test': 'Prueba del Módulo 1',
  "Show what you've learned!": '¡Muestra lo que has aprendido!',

  /* ---------------- writer profile sidebar ---------------- */
  'A brighter writer is you!': '¡Tú eres un escritor más brillante!',
  'Rising Writer · Level {n}': 'Escritor en Ascenso · Nivel {n}',
  "Keep going! You're making great progress!": '¡Sigue así! ¡Vas muy bien!',
  'Stars Earned': 'Estrellas ganadas',
  'Current Streak': 'Racha actual',
  'days in a row!': '¡días seguidos!',
  'Module Progress': 'Progreso del módulo',
  "Great work! You're more than halfway there!": '¡Buen trabajo! ¡Ya pasaste la mitad!',
  'Every activity gets you closer!': '¡Cada actividad te acerca más!',
  'Badges Earned': 'Insignias ganadas',
  "You're doing amazing, writer!": '¡Lo estás haciendo increíble, escritor!',
  'Keep up the great work and finish strong!': '¡Sigue con el buen trabajo y termina fuerte!',

  /* ---------------- lesson page: shell ---------------- */
  'Module {n}': 'Módulo {n}',
  'Use what you know about {title} to expand a sentence.': 'Usa lo que sabes sobre {title} para expandir una oración.',
  'Better\nWriters\nBrighter\nFutures': 'Mejores\nEscritores\nFuturos\nBrillantes',
  '{n} of {total}': '{n} de {total}',
  '{step}: {topic}': '{step}: {topic}',
  'Finish this step first': 'Termina este paso primero',
  'Finish lesson ✓': 'Terminar la lección ✓',

  // steps
  'Watch': 'Ver',
  'Learn': 'Aprender',
  'Practice': 'Practicar',
  'Your Turn': 'Tu turno',
  'Review': 'Repaso',

  /* ---------------- step 1: Watch ---------------- */
  'Instruction 1.2: Restate the Question': 'Instrucción 1.2: Reformular la pregunta',
  'Watch Luna walk through the skill, then try it yourself in the next step.': 'Mira a Luna explicar la destreza y luego inténtalo tú en el siguiente paso.',
  'Play video': 'Reproducir el video',
  'Play': 'Reproducir',
  'Pause': 'Pausar',
  'VIDEO': 'VIDEO',
  '✓ Watched': '✓ Visto',
  'Press play to begin': 'Presiona reproducir para empezar',

  /* ---------------- step 2: Learn ---------------- */
  'Starburst Prompts: Sentence Expansion': 'Ideas Starburst: Expansión de la oración',
  'Answer the questions about the starter sentence. Use those answers to revise and write a more detailed sentence.': 'Responde las preguntas sobre la oración inicial. Usa esas respuestas para revisar y escribir una oración con más detalles.',
  'What?': '¿Qué?',
  'When?': '¿Cuándo?',
  'Why?': '¿Por qué?',
  'How?': '¿Cómo?',
  'What was it?': '¿Qué era?',
  'When did it happen?': '¿Cuándo ocurrió?',
  'Why did it snarl?': '¿Por qué gruñó?',
  'How did it snarl?': '¿Cómo gruñó?',
  'Type your response here…': 'Escribe tu respuesta aquí…',

  /* ---------------- step 3: Practice ---------------- */
  'Check your eye for detail before you write your own.': 'Pon a prueba tu ojo para el detalle antes de escribir la tuya.',
  'Which sentence expands the starter with the most useful detail?': '¿Cuál oración expande la inicial con el detalle más útil?',
  // The quoted fragments stay English: they point at the English options above.
  'Only one detail was added. We still do not know what "it" is.': 'Solo se agregó un detalle. Todavía no sabemos qué es "it".',
  'What, when, why and how are all answered in one clear sentence.': 'Qué, cuándo, por qué y cómo se responden en una sola oración clara.',
  'The details are there, but "and it was" four times makes a list, not a sentence.': 'Los detalles están ahí, pero "and it was" cuatro veces hace una lista, no una oración.',

  /* ---------------- step 4: Your Turn ---------------- */
  'Bring your answers together into one strong sentence.': 'Une tus respuestas en una sola oración fuerte.',
  'Now write the expanded sentence.': 'Ahora escribe la oración expandida.',
  'Start from': 'Empieza con',
  'and work in your answers. One sentence, a capital letter to start, a period to end.': 'e incorpora tus respuestas. Una sola oración, con mayúscula al inicio y punto al final.',
  'Type your expanded sentence here…': 'Escribe aquí tu oración expandida…',

  /* ---------------- step 5: Review ---------------- */
  'See how your sentence grew, and where the stars came from.': 'Mira cuánto creció tu oración y de dónde vinieron las estrellas.',
  'YOU STARTED WITH': 'EMPEZASTE CON',
  'YOU WROTE': 'ESCRIBISTE',
  'Nothing yet — go back to Your Turn.': 'Nada todavía: vuelve a Tu turno.',
  'Practice: {result}': 'Práctica: {result}',
  'correct ✓': 'correcto ✓',
  'skipped': 'omitido',
  'missed': 'incorrecto',
  'Write your sentence to earn stars.': 'Escribe tu oración para ganar estrellas.',
  '✓ Starts with a capital and ends with a period.': '✓ Empieza con mayúscula y termina con punto.',
  '• Add an end mark.': '• Agrega un signo final.',
  '• Start with a capital letter.': '• Empieza con mayúscula.',
  '✓ {n} words — a real expansion of two.': '✓ {n} palabras: una verdadera expansión de dos.',
  '• {n} words so far. Aim for eight or more.': '• {n} palabras por ahora. Trata de llegar a ocho o más.',
  '✓ Uses {n} of your Starburst answers.': '✓ Usa {n} de tus respuestas Starburst.',
  '• Work in at least two of your Starburst answers.': '• Incorpora al menos dos de tus respuestas Starburst.',
  // Nook lessons (2026-09-24)
  'Your next lesson': 'Tu próxima lección',
  'All lessons': 'Todas las lecciones',
  'Now': 'Ahora',
}
