import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import API from "../../services/api";

export default function SignupForm() {

  const navigate =
    useNavigate();

  // loading
  const [loading, setLoading] =
    useState(false);

  // error
  const [error, setError] =
    useState("");

  // form
  const [form, setForm] =
    useState({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

  // signup submit
  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setError("");

      // password validation
      if (
        form.password !==
        form.confirmPassword
      ) {

        return setError(
          "Passwords do not match"
        );
      }

      try {

        setLoading(true);

        await API.post(
          "/auth/signup",
          {
            username:
              form.username,

            email:
              form.email,

            password:
              form.password,
          }
        );

        navigate("/login");

      } catch (error) {

        setError(
          error.response?.data
            ?.message ||
          "Signup failed"
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

      {/* username */}
      <div>

        <label className="block text-sm uppercase tracking-widest text-gray-400 mb-3">

          Display Name
        </label>

        <input
          type="text"
          required

          placeholder="e.g. Lokesh"

          value={form.username}

          onChange={(e) =>
            setForm({
              ...form,
              username:
                e.target.value,
            })
          }

          className="w-full h-[64px] px-5 rounded-2xl bg-[#111827] border border-[#1E293B] outline-none text-white focus:border-[#12F7A0]"
        />
      </div>

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

      {/* password row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* password */}
        <div>

          <label className="block text-sm uppercase tracking-widest text-gray-400 mb-3">

            Password
          </label>

          <input
            type="password"
            required

            placeholder="Min. 6 characters"

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

        {/* confirm */}
        <div>

          <label className="block text-sm uppercase tracking-widest text-gray-400 mb-3">

            Confirm Password
          </label>

          <input
            type="password"
            required

            placeholder="Repeat password"

            value={
              form.confirmPassword
            }

            onChange={(e) =>
              setForm({
                ...form,
                confirmPassword:
                  e.target.value,
              })
            }

            className="w-full h-[64px] px-5 rounded-2xl bg-[#111827] border border-[#1E293B] outline-none text-white focus:border-[#12F7A0]"
          />
        </div>
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
          ? "Creating..."
          : "Create account →"}
      </button>

      {/* login */}
      <p className="text-center text-gray-400">

        Already have an account?

        <Link
          to="/login"
          className="text-[#12F7A0] ml-2 font-semibold"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}