// "use client";
// import React, { useState } from "react";
// import { Upload, Sparkles, Loader2, CheckCircle2 } from "lucide-react";

// export default function MagicImporter({ shopId }: { shopId: string }) {
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState<any>(null);

//   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setLoading(true);
//     setResult(null);

//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("shopId", shopId);

//     try {
//       const res = await fetch("/admin/api/magic-import", {
//         method: "POST",
//         body: formData,
//       });
//       const data = await res.json();
//       if (data.success) {
//         setResult(data.product);
//       } else {
//         alert("Алдаа гарлаа: " + data.error);
//       }
//     } catch (err) {
//       alert("Сервертэй холбогдоход алдаа гарлаа.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6 bg-[#F5F5F7] rounded-[32px] border shadow-sm max-w-2xl mx-auto">
//       <div className="mb-6">
//         <h2 className="text-2xl font-semibold flex items-center gap-2">
//           <Sparkles className="text-blue-500" /> Magic Import
//         </h2>
//         <p className="text-gray-500 text-sm">Зураг эсвэл Excel файл хуулахад AI шууд бүртгэнэ.</p>
//       </div>

//       <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl bg-white hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
//         {loading ? (
//           <div className="flex flex-col items-center">
//             <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
//             <p className="mt-2 text-sm text-blue-600 font-medium">AI боловсруулж байна...</p>
//           </div>
//         ) : (
//           <div className="flex flex-col items-center text-gray-400">
//             <Upload className="w-10 h-10 mb-2" />
//             <p className="text-sm font-medium text-gray-600">Файл сонгох эсвэл чирж авчирна уу</p>
//             <p className="text-xs">PNG, JPG, XLSX (Max 5MB)</p>
//           </div>
//         )}
//         <input type="file" className="hidden" onChange={handleFileUpload} disabled={loading} />
//       </label>

//       {result && (
//         <div className="mt-6 p-5 bg-white rounded-2xl border border-green-100 animate-in fade-in zoom-in duration-300">
//           <div className="flex items-center gap-2 text-green-600 mb-3 font-medium text-sm">
//             <CheckCircle2 className="w-4 h-4" /> Амжилттай бүртгэгдлээ
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Барааны нэр</span>
//               <p className="text-gray-900 font-medium">{result.name}</p>
//             </div>
//             <div>
//               <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Үнэ</span>
//               <p className="text-blue-600 font-bold">{result.price}₮</p>
//             </div>
//             <div className="col-span-2">
//               <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Тайлбар</span>
//               <p className="text-gray-600 text-sm leading-snug">{result.description}</p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



"use client";
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface MagicImporterProps {
  storeName: string;
  onSuccess: () => void;
}

export default function MagicImporter({ storeName, onSuccess }: MagicImporterProps) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("storeName", storeName);

    try {
      const res = await fetch("/admin/api/magic-import", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        onSuccess();
        alert("AI барааг амжилттай бүртгэлээ!");
      } else {
        alert("Алдаа гарлаа.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      e.target.value = ""; 
    }
  };

  return (
    <label className="flex items-center gap-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 px-5 py-2.5 rounded-2xl cursor-pointer transition-all active:scale-95">
      {loading ? (
        <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4 text-indigo-400" />
      )}
      <span className="text-indigo-400 font-bold text-sm">AI Import</span>
      <input 
        type="file" 
        className="hidden" 
        onChange={handleUpload} 
        disabled={loading} 
        accept="image/*,.xlsx,.xls" 
      />
    </label>
  );
}