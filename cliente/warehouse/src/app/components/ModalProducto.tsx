"use client";
import React, { useState, useEffect } from "react";
import { Product } from "../types/Product";
import { fetchProductById } from "../services/api";
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
  const [rawData, setRawData] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Cuando cargue el modal hacemos el fetch del detalle del producto
  useEffect(() => {
    if (isOpen && producto) {
      setLoading(true);
      fetchProductById(producto.id, formato)
        .then(({ rawData }) => {
          setRawData(rawData);
        })
        .catch((error) => {
          console.error("Error loading product details:", error);
          setRawData("Error cargando datos del producto");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, producto?.id, formato]);

  if (!isOpen || !producto) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
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
            <div>
              {loading ? (
                <div>Cargando datos...</div>
              ) : (
                <pre className={styles.rawData}>{rawData}</pre>
              )}
            </div>
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
