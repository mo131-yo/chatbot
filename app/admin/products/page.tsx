// "use client";
 
// import ProductTable from "@/app/admin/components/product/ProductTable";
// import ProductForm from "@/app/admin/components/product/ProductForm";
 
// export default function ProductsPage() {
//   return (
//     <div>
//       <div className="flex justify-between mb-4">
//         <h1 className="text-xl">Products</h1>
//         <ProductForm onSuccess={() => location.reload()} />
//       </div>
//  {/* dasdas */}
//       <ProductTable />
//     </div>
//   );
// }


"use client";
 
import ProductTable from "@/app/admin/components/product/ProductTable";
import ProductForm from "@/app/admin/components/product/ProductForm";
 
export default function ProductsPage() {
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl">Products</h1>
        <ProductForm onSuccess={() => location.reload()} />
      </div>
{/* dasdas */}
      <ProductTable />
    </div>
  );
}
 