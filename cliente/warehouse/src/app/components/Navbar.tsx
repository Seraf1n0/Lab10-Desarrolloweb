import styles from "../styles/Navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles["navbar-container"]}>
      <h1 className={styles["navbar-title"]}>Warehouse Serafino</h1>
    </nav>
  );
}
