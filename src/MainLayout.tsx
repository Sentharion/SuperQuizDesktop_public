import { Outlet } from "react-router-dom";
import background from "./assets/images/background.png";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden" style={{ backgroundImage: `url(${background})` }}>
      <div className="absolute inset-0 bg-linear-to-br from-[#33D6FF] via-[#66E0FF90] to-[#99EBFF30] pointer-events-none" />

      <div className="relative z-10 h-screen overflow-y-auto custom-scrollbar">
        <Outlet />
      </div>
    </div>
  );
}