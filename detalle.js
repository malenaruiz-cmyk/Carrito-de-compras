import { db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { fmt, esc, imgTag, etiquetaCategoria, stockDe, textoStock, agregarAlCarrito, avisar } from "./tienda.js";

const contenedorDetalle = document.getElementById("detalle");
const idProducto = new URLSearchParams(window.location.search).get("id");

function mostrarMensaje(mensaje) {
  contenedorDetalle.innerHTML = `
    <div class="empty">
      <p>${esc(mensaje)}</p>
      <a class="btn btn--primary" href="productos.html">Volver a productos</a>
    </div>`;
}

function mostrarProducto(p) {
  const stockDisponible = stockDe(p);
  const estaAgotado = stockDisponible <= 0;
  const nombreCategoria = etiquetaCategoria(p.categoria);
  
  document.title = `${p.nombre} | TA-TE-TI`;

  contenedorDetalle.innerHTML = `
    <div class="detail__media">${imgTag(p.imagen, p.nombre)}</div>
    <div class="detail__info">
      ${nombreCategoria ? `<span class="product__tag">${esc(nombreCategoria)}</span>` : ""}
      <h2 class="detail__name">${esc(p.nombre)}</h2>
      <p class="detail__desc">${esc(p.descripcion)}</p>
      <p class="detail__price">${fmt(p.precio)}</p>
      <p class="detail__stock ${estaAgotado ? "is-out" : ""}">${textoStock(p)}</p>
      
      ${estaAgotado ? "" : `
      <div class="qty" aria-label="Cantidad">
        <button type="button" class="qty__btn" id="btnrestar" aria-label="Quitar uno">−</button>
        <span class="qty__num" id="contador">1</span>
        <button type="button" class="qty__btn" id="btnsumar" aria-label="Agregar uno">+</button>
      </div>`}

      <div class="detail__actions">
        <button class="btn btn--primary" id="btnagregar" ${estaAgotado ? "disabled" : ""}>
          ${estaAgotado ? "Sin stock" : "Agregar al carrito"}
        </button>
        <a class="btn btn--ghost" href="carrito.html">Ir al carrito</a>
      </div>
    </div>`;

  if (estaAgotado) return;

  let cantidadSeleccionada = 1;
  const contadorSpan = document.getElementById("contador");

  document.getElementById("btnrestar").addEventListener("click", () => {
    if (cantidadSeleccionada > 1) {
      cantidadSeleccionada--;
      contadorSpan.textContent = cantidadSeleccionada;
    }
  });

  document.getElementById("btnsumar").addEventListener("click", () => {
    if (cantidadSeleccionada < stockDisponible) {
      cantidadSeleccionada++;
      contadorSpan.textContent = cantidadSeleccionada;
    } else {
      avisar("Llegaste al stock máximo");
    }
  });

  document.getElementById("btnagregar").addEventListener("click", () => {
    const resultado = agregarAlCarrito(p, cantidadSeleccionada);
    
    if (resultado.ok) {
      avisar(`${cantidadSeleccionada} × ${p.nombre} agregado al carrito 🛒`);
      cantidadSeleccionada = 1;
      contadorSpan.textContent = cantidadSeleccionada;
    } else if (resultado.disponible > 0) {
      avisar(`Solo podés sumar ${resultado.disponible} más (stock disponible)`);
    } else {
      avisar("Ya tenés todo el stock disponible en tu carrito");
    }
  });
}

async function cargarDetalle() {
  if (!idProducto) return mostrarMensaje("No elegiste ningún producto.");

  try {
    const docRef = doc(db, "productos", idProducto);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return mostrarMensaje("Ese producto no existe o ya no está disponible.");
    }

    mostrarProducto({ ...snapshot.data(), id: snapshot.id });
  } catch (error) {
    console.error("Error al cargar el producto:", error);
    mostrarMensaje("No pudimos cargar el producto. Probá de nuevo en un rato.");
  }
}

cargarDetalle();
