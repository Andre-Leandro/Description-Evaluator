import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import useProducts from "../../hooks/useProduct";

export default function Results() {
  const { products } = useProducts();
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

  return (
    <div className="max-w-7xl mx-auto text-center space-y-6 mt-18">
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
  );
}
