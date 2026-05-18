import {
  Outlet,
} from "react-router-dom";

export default function RoomLayout() {

  return (

    <div className="h-screen overflow-hidden bg-[#070B16] text-white">

      {/* room content */}
      <Outlet />
    </div>
  );
}