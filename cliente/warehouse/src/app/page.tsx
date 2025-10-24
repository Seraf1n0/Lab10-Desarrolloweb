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

  const productosSimulados: ProductResumen[] = [
    { id: 1, sku: "WH-001", name: "Laptop Dell Inspiron 15", price: 8500.0 },
    { id: 2, sku: "WH-002", name: "Mouse Logitech MX Master", price: 450.0 },
    { id: 3, sku: "WH-003", name: "Teclado Mecánico Corsair", price: 1200.0 },
    { id: 4, sku: "WH-004", name: 'Monitor Samsung 24"', price: 2200.0 },
    { id: 5, sku: "WH-005", name: "Auriculares Sony WH-1000XM4", price: 3500.0 },
    { id: 6, sku: "WH-006", name: "Webcam Logitech C920", price: 800.0 },
    { id: 7, sku: "WH-007", name: "Router WiFi 6 ASUS", price: 2500.0 },
    { id: 8, sku: "WH-008", name: "Disco SSD Samsung 1TB", price: 3000.0 },
    { id: 9, sku: "WH-009", name: "Impresora Canon PIXMA", price: 1500.0 },
    { id: 10, sku: "WH-010", name: "Cable HDMI Premium", price: 200.0 },
    { id: 11, sku: "WH-011", name: "Hub USB-C 7 en 1", price: 1200.0 },
    { id: 12, sku: "WH-012", name: "Cargador Inalámbrico Qi", price: 800.0 },
  ];

  const productosCompletos: Product[] = [
    {
      id: 1,
      sku: "WH-001",
      name: "Laptop Dell Inspiron 15",
      description: "Laptop de alto rendimiento con procesador Intel Core i7, 16GB RAM y 512GB SSD",
      price: 8500.0,
      category: "Computadoras",
      stock: 5,
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-10-20T14:45:00Z",
    },
    {
      id: 2,
      sku: "WH-002",
      name: "Mouse Logitech MX Master",
      description: "Mouse ergonómico inalámbrico con precisión avanzada y múltiples botones programables",
      price: 450.0,
      category: "Periféricos",
      stock: 12,
      createdAt: "2024-02-10T09:15:00Z",
      updatedAt: "2024-10-18T11:20:00Z",
    },
    {
      id: 3,
      sku: "WH-003",
      name: "Teclado Mecánico Corsair",
      description: "Teclado mecánico retroiluminado con switches Cherry MX y diseño compacto",
      price: 1200.0,
      category: "Periféricos",
      stock: 8,
      createdAt: "2024-03-05T14:00:00Z",
      updatedAt: "2024-10-19T16:10:00Z",
    },
    {
      id: 4,
      sku: "WH-004",
      name: 'Monitor Samsung 24"',
      description: "Monitor Full HD de 24 pulgadas con tecnología Eye Saver y diseño sin bordes",
      price: 2200.0,
      category: "Monitores",
      stock: 10,
      createdAt: "2024-04-12T08:45:00Z",
      updatedAt: "2024-10-17T13:30:00Z",
    },
    {
      id: 5,
      sku: "WH-005",
      name: "Auriculares Sony WH-1000XM4",
      description: "Auriculares inalámbricos con cancelación de ruido líder en la industria",
      price: 3500.0,
      category: "Audio",
      stock: 7,
      createdAt: "2024-05-20T11:25:00Z",
      updatedAt: "2024-10-16T15:55:00Z",
    },
    {
      id: 6,
      sku: "WH-006",
      name: "Webcam Logitech C920",
      description: "Webcam Full HD 1080p con enfoque automático y corrección de luz",
      price: 800.0,
      category: "Periféricos",
      stock: 15,
      createdAt: "2024-06-18T13:50:00Z",
      updatedAt: "2024-10-15T12:40:00Z",
    },
    {
      id: 7,
      sku: "WH-007",
      name: "Router WiFi 6 ASUS",
      description: "Router de alta velocidad con tecnología WiFi 6 y cobertura extendida",
      price: 1800.0,
      category: "Redes",
      stock: 6,
      createdAt: "2024-07-01T10:00:00Z",
      updatedAt: "2024-10-14T08:30:00Z",
    },
    {
      id: 8,
      sku: "WH-008",
      name: "Disco SSD Samsung 1TB",
      description: "Unidad de estado sólido de 1TB con velocidades de lectura ultrarrápidas",
      price: 950.0,
      category: "Almacenamiento",
      stock: 20,
      createdAt: "2024-07-15T14:20:00Z",
      updatedAt: "2024-10-13T16:45:00Z",
    }
  ];

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
    const productosFiltrados = aplicarFiltros(productosSimulados);
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
