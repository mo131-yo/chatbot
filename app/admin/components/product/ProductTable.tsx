

// "use client";

// import { useEffect, useState } from "react";

// export default function ProductTable() {
//   const [products, setProducts] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch("/api/products/public") // Дээрх шинэ API-гаа дуудна
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.success) setProducts(data.products);
//       });
//   }, []);
//   const fetchData = async () => {
//     try {
//       // API-ийн замыг өөрийнхөөрөө (жишээ нь: /admin/api/productGet) солиорой
//       const res = await fetch("/admin/api/productGet");
//       const data = await res.json();

//       if (data.success) {
//         setProducts(data.products); // data.products-ыг авна
//       }
//     } catch (error) {
//       console.error("Fetch error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   if (loading) return <div className="p-10 text-center">Уншиж байна...</div>;

//   return (
//     <div className="overflow-x-auto p-4 bg-gray-800 rounded-xl dark:bg-gray-300">
//       <table className="w-full text-sm text-white border-collapse">
//         <thead>
//           <tr className="text-gray-300 dark:text-gray-600 text-left border-b border-gray-500">
//             <th className="p-3">Image</th>
//             <th className="p-3">Name</th>
//             <th className="p-3">Price</th>
//             <th className="p-3">Brand</th>
//             <th className="p-3">Category</th>
//             <th className="p-3">Color</th>
//             <th className="p-3">Size</th>
//             <th className="p-3">Stock</th>
//             <th className="p-3">Description</th>
//           </tr>
//         </thead>

//         <tbody>
//           {products.length === 0 ? (
//             <tr>
//               <td colSpan={9} className="p-10 text-center text-gray-500">
//                 Бараа олдсонгүй.
//               </td>
//             </tr>
//           ) : (
//             products.map((p) => (
//               <tr
//                 key={p.id}
//                 className="border-b border-gray-800 hover:bg-gray-800/50 transition"
//               >
//                 <td className="p-3">
//                   {p.image ? (
//                     <img
//                       // join(",") хийсэн бол эхний зургийг нь салгаж авна
//                       src={p.image.split(",")[0]}
//                       className="w-12 h-12 object-cover rounded shadow-md"
//                       alt={p.name}
//                     />
//                   ) : (
//                     <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center text-[10px]">
//                       No img
//                     </div>
//                   )}
//                 </td>
//                 <td className="p-3 font-medium">{p.name}</td>
//                 <td className="p-3 text-indigo-400 font-bold">${p.price}</td>
//                 <td className="p-3">{p.brand}</td>
//                 <td className="p-3">{p.category}</td>
//                 <td className="p-3">
//                   <span className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs">
//                     {p.color}
//                   </span>
//                 </td>
//                 <td className="p-3">{p.size}</td>
//                 <td className="p-3">
//                   <span
//                     className={`px-2 py-1 rounded-full text-xs font-semibold ${
//                       Number(p.stock) > 10
//                         ? "bg-green-500/20 text-green-400"
//                         : Number(p.stock) > 0
//                           ? "bg-yellow-500/20 text-yellow-400"
//                           : "bg-red-500/20 text-red-400"
//                     }`}
//                   >
//                     {p.stock} ш
//                   </span>
//                 </td>
//                 <td
//                   className="p-3 max-w-[200px] truncate text-gray-400"
//                   title={p.description}
//                 >
//                   {p.description}
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";

export default function ProductTable() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Ганцхан fetchData функцийг ашиглана
  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await fetch("/admin/api/productAllGet");

      const data = await res.json();

      if (data.success) {
        setProducts(data.products || []);
      } else {
        console.error("API Error:", data.error);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading)
    return <div className="p-10 text-center text-white">Уншиж байна...</div>;

  return (
    <div className="overflow-x-auto p-4 bg-gray-900 rounded-xl">
      <table className="w-full text-sm text-white border-collapse">
        <thead>
          <tr className="text-gray-400 text-left border-b border-gray-700">
            <th className="p-3">Image</th>
            <th className="p-3">Name</th>
            <th className="p-3">Price</th>
            <th className="p-3">Brand</th>
            <th className="p-3">Category</th>
            <th className="p-3">Color</th>
            <th className="p-3">Size</th>
            <th className="p-3">Stock</th>
            <th className="p-3">Description</th>
          </tr>
        </thead>

        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={9} className="p-10 text-center text-gray-500">
                Бараа олдсонгүй. API-аа шалгана уу.
              </td>
            </tr>
          ) : (
            products.map((p) => (
              <tr
                key={p.id}
                className="border-b border-gray-800 hover:bg-gray-800/50 transition"
              >
                <td className="p-3">
                  {p.image ? (
                    <img
                      src={p.image.split(",")[0]} // Эхний зургийг авна
                      className="w-12 h-12 object-cover rounded"
                      alt=""
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center text-[10px]">
                      No img
                    </div>
                  )}
                </td>
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3 text-indigo-400 font-bold">${p.price}</td>
                <td className="p-3">{p.brand}</td>
                <td className="p-3">{p.category}</td>
                <td className="p-3">{p.color}</td>
                <td className="p-3">{p.size}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3 max-w-[200px] truncate text-gray-400">
                  {p.description}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
