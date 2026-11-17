import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { tarjetaProducto, agregarAlCarrito, avisar, etiquetaCategoria, esc } from "./tienda.js";

// Controla el catálogo principal y la sección de destacados del inicio con sus filtros por categoría

const grillaProductos = document.getElementById("boxproductos");
const barraFiltros = document.getElementById("filters");
const limiteMaximo = Number(grillaProductos?.dataset.limite) || Infinity;

let listadoProductos = [];
let categoriaActiva = "todos";

// Normaliza la categoría para evitar problemas con mayúsculas o espacios
const obtenerCategoria = (prod) => String(prod.categoria ?? "").trim().toLowerCase();

function renderizarCatalogo() {
  let filtrados = categoriaActiva === "todos" 
    ? listadoProductos 
    : listadoProductos.filter((p) => obtenerCategoria(p) === categoriaActiva);
  
  filtrados = filtrados.slice(0, limiteMaximo);

  grillaProductos.innerHTML = filtrados.length
    ? filtrados.map(tarjetaProducto).join("")
    : `<p class="empty">No hay productos para mostrar en esta sección.</p>`;
}

function renderizarFiltros() {
  if (!barraFiltros) return;

  const categoriasDisponibles = [...new Set(listadoProductos.map(obtenerCategoria).filter(Boolean))];
  
  // Si hay una sola categoría o ninguna, ocultamos los filtros para no estorbar
  if (categoriasDisponibles.length < 2) {
    barraFiltros.hidden = true;
    return;
  }

  barraFiltros.innerHTML =
    `<button class="filter-chip is-active" data-cat="todos">Todos</button>` +
    categoriasDisponibles
      .map((cat) => `<button class="filter-chip" data-cat="${esc(cat)}">${esc(etiquetaCategoria(cat))}</button>`)
      .join("");
  
  barraFiltros.hidden = false;
}

async function cargarDatos() {
  grillaProductos.innerHTML = `<p class="empty">Cargando productos...</p>`;
  
  try {
    const snapshot = await getDocs(collection(db, "productos"));
    listadoProductos = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    
    renderizarFiltros();
    renderizarCatalogo();
  } catch (error) {
    console.error("Error al conectar con Firebase:", error);
    grillaProductos.innerHTML = `<p class="empty">No pudimos cargar los productos. Probá de nuevo en un rato.</p>`;
  }
}

// ===== EVENTOS DE INTERACCIÓN =====

if (barraFiltros) {
  barraFiltros.addEventListener("click", (evento) => {
    const botonChip = evento.target.closest(".filter-chip");
    if (!botonChip) return;

    barraFilltros?.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.remove("is-active"));
    barraFiltros.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.remove("is-active"));
    botonChip.classList.add("is-active");
    
    categoriaActiva = botonChip.dataset.cat;
    renderizarCatalogo();
  });
}

grillaProductos.addEventListener("click", (evento) => {
  const botonAgregar = evento.target.closest("[data-add]");
  if (!botonAgregar) return;

  const productoEncontrado = listadoProductos.find((p) => p.id === botonAgregar.dataset.add);
  if (!productoEncontrado) return;

  const resultadoCompra = agregarAlCarrito(productoEncontrado, 1);
  
  if (resultadoCompra.ok) {
    avisar(`${productoEncontrado.nombre} agregado al carrito 🛒`);
  } else {
    avisar("Ya tenés todo el stock disponible en tu carrito");
  }
});

// ¡Arrancamos!
cargarDatos();
