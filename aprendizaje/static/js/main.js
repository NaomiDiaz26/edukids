/* js/main.js - comportamiento interactivo */

/* ---------- Letras: reproducir audio ---------- */
function playAudio(id){
  const audio = document.getElementById(id);
  if(!audio) return;
  audio.currentTime = 0;
  audio.play();
}

/* ---------- Drag & Drop para 'Palabras' ---------- */
function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  // Guardamos el ID del bloque que se está arrastrando
  ev.dataTransfer.setData("text/plain", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text/plain");
  const node = document.getElementById(data);
  
  if (!node) return;

  // 1. Conseguir la zona de destino real (#drop-palabra)
  // Esto evita que si el usuario suelta la sílaba encima de OTRA sílaba, el código se rompa.
  let targetZone = ev.target;
  if (!targetZone.classList.contains('drop-target')) {
      targetZone = targetZone.closest('.drop-target');
  }

  if (targetZone) {
      // 2. Limpiar el texto "Suelta aquí" si es la primera sílaba que cae
      if (targetZone.innerText.trim() === "Suelta aquí") {
          targetZone.innerText = "";
      }
      // 3. ¡LA SOLUCIÓN!: Clonar el nodo en lugar de mover el original
      // cloneNode(true) copia el elemento con su texto y atributos (como el data-syllable-id)
      const clon = node.cloneNode(true);
      
      // Le quitamos el ID al clon para que no se repitan IDs en el HTML
      clon.removeAttribute('id'); 
      
      // Insertamos el clon en la zona de juego
      targetZone.appendChild(clon);
  }
}

/* ---------- Logica para revisar palabra correcta ---------- */
function verificarPalabra(targetId, correctSequence){
  // targetId = id del drop-target; correctSequence = array de ids en orden
  const target = document.getElementById(targetId);
  if(!target) return false;
  const children = Array.from(target.children).map(ch => ch.dataset.syllableId);
  // comparar secuencial
  if(children.length !== correctSequence.length) return false;
  for(let i=0;i<correctSequence.length;i++){
    if(children[i] !== correctSequence[i]) return false;
  }
  return true;
}

function reiniciarTablero() {
    // 1. Restaurar el texto inicial de la zona de soltado
    const targetZone = document.getElementById('drop-palabra');
    if (targetZone) {
        targetZone.innerHTML = 'Suelta aquí';
    }

    // 2. Limpiar el texto de feedback (¡Felicidades! o Intenta de nuevo)
    const out = document.getElementById('resultado-palabra');
    if (out) {
        out.innerText = '';
    }

    // Nota: Como los bloques arrastrados se clonan o mueven dentro del DOM, 
    // la manera más limpia de recuperarlos en su estado original en un entorno real 
    // es refrescando el contenedor de sílabas o usando location.reload() si prefieres no complicar el script. 
    // Si notas que las sílabas desaparecen de arriba al soltarlas abajo, deja el anterior location.reload().
}

/* ejemplo de uso: al presionar 'Comprobar' */
function obtenerSilabas(idContenedor) {
  const contenedor = document.getElementById(idContenedor);
  if (!contenedor) return [];

  const bloquesSueltos = contenedor.querySelectorAll('.draggable');

  return Array.from(bloquesSueltos).map(bloque => bloque.getAttribute('data-syllable-id'));
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function comprobarEjercicio() {
  const soluciones = [
// --- Solo con la M (7 palabras) ---
  ['ma', 'ma'], // MAMA
  ['me', 'me'], // MEME
  ['mi', 'mo'], // MIMO
  ['mo', 'mo'], // MOMO
  ['mu', 'ma'], // MUMA
  ['mi', 'ma'], // MIMA
  ['ma', 'me'], // MAME

  // --- Solo con la P (9 palabras) ---
  ['pa', 'pa'], // PAPA
  ['pi', 'pa'], // PIPA
  ['pi', 'po'], // PIPO
  ['pu', 'pa'], // PUPA
  ['pe', 'pe'], // PEPE
  ['pi', 'pi'], // PIPI
  ['po', 'po'], // POPO
  ['pu', 'po'], // PUPO
  ['pe', 'pa'], // PEPA

  // --- Combinadas M y P (12 palabras) ---
  ['ma', 'pa'], // MAPA
  ['mo', 'pa'], // MOPA
  ['pu', 'ma'], // PUMA
  ['mu', 'pa'], // MUPA
  ['pi', 'mo'], // PIMO
  ['po', 'mo'], // POMO
  ['pe', 'po'], // PEPO
  ['pe', 'ma'], // PEMA
  ['mi', 'pa'], // MIPA
  ['po', 'me'], // POME
  ['pu', 'me'], // PUME
  ['po', 'ma']  // POMA
  ];

  const usuario = obtenerSilabas('drop-palabra'); 
  const out = document.getElementById('resultado-palabra');

  // Si el usuario no ha arrastrado nada aún
  if (usuario.length === 0) {
    out.innerText = 'Arrastra algunas sílabas primero.';
    out.style.color = 'orange';
    return;
  }

  const ok = soluciones.some(
    sol => JSON.stringify(sol) === JSON.stringify(usuario)
  );
  
  if (ok) {

    out.innerText = '¡Felicidades! Palabra correcta.';
    out.style.color = 'green';

    const palabra = usuario.join('').toUpperCase();
	
	const csrftoken = getCookie('csrftoken');

    fetch('/guardar-progreso-palabras/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({
            palabra: palabra
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.mensaje);
    })
    .catch(error => {
        console.error(error);
    });

 } else {
    out.innerText = 'Intenta de nuevo.';
    out.style.color = 'crimson';
  }
}

