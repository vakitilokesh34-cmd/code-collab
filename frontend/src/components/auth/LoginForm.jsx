import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import API from "../../services/api";

import {
  useAuth,
} from "../../context/AuthContext";

export default function LoginForm() {

  const navigate =
    useNavigate();

  const { login } =
    useAuth();

  // loading
  const [loading, setLoading] =
    useState(false);

  // error
  const [error, setError] =
    useState("");

  // form
  const [form, setForm] =
    useState({
      email: "",
      password: "",
    });

  // login submit
  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setError("");

      try {

        setLoading(true);

        const { data } =
          await API.post(
            "/auth/login",
            form
          );

        // save auth
        login(data);

        // redirect
        navigate("/");

      } catch (error) {

        setError(
          error.response?.data
            ?.message ||
          "Login failed"
        );

      } finally {

        setLoading(false);
      }
    };

  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >

      {/* email */}
      <div>

        <label className="block text-sm uppercase tracking-widest text-gray-400 mb-3">

          Email Address
        </label>

        <input
          type="email"
          required

          placeholder="you@example.com"

          value={form.email}

          onChange={(e) =>
            setForm({
              ...form,
              email:
                e.target.value,
            })
          }

          className="w-full h-[64px] px-5 rounded-2xl bg-[#111827] border border-[#1E293B] outline-none text-white focus:border-[#12F7A0]"
        />
      </div>

      {/* password */}
      <div>

        <label className="block text-sm uppercase tracking-widest text-gray-400 mb-3">

          Password
        </label>

        <input
          type="password"
          required

          placeholder="Your password"

          value={form.password}

          onChange={(e) =>
            setForm({
              ...form,
              password:
                e.target.value,
            })
          }

          className="w-full h-[64px] px-5 rounded-2xl bg-[#111827] border border-[#1E293B] outline-none text-white focus:border-[#12F7A0]"
        />
      </div>

      {/* error */}
      {error && (

        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-xl text-sm">

          {error}
        </div>
      )}

      {/* submit */}
      <button
        disabled={loading}

        className="w-full h-[64px] rounded-2xl bg-[#12F7A0] text-black font-bold text-lg hover:opacity-90 disabled:opacity-50"
      >

        {loading
          ? "Signing In..."
          : "Sign In →"}
      </button>

      {/* signup */}
      <p className="text-center text-gray-400">

        No account yet?

        <Link
          to="/signup"
          className="text-[#12F7A0] ml-2 font-semibold"
        >
          Create one free
        </Link>
      </p>
    </form>
  );
}