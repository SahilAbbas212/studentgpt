import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaEnvelope } from "react-icons/fa";
import { sendOTP, verifyOTP } from "../api/authApi";

function Register() {
  const navigate = useNavigate();

  // Step 1 fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP step
  const [step, setStep] = useState(1); // 1 = register form, 2 = OTP screen
  const [otp, setOtp] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // ── Step 1: Send OTP ──────────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await sendOTP(name, email, password);
      setStep(2);
      startResendCooldown();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to send OTP. Try again.");
    }
    setLoading(false);
  };

  // ── OTP digit input handler ───────────────────────────────────────
  const handleDigitChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otpDigits];
    updated[index] = value;
    setOtpDigits(updated);
    setOtp(updated.join(""));
    // Auto-focus next box
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length < 6) { setError("Please enter the full 6-digit code."); return; }
    setError("");
    setLoading(true);
    try {
      await verifyOTP(email, otp);
      setSuccess("Account created successfully!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err?.response?.data?.detail || "Invalid or expired OTP.");
    }
    setLoading(false);
  };

  // ── Resend OTP cooldown ───────────────────────────────────────────
  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setLoading(true);
    try {
      await sendOTP(name, email, password);
      setOtpDigits(["", "", "", "", "", ""]);
      setOtp("");
      startResendCooldown();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to resend OTP.");
    }
    setLoading(false);
  };

  // ── UI ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">

        {/* ── STEP 1: Registration Form ── */}
        {step === 1 && (
          <>
            <h1 className="text-4xl font-bold text-white text-center mb-2">StudentGPT</h1>
            <p className="text-gray-300 text-center mb-6">Create Your Account</p>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label className="block text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 outline-none focus:border-blue-400"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 outline-none focus:border-blue-400"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 text-white border border-white/20 outline-none focus:border-blue-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition"
                  >
                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition text-white font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {loading ? "Sending OTP..." : "Continue →"}
              </button>

              <p className="text-center text-gray-400 text-sm mt-4">
                Already have an account?{" "}
                <span onClick={() => navigate("/login")} className="text-blue-400 cursor-pointer hover:underline">
                  Sign In
                </span>
              </p>
            </form>
          </>
        )}

        {/* ── STEP 2: OTP Verification ── */}
        {step === 2 && (
          <>
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center mb-4">
                <FaEnvelope className="text-blue-400" size={28} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Check Your Email</h2>
              <p className="text-gray-400 text-sm text-center">
                We sent a 6-digit code to<br />
                <span className="text-blue-400 font-medium">{email}</span>
              </p>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-sm text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-green-500/20 border border-green-500/40 text-green-300 text-sm text-center">
                ✅ {success}
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className="space-y-6">
              {/* 6-digit boxes */}
              <div className="flex justify-center gap-3">
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(i, e)}
                    className="w-12 h-14 text-center text-2xl font-bold rounded-xl bg-white/10 text-white border border-white/20 outline-none focus:border-blue-400 focus:bg-blue-500/10 transition"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition text-white font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify & Create Account"}
              </button>
            </form>

            {/* Resend */}
            <p className="text-center text-gray-400 text-sm mt-5">
              Didn't receive it?{" "}
              <span
                onClick={handleResend}
                className={`font-medium transition ${
                  resendCooldown > 0
                    ? "text-gray-500 cursor-not-allowed"
                    : "text-blue-400 cursor-pointer hover:underline"
                }`}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
              </span>
            </p>

            <p
              onClick={() => { setStep(1); setError(""); setOtpDigits(["","","","","",""]); }}
              className="text-center text-gray-500 text-sm mt-3 cursor-pointer hover:text-gray-300 transition"
            >
              ← Back to registration
            </p>
          </>
        )}

      </div>
    </div>
  );
}

export default Register;