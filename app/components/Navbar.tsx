import { Home } from "lucide-react";


// Navbar up top, will extend functionality later
export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
      <div className="flex items-center">
        <Home className="h-5 w-5 text-[#4a8a9c] cursor-pointer hover:text-[#2c5a6e]" />
      </div>
      <h1 className="text-xl font-bold text-[#2c5a6e]">Clara</h1>
    </nav>
  );
} 