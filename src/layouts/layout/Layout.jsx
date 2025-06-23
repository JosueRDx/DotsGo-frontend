
import Header from "../header/Header";
import styles from "./Layout.module.css"

// eslint-disable-next-line react/prop-types
export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main className={styles.main}>{children}</main>
    </>
  );
}
