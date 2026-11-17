const temaBtn = document.querySelector('#tema');
const iconoTema =document.querySelector('#iconoTema');

const sol= "M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1-.45-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1z";
const luna= "M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z";


// Cambiar Tema

temaBtn?.addEventListener('click', ()=> {
    const nuevoTema = document.documentElement.getAttribute('data-tema')=== 'oscuro' ? 'claro' : 'oscuro';

    document.documentElement.setAttribute('data-tema', nuevoTema);

    iconoTema?.querySelector('path')?.setAttribute('d', nuevoTema === 'oscuro' ? sol : luna);

    mostrarToast(`Modo ${nuevoTema==='oscuro'?'Oscuro':'Claro'} activado`);
});

// Mostrar mensajes
function mostrarToast(mensaje){
  const toast=document.querySelector('#toast');
  const texto=document.querySelector('#toast-texto');
  if(!toast||!texto)return;
  texto.textContent=mensaje;
  toast.classList.add('mostrar');
  setTimeout(()=>toast.classList.remove('mostrar'),3000);
}

function mostrarMensajeFormulario(id,mensaje,ok){
  const elemento=document.getElementById(id);

  if(!elemento)return;
  elemento.className=`form-mensaje ${ok?'exitoso':'error'}`;
  elemento.textContent=mensaje;
  elemento.style.display='block';

   setTimeout(()=>  elemento.textContent="",3000);
}



// Formulario de suscripcion del Footer- Ecommerce con id comercio

const controlSuscripcion = async (evento) => {
  evento.preventDefault();
  
  const form = evento.currentTarget;

  // Leemos el valor que antes pasabas por parámetro en el HTML
  const fuenteSuscripcion = form.dataset.fuente; 
  const lugarMensajeRespuesta = form.dataset.mensajeid;

  const email = form.querySelector('input[type="email"]')?.value;
  const button = form.querySelector('button[type="submit"]');



  if (button) button.disabled = true;

  try {
    const respuesta = await fetch('/api/suscripciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, fuente: fuenteSuscripcion})
    });

      
    const data = await respuesta.json();

  

    if (!respuesta.ok) {
      throw new Error(data.error || 'No se pudo completar la suscripción.');
    }

    mostrarMensajeFormulario(lugarMensajeRespuesta,data.mensaje,true);
    mostrarToast(data.mensaje);
    form.reset();

  } catch (error) {
    console.error(error);
    // Si querés mostrar el error en un toast:
     mostrarToast(error.mensaje); 
  } finally {
    if (button) button.disabled = false;
  }
};


//Cambiar Vista
const botones = document.querySelectorAll('.tab-btn');

const sections = {
  ecommerce: document.getElementById('ecommerce'),
  noticias: document.getElementById('noticias'),
  blog: document.getElementById('blog')
};

  /**Esa línea de código en JavaScript sirve para filtrar y mostrar u ocultar secciones de una página web según una categoría seleccionada (por ejemplo, al hacer clic en botones de filtro como "Todos", "Inicio", "Contacto", etc.).
Aquí tienes el desglose paso a paso de lo que hace cada parte:

1. Recorrer el objeto sections

• Object.entries(sections): Toma un objeto llamado sections (donde las claves son nombres de categorías y los valores son elementos del HTML) y lo convierte en una lista de pares [clave, valor].
• .forEach(([key, section]) => { ... }): Recorre esa lista uno por uno. En cada vuelta, extrae el nombre de la sección en la variable key y el elemento HTML en la variable section.

2. Verificar que el elemento exista

• if (section): Es una medida de seguridad. Comprueba que el elemento HTML realmente exista en la página antes de intentar cambiarle el estilo, evitando que el código tire un error si falta algo.

3. Decidir si se muestra o se oculta (Operador ternario)

• target === 'todos' || key === target: Evalúa dos condiciones. Se cumple si el usuario eligió ver 'todos' O si el nombre de la sección actual (key) coincide exactamente con lo que el usuario eligió (target).
• ? 'block' : 'none': Es un if/else resumido. Si la condición anterior es verdadera, elige 'block' (mostrar). Si es falsa, elige 'none' (ocultar).

4. Aplicar el cambio visual

• section.style.display = ...: Modifica directamente la propiedad CSS display de esa sección HTML para hacerla visible (block) o invisible (none) en pantalla. */
botones.forEach(boton => {
  boton.addEventListener('click', () => {
    // 1. Leemos el valor de data-target del botón presionado
    const objetivo = boton.dataset.objetivo;

    // 2. Actualizamos la clase 'activo'
    botones.forEach(btn => btn.classList.remove('activo'));
    boton.classList.add('activo');

    // 3. Mostramos u ocultamos las secciones
    Object.entries(sections).forEach(([key, section]) => {
      if (section) {
        section.style.display = (objetivo === 'todos' || key === objetivo) ? 'block' : 'none';
      }
    });
  });
});

// 1. Botón Volver Arriba
const btnVolverArriba = document.querySelector('.volver-arriba-btn');

if (btnVolverArriba) {
  // 1. Mostrar u ocultar según la posición del scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btnVolverArriba.classList.add('visible');
    } else {
      btnVolverArriba.classList.remove('visible');
    }
  });

  // 2. Subir suavemente al hacer clic
  btnVolverArriba.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// 2. Copiar Email de Contacto
const btnCopiarEmail = document.getElementById('btn-copiar-email');

if (btnCopiarEmail) {
  btnCopiarEmail.addEventListener('click', async (e) => {
    e.preventDefault(); // Evita que el href="#" suba la página de golpe
    const email = 'contacto@sofiachen.dev';

    try {
      await navigator.clipboard.writeText(email);
      mostrarToast(`Copiado: ${email}`);
    } catch {
      mostrarToast('No se pudo copiar el correo.');
    }
  });
}



// Para cambiar los titulares cada cierto tiempo

const titulares=[
 "Científicos anuncian avance histórico en energía de fusión limpia.",
 "Mercados mundiales cierran en récord tras nuevos anuncios económicos.",
 "Cumbre del Clima concluye con acuerdo global para reducciones de carbono.",
 "Lanzan nueva misión espacial rumbo a la luna Europa de Júpiter."
];
let actualTitular=0;

setInterval(()=>{

  /**Esa línea de código sirve para avanzar al siguiente elemento de una lista (array) y volver automáticamente al principio cuando llegas al final, creando un bucle infinito (como un carrusel de noticias o una cinta transportadora).
El símbolo % es el operador módulo (o resto de la división). */
/**
2. ¿Cómo funciona en tu línea de código?

Imagina que tienes un array con 3 titulares (titulares.length vale 3), cuyas posiciones (índices) son 0, 1 y 2.
Partiendo desde actualTitular = 0, mira qué pasa cada vez que se ejecuta esa línea:
1. Estás en el titular 0:
(0 + 1) % 3  →  1 % 3  →  da 1 (pasa al segundo titular).
2. Estás en el titular 1:
(1 + 1) % 3  →  2 % 3  →  da 2 (pasa al tercer titular).
3. Estás en el titular 2 (el último):
(2 + 1) % 3  →  3 % 3  →  da 0 (¡vuelve al primer titular!).

¿Por qué se usa este truco?

Porque te ahorra tener que escribir un if largo cada vez que avanzas: */
  actualTitular =(actualTitular + 1) % titulares.length;

  const ticker = document.getElementById('contenido-novedad');

  if(ticker){
    ticker.style.opacity='0';
    setTimeout(()=>{ticker.textContent = titulares[actualTitular];
    ticker.style.opacity='1';},300);}
},5000);



// Vinculamos el evento una vez que cargue el HTML
document.addEventListener('DOMContentLoaded', () => {
  const formularios = document.querySelectorAll('[data-subscribe-form]');
  formularios.forEach((form) => {
    form.addEventListener('submit', controlSuscripcion);
  });
});


//Formulario de contacto
document.getElementById('formulario-contacto')?.addEventListener('submit',async(evento)=>{

  evento.preventDefault();
  const form = evento.currentTarget;
  const button = form.querySelector('button[type="submit"]');

  if(button)button.disabled=true;

  try{
    const cargaDeDatos = Object.fromEntries(new FormData(form).entries()); // en ingles payload

    const respuesta = await fetch('/api/mensajes',
      {method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(cargaDeDatos)
      });
    const data = await respuesta.json();
    
    if(!respuesta.ok)throw new Error(data.error||'No se pudo enviar el mensaje.');

    mostrarMensajeFormulario('contacto-mensaje',data.mensaje,true);

    mostrarToast(data.mensaje);form.reset();

  }catch(error){

    mostrarMensajeFormulario('contacto-mensaje',error.mensaje,false);}

  finally{
    if(button)button.disabled=false;
  }
});

//imagenes de respaldo
const imagenRespaldo = 'https://placehold.co/100x100/1e293b/0ea5e9?text=Post';

document.querySelectorAll('.post-thumb').forEach(img => {
  img.addEventListener('error', () => {
    // Evita un bucle infinito si la imagen de respaldo también llegara a fallar
    if (img.src !== imagenRespaldo) {
      img.src = imagenRespaldo;
    }
  });
});
