import {
  Outlet,
} from "react-router-dom";

import Navbar from "../components/common/Navbar";

export default function MainLayout() {

  return (

    <div className="min-h-screen bg-[#070B16] text-white">

      {/* navbar */}
      <Navbar />

      {/* content */}
      <main className="min-h-[calc(100vh-64px)]">

        <Outlet />
      </main>
    </div>
  );
}