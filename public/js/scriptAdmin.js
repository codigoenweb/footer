//variables generales

let tipo = "todos", pagina = 1 , cantidadPaginas = 1;

//Una forma de hacer más corta la identificación de etiquetas. No es Jquery, es algo de defino yo como función en esta hoja y que uso después aquí mismo para escribir menos.

const $ = id => document.getElementById(id);

//El signo pesos es el nombre de la función ( cortita) y si entre paréntesis le envio el id de una etiqueta, la itentifica en el HTML

//función auxiliar para mostrar los mensajes

function mostrarMensaje(id,texto, clase = 'error'){
    $(id).textContent = texto;
    $(id).classList = clase;

    setTimeout(()=>{
         $(id).textContent = '';
    },3000);
}

//funcion para chequear la session

async function chequearSesion() {
  try {

     const respuesta = await fetch("/api/admin/sesion");
     if (!respuesta.ok){
        throw new Error('No inicio sesión')
     }
  
    $('login').classList.add('oculto');
    $('dashboard').classList.remove('oculto');
    await cargarDatos();

  } catch (error) {
    // Ahora sí entra acá cuando no hay cookie o venció

    $('login').classList.remove('oculto');
    $('dashboard').classList.add('oculto');
  }
}

//cargar Datos desde la BD
async function cargarDatos() {
  try {
    const respuestaQueEnviaServidor = await fetch(`/api/admin/contactos?tipo=${tipo}&pagina=${pagina}`);

      // 1. Parsear la respuesta a JSON
    const data = await respuestaQueEnviaServidor.json(); 

    if (!respuestaQueEnviaServidor.ok){
        throw new Error('Error en la carga de datos')
     }
   
    cantidadPaginas = data.cantidadPaginas;
    $("total").textContent = `${data.total} registros`;
    $("noleidos").textContent = `· ${data.noleidos} sin leer`;
    $("pagina").textContent = `Página ${pagina} de ${cantidadPaginas}`;
    $("prev").disabled = pagina <= 1;
    $("next").disabled = pagina >= cantidadPaginas;

    $("registros").innerHTML = data.items.length
      ? data.items.map( (item) => `
      <article class="item">
      <div class="barra"><strong>${item.tipo === "mensaje" ? "✉ Mensaje" : "✉ Suscripción"} ${item.leido ? "" : '· <span class="exitoso">Nuevo</span>'}</strong><span class="meta">${new Date(item.createdAt).toLocaleString("es-AR")}</span></div>
      <p><strong>${esc(item.nombre || "")}</strong> ${esc(item.email)}</p>${item.mensaje ? `<p>${esc(item.mensaje)}</p>` : ""}
      <div class="fila">${!item.leido? `<button data-leido="${item._id}" class="secundario">Marcar leido</button>` : ""}<button data-eliminar="${item._id}" class="danger">Eliminar</button></div></article>`,
          )
          .join("")
      : '<div class="tarjeta atenuado">No hay registros para mostrar.</div>';


      //Marcar los leidos- Atentos al btn
       document.querySelectorAll("[data-leido]").forEach(
      (btn) =>
        (btn.onclick = async () => {
          try {
            const respuestaDesdeElServidor =await fetch(`/api/admin/contactos/${btn.dataset.leido}/leido`, {
                headers:{ "Content-Type": "application/json"},
                method: "PATCH",
            });
            const data = await respuestaDesdeElServidor.json().catch(() => ({}));

            if (!respuestaDesdeElServidor.ok) throw new Error(data.error || "Error de comunicación");
            await cargarDatos();
            
          } catch (error) {
            console.log('error en leido',error)
          }
          
        }),
      );


      //Eliminar mensajes. Atentos a los btn
      document.querySelectorAll("[data-eliminar]").forEach(
      (btn) =>
        (btn.onclick = async () => {

           if (confirm("¿Eliminar definitivamente este registro?")){
              try {            
                const respuestaDesdeElServidor =await fetch(`/api/admin/contactos/${btn.dataset.eliminar}`, {
                    headers:{ "Content-Type": "application/json"},
                    method: "DELETE",
                });
                const data = await respuestaDesdeElServidor.json().catch(() => ({}));

                if (!respuestaDesdeElServidor.ok) throw new Error(data.error || "Error de comunicación");
                await cargarDatos();
                
              } catch (error) {
                console.log('error en leido',error)
              }

          }
        }),
    );

   } catch (err) {

    console.log(err)
    $("registros").innerHTML =
      `<div class="tarjeta error">${esc(err.mensaje)}</div>`;
  }
}

/**Esa función se suele usar para "escapar" caracteres especiales de HTML (como <, >, &, ") y evitar inyecciones de código (XSS) al mostrar textos ingresados por los usuarios (como nombres, emails o mensajes). */
function esc(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
//1 - Todos los datos del login (usuario y contraseña). Estoy atento al submit del formulario


$('formulario-contacto').addEventListener('submit', async (evento)=> {
    evento.preventDefault(); // para que no realice ninguna acción por defecto, sino lo que se programa aquí.

    // tomo el fomulario porque aquí entra con el evento de submit del form
    const form = evento.currentTarget;
  
    const datosForm = Object.fromEntries(new FormData(form));
   
    // Intente y si da error pasa al catch- Acá estoy en JS, pongo try/catch ( En express 5 no es necesario)
    try {

        //mando los datos recibimos al servidor, a la ruta donde se los recibe

        const respuestaDesdeElServidor = await fetch('/api/admin/login',
            {
            headers: { 'Content-Type': 'application/json' },
             method: 'POST',
             body: JSON.stringify(datosForm)   
            });
       
        const data = await respuestaDesdeElServidor.json();
            
        if (!respuestaDesdeElServidor.ok) {
            throw new Error(data.error || 'No se pudo completar la identificación.');
        }
      
         form.reset();
         await chequearSesion();
    } catch (error) {
      
          mostrarMensaje('login-msg', error, 'error'); 
 
    }
});

$("logout").addEventListener("click", async () => {
  await fetch("/api/admin/logout", { method: "POST" });

  chequearSesion();
   
});



// son los botones superiores
document.querySelectorAll("[data-tipo]").forEach((btn) =>
  btn.addEventListener("click", () => {
    tipo = btn.dataset.tipo;
    pagina = 1;
    document.querySelectorAll("[data-tipo]").forEach((b) => {
      b.classList.toggle("activo", b === btn);
      b.classList.toggle("secundario", b !== btn);
    });
    cargarDatos();
  }),
);
$("prev").onclick = () => {
  if (pagina > 1) {
    pagina--;
    cargarDatos();
  }
};
$("next").onclick = () => {
  if (pagina < cantidadPaginas) {
    pagina++;
    cargarDatos();
  }
};

//Los addeventListener se cargan pero no se ejecutan, lo hacen cuando sucede el evento.
//Las funciones auxiliares se ejecutan cuando se las llama.



//Apenas arranque ejecute esta función porque la estoy llamando.
  chequearSesion();