import {
  Link,
} from "react-router-dom";

export default function NotFound() {

  return (

    <div className="min-h-screen bg-[#070B16] flex flex-col items-center justify-center text-white">

      <h1 className="text-8xl font-black text-[#12F7A0] mb-5">

        404
      </h1>

      <h2 className="text-3xl font-bold mb-4">

        Page Not Found
      </h2>

      <p className="text-gray-400 mb-8">

        The page you are looking for does not exist.
      </p>

      <Link
        to="/"

        className="px-6 py-3 rounded-xl bg-[#12F7A0] text-black font-bold"
      >
        Go Home
      </Link>
    </div>
  );
}