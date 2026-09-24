// Student dashboard (StudentHome) + the top bar in Shell.jsx.
// Product names stay English: LoneStar CR, ClassCade, Luna, RACE, STAAR, SCR, ECR.
export const home = {
  // ---- top bar (Shell.jsx) ----
  'Switch to ClassCade': 'Cambiar a ClassCade',

  // ---- due dates / status chips ----
  '✓ Turned in': '✓ Entregado',
  'No due date': 'Sin fecha de entrega',
  'Overdue': 'Atrasada',
  'Due today': 'Para hoy',
  'Due tomorrow': 'Para mañana',
  'Due {date}': 'Para el {date}',

  // ---- format badge ----
  'Self-started practice': 'Práctica que empezaste tú',
  'PRACTICE': 'PRÁCTICA',
  'Extended Constructed Response': 'Respuesta construida extendida',
  'Short Constructed Response': 'Respuesta construida corta',

  // ---- Luna's Writing Nook bar ----
  'Module {n}': 'Módulo {n}',
  '{done} of {total} activities': '{done} de {total} actividades',
  'Go to my path': 'Ir a mi ruta',
  // short module labels under the badges (SCR and ECR stay as they are)
  'Stellar': 'Estelar',
  'Process': 'Proceso',
  'Revision': 'Revisión',
  'Editing': 'Edición',

  // ---- data summary card ----
  'Average writing score over time': 'Puntaje promedio de escritura con el tiempo',
  'Current Average': 'Promedio actual',
  '↑ {n}% this week': '↑ {n}% esta semana',
  'Writing Streak': 'Racha de escritura',
  '{n} days 🔥': '{n} días 🔥',
  'Keep it up!': '¡Sigue así!',
  'Badges Earned': 'Insignias ganadas',
  'See all badges': 'Ver todas las insignias',
  'My Data 📊': 'Mis datos 📊',
  'Your averages at a glance — dig deeper in Data & Goals.': 'Tus promedios de un vistazo — mira más a fondo en Datos y Metas.',
  'See full data →': 'Ver todos los datos →',
  'Average Score Over Time': 'Puntaje promedio con el tiempo',
  'Goal Progress': 'Avance hacia la meta',
  'Goal: {n}%': 'Meta: {n}%',
  // sentence wrapped around a bold number: "¡Te faltan 8% para tu meta!"
  "You're": '¡Te faltan',
  'away from your goal!': 'para tu meta!',

  // ---- up next card ----
  '⭐ UP NEXT FOR YOU': '⭐ LO SIGUIENTE PARA TI',
  'See all assignments →': 'Ver todas las tareas →',

  // ---- goal banner ----
  'My goal': 'Mi meta',
  'Trait: {trait} · your coach keeps this in mind when you confer': 'Rasgo: {trait} · tu maestra lo tiene en cuenta cuando conversan',
  "You'll name your next goal in a writing conference with your teacher.": 'Vas a elegir tu próxima meta en una conversación de escritura con tu maestra.',
  'Class focus': 'Enfoque de la clase',
  'what the whole class is working on': 'en lo que trabaja toda la clase',
  ' — set by {name}': ' — puesto por {name}',
  'Your class focus shows up here when your teacher sets one.': 'El enfoque de tu clase aparece aquí cuando tu maestra pone uno.',
  // trait names (api.js TRAIT_LABELS)
  'Ideas': 'Ideas',
  'Organization': 'Organización',
  'Voice': 'Voz',
  'Word Choice': 'Elección de palabras',
  'Sentence Fluency': 'Fluidez de oraciones',
  'Conventions': 'Convenciones',

  // ---- the four studio tiles ----
  "Find what's broken. Make it right.": 'Encuentra lo que está mal. Arréglalo.',
  'Your page, your rules — write anything': 'Tu página, tus reglas — escribe lo que quieras',
  'Small games, big progress · double coins': 'Juegos cortos, gran avance · monedas dobles',
  'Revise, publish & share your pieces': 'Revisa, publica y comparte tus textos',

  // ---- daily challenge banner ----
  'Daily Challenge': 'Reto del Día',
  'A friend': 'Un amigo',
  "Today's challenge is done — nice work! ✓": 'El reto de hoy está listo — ¡buen trabajo! ✓',
  '{author} wrote something rough — can you fix it up?': '{author} escribió algo flojo — ¿puedes mejorarlo?',
  'A brand-new challenge lands tomorrow. You can still look back at your revision.': 'Mañana llega un reto nuevo. Todavía puedes mirar tu revisión.',
  "Judge it against the rubric, then rewrite it stronger. It's not yours, so revise boldly!": 'Evalúalo con la rúbrica y luego reescríbelo más fuerte. No es tuyo, ¡así que revisa sin miedo!',
  '🪙 EARN 50 COINS!': '🪙 ¡GANA 50 MONEDAS!',
  'Review →': 'Repasar →',
  'Keep going →': 'Seguir →',
  'Start Revising →': 'Empezar a revisar →',

  // ---- share wall strip ----
  'See what other students are writing — cheer them on with 👍 ❤️ 🎉': 'Mira lo que escriben otros estudiantes — anímalos con 👍 ❤️ 🎉',
  'Today': 'Hoy',
  '{n}d ago': 'hace {n} d',
  '{n}w ago': 'hace {n} sem',

  // ---- Fluency Zone modal ----
  'FLUENCY': 'ZONA',
  'ZONE': 'DE FLUIDEZ',
  'Tap a tile and we pick the game. Score 90% for 20 coins, 70% for 10. Under 70% and you play that tile again.': 'Toca una tarjeta y nosotros elegimos el juego. Saca 90% y ganas 20 monedas, 70% y ganas 10. Menos de 70% y juegas esa tarjeta otra vez.',
  'ROUND': 'RONDA',
  '{done} of {total} cleared': '{done} de {total} completadas',
  'Clear the board for': 'Completa el tablero y gana',
  '+50 bonus coins': '+50 monedas de bono',
  'Board cleared!': '¡Tablero completo!',
  '+50 bonus coins banked.': '+50 monedas de bono guardadas.',
  'Reset the board for a fresh round of surprise games.': 'Reinicia el tablero para una ronda nueva de juegos sorpresa.',
  'Reset & play again': 'Reiniciar y jugar otra vez',
  'Under 70% · try again': 'Menos de 70% · inténtalo otra vez',
  'Try again': 'Inténtalo otra vez',
  '{name} is already cleared. Reset the board to play it again.': '{name} ya está completada. Reinicia el tablero para jugarla otra vez.',
  'up to': 'hasta',
  'Surprise: {n} games in the mix': 'Sorpresa: {n} juegos en la mezcla',
  '20 coins for 90%+, 10 for 70%+. Every round pays': '20 monedas por 90%+, 10 por 70%+. Cada ronda paga',
  'double coins': 'monedas dobles',
  'in ClassCade': 'en ClassCade',

  // ---- Free Write chooser ----
  'You have unfinished stories — pick one up where you left off, or start something brand new.': 'Tienes historias sin terminar — sigue una donde la dejaste o empieza algo nuevo.',
  'Revise stories': 'Revisar historias',
  'Nothing written yet': 'Todavía no has escrito nada',
  'Draft {n}': 'Borrador {n}',
  'Revise →': 'Revisar →',
  'Start new writing piece': 'Empezar un texto nuevo',
  'See everything in my Writing Bank →': 'Ver todo en mi Banco de Escritura →',

  // ---- assignments list ----
  'Active assignments': 'Tareas activas',
  '🔍 Search assignments…': '🔍 Buscar tareas…',
  'All formats': 'Todos los formatos',
  'SCR only': 'Solo SCR',
  'ECR only': 'Solo ECR',
  'All types': 'Todos los tipos',
  'Sort: Due date': 'Orden: fecha de entrega',
  'Sort: Title': 'Orden: título',
  'Sort: Type': 'Orden: tipo',
  'Sort: Teacher': 'Orden: maestra',
  'Nothing here — try the other tab or clear filters.': 'Nada por aquí — prueba la otra pestaña o quita los filtros.',
  'Review': 'Repasar',
  '{n} more — scroll the list': '{n} más — desliza la lista',

  // ---- leave-a-game confirm ----
  'Leave this game?': '¿Salir de este juego?',
  "This round won't count. To clear the tile you'll need to start the game over and finish it.": 'Esta ronda no va a contar. Para completar la tarjeta tendrás que empezar el juego de nuevo y terminarlo.',
  'Keep playing': 'Seguir jugando',
  'Leave anyway': 'Salir de todos modos',

  // ---- the Home Quick Write block ----
  'About {n} min': 'Unos {n} min',
  "Today's prompt": 'La instrucción de hoy',
  'coins': 'monedas',
  'Done for today. A new prompt comes tomorrow.': 'Listo por hoy. Mañana llega una instrucción nueva.',
  '✓ See what I wrote →': '✓ Ver lo que escribí →',
  'Start writing →': 'Empezar a escribir →',
  'Dashboard sections': 'Secciones del panel',
}
