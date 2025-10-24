import React from "react";
import { ProductResumen } from "../types/Product";
import styles from "../styles/CardProducto.module.css";

interface CardProductoProps {
  producto: ProductResumen;
  onVerDetalles: (id: number) => void;
}

export default function CardProducto({
  producto,
  onVerDetalles,
}: CardProductoProps) {
  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <h3 className={styles.name}>{producto.name}</h3>
        <p className={styles.sku}>SKU: {producto.sku}</p>
      </div>
      <button
        className={styles.button}
        onClick={() => onVerDetalles(producto.id)}
      >
        Ver Detalles
      </button>
    </div>
  );
}
