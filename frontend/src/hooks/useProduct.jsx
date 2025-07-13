import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL 

export default function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Respuesta del backend:", data);
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { products, loading, error };
}