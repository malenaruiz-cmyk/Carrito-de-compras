import { fmt, esc, imgTag, getCarrito, guardarCarrito, totalPrecio, avisar } from "./tienda.js";

const contenedorLista = document.getElementById("lista");
const totalSpan = document.getElementById("totalapagar");
const btnFinalizar = document.getElementById("finalizarcompra");

// Control de stock opcional
const obtenerStock = (item) => (item.stock == null ? Infinity : item.stock);

function mostrarCarrito() {
  const carrito = getCarrito();

  if (carrito.length === 0) {
    contenedorLista.innerHTML = `
      <div class="empty">
        <p>Tu carrito está vacío. ¡Agregá productos!</p>
        <a class="btn btn--primary" href="productos.html">Ver productos</a>
      </div>`;
  } else {
    contenedorLista.innerHTML = carrito.map(i => `
      <article class="cart-row">
        ${imgTag(i.imagen, i.nombre, "cart-row__img")}
        <div>
          <p class="cart-row__name">${esc(i.nombre)}</p>
          <p class="cart-row__unit">${fmt(i.precio)} c/u</p>
        </div>
        <div class="qty">
          <button type="button" class="qty__btn" data-menos="${esc(i.id)}">−</button>
          <span class="qty__num">${i.cantidad}</span>
          <button type="button" class="qty__btn" data-mas="${esc(i.id)}">+</button>
        </div>
        <p class="cart-row__sub">${fmt(i.precio * i.cantidad)}</p>
        <button type="button" class="cart-row__remove" data-eliminar="${esc(i.id)}">Eliminar</button>
      </article>
    `).join("");
  }

  totalSpan.textContent = fmt(totalPrecio(carrito));
  btnFinalizar.disabled = carrito.length === 0;
}

function sacarDelCarrito(id) {
  const carrito = getCarrito();
  const producto = carrito.find(i => i.id === id);
  if (!producto) return;

  if (confirm(`¿Seguro que querés sacar "${producto.nombre}"?`)) {
    const nuevoCarrito = carrito.filter(i => i.id !== id);
    guardarCarrito(nuevoCarrito);
    mostrarCarrito();
  }
}

function cambiarCantidad(id, delta) {
  const carrito = getCarrito();
  const producto = carrito.find(i => i.id === id);
  if (!producto) return;

  const nuevaCantidad = producto.cantidad + delta;

  if (nuevaCantidad < 1) {
    sacarDelCarrito(id);
    return;
  }
  if (nuevaCantidad > obtenerStock(producto)) {
    avisar("¡Ups! No hay más stock disponible.");
    return;
  }

  producto.cantidad = nuevaCantidad;
  guardarCarrito(carrito);
  mostrarCarrito();
}

// Manejo de eventos con delegación
contenedorLista.addEventListener("click", (e) => {
  const btnMas = e.target.closest("[data-mas]");
  const btnMenos = e.target.closest("[data-menos]");
  const btnEliminar = e.target.closest("[data-eliminar]");

  if (btnMas) cambiarCantidad(btnMas.dataset.mas, 1);
  if (btnMenos) cambiarCantidad(btnMenos.dataset.menos, -1);
  if (btnEliminar) sacarDelCarrito(btnEliminar.dataset.eliminar);
});

btnFinalizar.addEventListener("click", () => {
  const carrito = getCarrito();
  if (carrito.length === 0) return;

  const totalCompra = totalPrecio(carrito);
  guardarCarrito([]);
  mostrarCarrito();
  avisar(`¡Compra realizada con éxito! Total: ${fmt(totalCompra)} 🚀`);
});

// Arrancar la app
mostrarCarrito();