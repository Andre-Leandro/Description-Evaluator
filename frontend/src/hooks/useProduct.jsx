'use client';

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL 

export default function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Try to fetch from API first, fall back to local data if it fails
    if (API_URL) {
      fetch(`${API_URL}/products`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Respuesta del backend:", data);
          setProducts(data.products || []);
          setLoading(false);
        })
        .catch((err) => {
          console.log("Error fetching from API, using local data:", err);
          loadLocalData();
        });
    } else {
      // No API URL configured, use local data
      loadLocalData();
    }
  }, []);

  const loadLocalData = async () => {
    try {
      const response = await fetch('/description.json');
      const data = await response.json();
      console.log("Using local data:", data);
      setProducts(data.products || []);
      setLoading(false);
    } catch (err) {
      console.log("Error loading local data:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  return { products, loading, error };
}