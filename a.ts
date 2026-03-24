//                   <div className="prose prose-invert ...">
// <ReactMarkdown
//   components={{
// p: ({ children }) => {
//   const childrenArray = React.Children.toArray(children);
  
//   const imageElements = childrenArray.filter((child): child is React.ReactElement => 
//     React.isValidElement(child) && (child.type === 'img' || (child.props as any)?.src)
//   );

//   if (imageElements.length > 0) {
//     const products = imageElements.map((img) => {
//       const altText = (img.props as any).alt || "";
//       const parts = altText.split(",");
//       return {
//         name: parts[0]?.replace('!', '').trim() || "Бараа",
//         price: parts[1]?.trim() || "Үнэгүй",
//         image: (img.props as any).src,
//         description: parts[2]?.trim() || ""
//       };
//     });

//     const otherText = childrenArray.filter(child => 
//       !React.isValidElement(child) || (child.type !== 'img' && !(child.props as any)?.src)
//     );

//     return (
//       <div className="w-full">
// <ProductCarousel 
//   products={products} 
//   onBuy={(name, price) => buyProduct(name, price)} // Хоёр утга авна
//   onSelect={(product) => setSelectedProduct(product)} 
// />
        
//         {otherText.length > 0 && (
//           <div className="mt-2 text-sm opacity-80 px-4">
//             {otherText}
//           </div>
//         )}
//       </div>
//     );
//   }
  
//   const rawText = children?.toString() || "";
//   if (/ID:|PRICE:|IMG:|DESC:|Context:/gi.test(rawText)) return null;

//   return <p className="mb-4">{children}</p>;
// }
//   }}
// >
//   {message.content}
// </ReactMarkdown>