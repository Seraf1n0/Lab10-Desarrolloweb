// Filtros: XML/JSON, page size (limit) y ordenamiento por name y otro price ascendente y descendente
import React from "react";
import styles from "../styles/Filtros.module.css";

interface FiltrosProps {
  formato?: "json" | "xml";
  pageSize?: number;
  sort?: "nombre_asc" | "nombre_desc" | "price_asc" | "price_desc";
  // Props para actualizar los filtros
  setFormato?: (formato: "json" | "xml") => void;
  setPageSize?: (size: number) => void;
  setSort?: (sort: "nombre_asc" | "nombre_desc" | "price_asc" | "price_desc") => void;
}

export default function Filtros({ formato, pageSize, sort, setFormato, setPageSize, setSort }: FiltrosProps) {
  return (
    <div className={styles.filtros}>
      <h3>Filtros</h3>
      <label htmlFor="formato">Formato:</label>
      <select name="formato" id="formato" value={formato} onChange={(e) => setFormato && setFormato(e.target.value as "json" | "xml")}>
        <option value="xml">XML</option>
        <option value="json">JSON</option>
      </select>

      <label htmlFor="pageSize">Tamaño de página:</label>
      <select name="pageSize" id="pageSize" value={pageSize} onChange={(e) => setPageSize && setPageSize(Number(e.target.value))}>
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
      </select>

      <label htmlFor="sort">Ordenar por:</label>
      <select name="sort" id="sort" value={sort} onChange={(e) => setSort && setSort(e.target.value as "nombre_asc" | "nombre_desc" | "price_asc" | "price_desc")}>
        <option value="nombre_asc">Nombre (A-Z)</option>
        <option value="nombre_desc">Nombre (Z-A)</option>
        <option value="price_asc">Precio (Menor a Mayor)</option>
        <option value="price_desc">Precio (Mayor a Menor)</option>
      </select>
    </div>
  );
}
