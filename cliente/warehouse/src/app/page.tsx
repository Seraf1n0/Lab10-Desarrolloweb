"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Navbar from "./components/Navbar";
import Filtros from "./components/Filtros";
import CardProducto from "./components/CardProducto";
import ModalProducto from "./components/ModalProducto";
import { ProductResumen } from "./types/Product";
import { fetchProducts } from "./services/api";

export default function Home() {
  const [productos, setProductos] = useState<ProductResumen[]>([]);
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState<number | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para manejar los props de filtros
  const [formato, setFormato] = useState<"json" | "xml">("json");
  const [pageSize, setPageSize] = useState<number>(10);
  const [sort, setSort] = useState<"nombre_asc" | "nombre_desc" | "price_asc" | "price_desc">("nombre_asc");
  
  // Estados para la paginación (inicia en 1)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Ordenamiento local (porque no tenemos sort en el api)
  const aplicarOrdenamiento = (productos: ProductResumen[]) => {
    return [...productos].sort((a, b) => {
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
  };

  // LOAD de productos
  const cargarProductos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { products, pagination } = await fetchProducts(currentPage, pageSize, formato);
      
      // Convertir productos de la API a ProductResumen
      const productosResumen: ProductResumen[] = products.map(p => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        price: p.price
      }));

      // Aplicar ordenamiento local si es necesario
      const productosOrdenados = aplicarOrdenamiento(productosResumen);
      
      setProductos(productosOrdenados);
      setTotalPages(pagination.totalPages);
      setTotalProducts(pagination.total);
      
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Error al cargar los productos. Verifica que la API esté ejecutándose.');
    } finally {
      setLoading(false);
    }
  };

  // Se cargan productos cuando cambia pagina o filtrado
  useEffect(() => {
    cargarProductos();
  }, [currentPage, pageSize, formato]);

  // Se recarga cuando se cambie el ordenamiento
  useEffect(() => {
    if (productos.length > 0) {
      const productosOrdenados = aplicarOrdenamiento(productos);
      setProductos(productosOrdenados);
    }
  }, [sort]);

  // cuando cambie pageSize o sort se reinicia a pagina 1 (Porque con el filtro el total de paginas puede cambiar)
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize, formato]);

  // abrimos el modal con el id cargado
  const handleVerDetalles = (id: number) => {
    setProductoSeleccionadoId(id);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setProductoSeleccionadoId(null);
  };

  // Funciones de paginación
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

            {/* Manejo de errores*/}
            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            {/* Resumen de paginas */}
            <div className={styles.info}>
              <span>
                Página {currentPage} de {totalPages} | {productos.length} productos mostrados de {totalProducts} total
              </span>
            </div>

            {loading ? (
              <div className={styles.loading}>
                Cargando productos...
              </div>
            ) : (
              <div className={styles.grid}>
                {productos.map((producto) => (
                  <CardProducto
                    key={producto.id}
                    producto={producto}
                    onVerDetalles={handleVerDetalles}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button 
                  className={styles.pageButton}
                  onClick={irPaginaAnterior}
                  disabled={currentPage === 1 || loading}
                >
                  Anterior
                </button>
                <span className={styles.pageInfo}>
                  {currentPage} / {totalPages}
                </span>
                <button 
                  className={styles.pageButton}
                  onClick={irPaginaSiguiente}
                  disabled={currentPage === totalPages || loading}
                >
                  Siguiente
                </button>
              </div>
            )}
          </section>
        </div>

        <ModalProducto
          productId={productoSeleccionadoId}
          isOpen={modalAbierto}
          onClose={cerrarModal}
          formato={formato}
        />
      </main>
    </div>
  );
}
