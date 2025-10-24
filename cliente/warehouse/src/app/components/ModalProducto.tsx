"use client";
import React, { useState } from "react";
import { Product } from "../types/Product";
import styles from "../styles/ModalProducto.module.css";

interface ModalProductoProps {
  producto: Product | null;
  isOpen: boolean;
  onClose: () => void;
  formato: "json" | "xml";
}

export default function ModalProducto({
  producto,
  isOpen,
  onClose,
  formato,
}: ModalProductoProps) {
  const [showRaw, setShowRaw] = useState(false);

  if (!isOpen || !producto) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  // Generar rawData basado en el formato seleccionado
  const generateRawData = () => {
    if (formato === "json") {
      return JSON.stringify(producto, null, 2);
    } else {
      return `<?xml version="1.0" encoding="UTF-8"?>
<product>
  <id>${producto.id}</id>
  <sku>${producto.sku}</sku>
  <name><![CDATA[${producto.name}]]></name>
  <description><![CDATA[${producto.description}]]></description>
  <price>${producto.price}</price>
  <category>${producto.category}</category>
  <stock>${producto.stock}</stock>
  <createdAt>${producto.createdAt}</createdAt>
  <updatedAt>${producto.updatedAt}</updatedAt>
</product>`;
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{producto.name}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.controls}>
          <button
            className={`${styles.toggle} ${!showRaw ? styles.active : ""}`}
            onClick={() => setShowRaw(false)}
          >
            Vista Detallada
          </button>
          <button
            className={`${styles.toggle} ${showRaw ? styles.active : ""}`}
            onClick={() => setShowRaw(true)}
          >
            Raw ({formato.toUpperCase()})
          </button>
        </div>

        <div className={styles.content}>
          {showRaw ? (
            <pre className={styles.rawData}>{generateRawData()}</pre>
          ) : (
            <div className={styles.details}>
              <div className={styles.field}>
                <label>SKU:</label>
                <span>{producto.sku}</span>
              </div>
              <div className={styles.field}>
                <label>Descripción:</label>
                <span>{producto.description}</span>
              </div>
              <div className={styles.field}>
                <label>Precio:</label>
                <span className={styles.price}>
                  {formatPrice(producto.price)}
                </span>
              </div>
              <div className={styles.field}>
                <label>Categoría:</label>
                <span>{producto.category}</span>
              </div>
              <div className={styles.field}>
                <label>Stock:</label>
                <span
                  className={
                    producto.stock > 0 ? styles.inStock : styles.outStock
                  }
                >
                  {producto.stock} unidades
                </span>
              </div>
              <div className={styles.field}>
                <label>Creado:</label>
                <span>
                  {new Date(producto.createdAt).toLocaleDateString("es-GT")}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
