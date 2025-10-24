"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Navbar from "./components/Navbar";
import Filtros from "./components/Filtros";
import CardProducto from "./components/CardProducto";
import ModalProducto from "./components/ModalProducto";
import { Product, ProductResumen } from "./types/Product";

export default function Home() {
  const [productos, setProductos] = useState<ProductResumen[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Product | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  
  // Estados para manejar los props de filtros (no se si es la forma mas eficiente)
  const [formato, setFormato] = useState<"json" | "xml">("json");
  const [pageSize, setPageSize] = useState<number>(10);
  const [sort, setSort] = useState<"nombre_asc" | "nombre_desc" | "price_asc" | "price_desc">("nombre_asc");
  
  // Estados para la paginación (inicia en 1)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Datos llenados con API
  const productosTotales: ProductResumen[];

  const productosCompletos: Product[];

  const aplicarFiltros = (productos: ProductResumen[]) => {
    const productosFiltrados = [...productos];

    // Aplicar ordenamiento
    productosFiltrados.sort((a, b) => {
      switch (sort) {
        case "nombre_asc":
          return a.name.localeCompare(b.name);
        case "nombre_desc":
          return b.name.localeCompare(a.name);
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        default:
          return 0;
      }
    });

    return productosFiltrados;
  };

  // Función para obtener productos paginados
  const obtenerProductosPaginados = (productos: ProductResumen[]) => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return productos.slice(startIndex, endIndex);
  };

  // En el evento de cambio de filtros o paginación
  useEffect(() => {
    const productosFiltrados = aplicarFiltros(productosTotales);
    // Se calcula con ceiling para redondear hacia arriba
    const totalPaginas = Math.ceil(productosFiltrados.length / pageSize);
    
    setTotalPages(totalPaginas);
    
    if (currentPage > totalPaginas && totalPaginas > 0) {
      setCurrentPage(1);
    }
    
    const productosPaginados = obtenerProductosPaginados(productosFiltrados);
    setProductos(productosPaginados);
  }, [pageSize, sort, currentPage]);

  // cuando cambie pageSize o sort se reinicia a pagina 1 (Porque con el filtro el total de paginas puede cambiar)
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize, sort]);

  const handleVerDetalles = (id: number) => {
    // cambiamo a = fetch api
    const producto = productosCompletos.find((p) => p.id === id);
    if (producto) {
      setProductoSeleccionado(producto);
      setModalAbierto(true);
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setProductoSeleccionado(null);
  };

  // Funciones para paginacion con validacion para no ir a pagina -1 xd
  const irPaginaAnterior = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const irPaginaSiguiente = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Navbar />
        <div className={styles.body}>
          <aside>
            <Filtros
              formato={formato}
              pageSize={pageSize}
              sort={sort}
              setFormato={setFormato}
              setPageSize={setPageSize}
              setSort={setSort}
            />
          </aside>

          <section className={styles.content}>
            <h2>Productos en Inventario</h2>
            <p>Consulta y gestiona los productos de nuestro almacén.</p>

            {/* Resumen de paginas */}
            <div className={styles.info}>
              <span>
                Página {currentPage} de {totalPages} | {productos.length} productos mostrados
              </span>
            </div>

            <div className={styles.grid}>
              {productos.map((producto) => (
                <CardProducto
                  key={producto.id}
                  producto={producto}
                  onVerDetalles={handleVerDetalles}
                />
              ))}
            </div>

            {/* Controles de paginación */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button 
                  className={styles.pageButton}
                  onClick={irPaginaAnterior}
                  disabled={currentPage === 1}
                >
                  Anterior
                </button>
                <span className={styles.pageInfo}>
                  {currentPage} / {totalPages}
                </span>
                <button 
                  className={styles.pageButton}
                  onClick={irPaginaSiguiente}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </button>
              </div>
            )}
          </section>
        </div>

        <ModalProducto
          producto={productoSeleccionado}
          isOpen={modalAbierto}
          onClose={cerrarModal}
          formato={formato}
        />
      </main>
    </div>
  );
}
