import { useEffect, useState } from "react";

export default function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5001/products")
      .then((res) => res.json())
      .then((data) => {
        console.log("Respuesta del backend:", data); // <-- Acá ves el JSON recibido
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err)
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { products, loading, error };
}