import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import useProducts from "../../hooks/useProduct";

export default function Results() {
  const { products, loading, error } = useProducts();
  let evaluated = products.filter(product => product.evaluated)

  // Contar los votos
  const voteCounts = {};
  evaluated.forEach(product => {
      voteCounts[product.vote] = (voteCounts[product.vote] || 0) + 1;
  });

  const data = Object.entries(voteCounts).map(([model, count]) => ({
    model,
    count,
  }));

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div>Error: {error}</div>;


  return (
   <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex justify-end mb-8">
        <span className="inline-block bg-[#a9cce3] text-white font-bold px-4 py-2 rounded-xl shadow">
          Evaluados: {evaluated.length} / {products.length}
        </span>
      </div>

      <div className="text-center">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="model" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8">
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    ["#1a5276", "#1f618d", "#2980b9", "#5499c7"][index % 4]
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

  );
}
