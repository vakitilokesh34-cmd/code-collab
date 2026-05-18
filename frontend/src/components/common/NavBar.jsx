import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";

export default function Navbar() {

  const navigate =
    useNavigate();

  const { user, logout } =
    useAuth();

  // logout
  const handleLogout =
    () => {

      logout();

      navigate("/login");
    };

  return (

    <nav className="h-16 border-b border-[#1E293B] bg-[#0B1120] px-6 flex items-center justify-between">

      {/* left */}
      <Link
        to="/"
        className="text-2xl font-bold text-[#12F7A0]"
      >
        CodeCollab
      </Link>

      {/* right */}
      <div className="flex items-center gap-5">

        {user && (

          <>
            {/* user */}
            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-full bg-[#12F7A0] text-black font-bold flex items-center justify-center uppercase">

                {user.username?.charAt(0)}
              </div>

              <div className="text-sm">
                {user.username}
              </div>
            </div>

            {/* logout */}
            <button
              onClick={
                handleLogout
              }

              className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded-xl hover:bg-red-500/10"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}