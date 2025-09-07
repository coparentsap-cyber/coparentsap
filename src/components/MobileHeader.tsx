import { useState } from "react";
import Sidebar from "./Sidebar";

export default function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="lg:hidden bg-white border-b shadow-md p-4 flex justify-between items-center">
      <h1 className="text-lg font-bold">Co-Parents</h1>
      <button onClick={() => setOpen(!open)} className="text-2xl">
        ☰
      </button>

      {/* ✅ Sidebar version mobile */}
      {open && <Sidebar isOpen={open} onClose={() => setOpen(false)} />}
    </header>
  );
}
