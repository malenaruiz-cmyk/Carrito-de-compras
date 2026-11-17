// Utilidades generales: formato, manejo del carrito en localStorage y avisos visuales

export const CLAVE_CARRITO = "carrito";

// Formato de moneda y seguridad contra caracteres raros
export const fmt = (n) => "$" + Number(n || 0).toLocaleString("es-AR");

export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const CATEGORIAS = { libreria: "Librería", jugueteria: "Juguetería", kiosqueria: "Kiosquería" };
export const etiquetaCategoria = (c) => {
  const cat = String(c ?? "").trim();
  if (!cat) return "";
  return CATEGORIAS[cat.toLowerCase()] || cat.charAt(0).toUpperCase() + cat.slice(1);
};

// Manejo de imágenes con respaldo por si fallan o no cargan
const SVG_PLACEHOLDER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#eef9fe"/><text x="100" y="125" font-size="80" text-anchor="middle">🎁</text></svg>`;
export const IMG_VACIA = "data:image/svg+xml," + encodeURIComponent(SVG_PLACEHOLDER);

export const imgTag = (src, alt, clase = "") =>
  `<img ${clase ? `class="${clase}" ` : ""}src="${esc(src || IMG_VACIA)}" alt="${esc(alt)}" loading="lazy" onerror="this.onerror=null;this.src='${IMG_VACIA}'" />`;

// Control de stock (si no tiene stock definido, se asume ilimitado)
export const stockDe = (p) => {
  const num = Number(p.stock);
  return p.stock === undefined || p.stock === null || p.stock === "" || !Number.isFinite(num) ? Infinity : num;
};

export const textoStock = (p) => {
  const stock = stockDe(p);
  if (stock === Infinity) return "Disponible";
  return stock > 0 ? `Stock: ${stock}` : "Sin stock";
};

// Lógica del carrito
export const getCarrito = () => {
  try {
    const data = JSON.parse(localStorage.getItem(CLAVE_CARRITO));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const totalUnidades = (carrito = getCarrito()) => carrito.reduce((acc, i) => acc + i.cantidad, 0);

export const totalPrecio = (carrito = getCarrito()) => carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

export const guardarCarrito = (carrito) => {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
  actualizarContador();
};

export function agregarAlCarrito(prod, cantidad = 1) {
  const stock = stockDe(prod);
  const carrito = getCarrito();
  const item = carrito.find((i) => i.id === prod.id);
  const cantidadActual = item ? item.cantidad : 0;

  if (cantidadActual + cantidad > stock) {
    return { ok: false, disponible: Math.max(stock - cantidadActual, 0) };
  }

  if (item) {
    item.cantidad += cantidad;
  } else {
    carrito.push({
      id: prod.id,
      nombre: prod.nombre,
      precio: Number(prod.precio) || 0,
      imagen: prod.imagen || "",
      stock: Number.isFinite(stock) ? stock : null,
      cantidad,
    });
  }

  guardarCarrito(carrito);
  return { ok: true };
}

export function actualizarContador() {
  const contadorElemento = document.getElementById("contadorcarrito");
  if (!contadorElemento) return;
  const total = totalUnidades();
  contadorElemento.textContent = total;
  contadorElemento.hidden = total === 0;
}

// Sistema de alertas flotantes (Toast)
let temporizadorToast;
export function avisar(mensaje) {
  let toast = document.getElementById("toast");
  
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }

  toast.textContent = mensaje;
  toast.classList.add("is-visible");
  
  clearTimeout(temporizadorToast);
  temporizadorToast = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

// Renderizado de tarjetas de productos para el catálogo o inicio
export function tarjetaProducto(p) {
  const agotado = stockDe(p) <= 0;
  const categoria = etiquetaCategoria(p.categoria);
  const urlDetalle = `detalle.html?id=${encodeURIComponent(p.id)}`;

  return `
    <article class="product">
      <a class="product__media" href="${urlDetalle}" aria-label="Ver ${esc(p.nombre)}">${imgTag(p.imagen, p.nombre)}</a>
      ${categoria ? `<span class="product__tag">${esc(categoria)}</span>` : ""}
      <div class="product__body">
        <h3 class="product__name">${esc(p.nombre)}</h3>
        <p class="product__desc">${esc(p.descripcion)}</p>
        <div class="product__price">
          ${fmt(p.precio)}
          <small class="${agotado ? "is-out" : ""}">${textoStock(p)}</small>
        </div>
        <div class="product__actions">
          <button class="btn btn--primary" data-add="${esc(p.id)}" ${agotado ? "disabled" : ""}>
            ${agotado ? "Sin stock" : "Agregar al carrito"}
          </button>
          <a class="btn btn--ghost" href="${urlDetalle}">Ver detalle</a>
        </div>
      </div>
    </article>`;
}

// Inicialización automática al cargar el script en cualquier página
actualizarContador();
window.addEventListener("storage", actualizarContador);