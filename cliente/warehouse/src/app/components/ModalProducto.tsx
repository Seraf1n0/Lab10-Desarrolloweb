"use client";
import React, { useState, useEffect } from "react";
import { Product } from "../types/Product";
import { fetchProductById } from "../services/api";
import styles from "../styles/ModalProducto.module.css";

interface ModalProductoProps {
  productId: number | null;
  isOpen: boolean;
  onClose: () => void;
  formato: "json" | "xml";
}

export default function ModalProducto({
  productId,
  isOpen,
  onClose,
  formato,
}: ModalProductoProps) {
  const [showRaw, setShowRaw] = useState(false);
  const [rawData, setRawData] = useState<string>("");
  const [producto, setProducto] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cuando cargue el modal hacemos el fetch del detalle del producto
  useEffect(() => {
    if (isOpen && productId) {
      setLoading(true);
      setError(null);

      fetchProductById(productId, formato)
        .then(({ product, rawData }) => {
          if (formato === "xml" && !product) {
            setError("No se pudo parsear el XML. Mostrando datos crudos.");
            setShowRaw(true);
          } else {
            setProducto(product);
          }
          setRawData(rawData);
        })
        .catch((error) => {
          console.error("Error loading product details:", error);
          setError("Error cargando datos del producto");
          setRawData("Error cargando datos del producto");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, productId, formato]);

  // Limpiar estado cuando se cierre el modal
  useEffect(() => {
    if (!isOpen) {
      setProducto(null);
      setRawData("");
      setError(null);
      setShowRaw(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
          <h2>{producto?.name || "Cargando..."}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.controls}>
          <button
            className={`${styles.toggle} ${!showRaw ? styles.active : ""}`}
            onClick={() => setShowRaw(false)}
            disabled={loading}
          >
            Vista Detallada
          </button>
          <button
            className={`${styles.toggle} ${showRaw ? styles.active : ""}`}
            onClick={() => setShowRaw(true)}
            disabled={loading}
          >
            Raw ({formato.toUpperCase()})
          </button>
        </div>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loadingContent}>
              <div>Cargando información del producto...</div>
            </div>
          ) : error ? (
            <div className={styles.errorContent}>
              <div>{error}</div>
              <button onClick={() => window.location.reload()}>
                Reintentar
              </button>
            </div>
          ) : showRaw ? (
            <pre className={styles.rawData}>{rawData}</pre>
          ) : producto ? (
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
          ) : null}
        </div>
      </div>
    </div>
  );
}
