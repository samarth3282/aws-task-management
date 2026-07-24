import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Eye, EyeOff, UploadCloud } from "lucide-react";
import { PRODUCT_NAME } from "../config";
import { useAuth } from "../hooks/useAuth.jsx";
import * as auth from "../lib/auth";
import * as api from "../lib/api";
import TaskflowLogo from "../components/ui/TaskflowLogo.jsx";
import "../styles/auth.css";

export default function LoginPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, refresh } = useAuth();

  const [mode, setMode] = useState(params.get("intent") === "signup" ? "signup" : "signin");
  const [form, setForm] = useState({ name: "", email: "", password: "", code: "" });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user && mode !== "setup_profile") {
      navigate("/app", { replace: true });
    }
  }, [user, navigate, mode]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSignIn(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      try {
        await auth.signIn(form.email, form.password);
      } catch (signInErr) {
        if (signInErr?.message === "There is already a signed in user.") {
          await auth.signOut();
          await auth.signIn(form.email, form.password);
        } else {
          throw signInErr;
        }
      }
      await refresh();
      navigate("/app");
    } catch (err) {
      setError(readableAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      try {
        await auth.signUp(form.email, form.password, form.name);
      } catch (signUpErr) {
        if (signUpErr?.message === "There is already a signed in user.") {
          await auth.signOut();
          await auth.signUp(form.email, form.password, form.name);
        } else {
          throw signUpErr;
        }
      }
      setInfo(`We sent a confirmation code to ${form.email}.`);
      setMode("confirm");
    } catch (err) {
      setError(readableAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirm(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await auth.confirmSignUp(form.email, form.code);
      await auth.signIn(form.email, form.password);
      await refresh();
      setInfo("");
      setMode("setup_profile");
    } catch (err) {
      setError(readableAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    setError("");
    try {
      await auth.resendCode(form.email);
      setInfo(`Sent a new code to ${form.email}.`);
    } catch (err) {
      setError(readableAuthError(err));
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await auth.resetPassword(form.email);
      setInfo(`We sent a password reset code to ${form.email}.`);
      setMode("reset_confirm");
    } catch (err) {
      setError(readableAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleResetConfirm(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await auth.confirmResetPassword(form.email, form.code, form.password);
      setInfo("Password reset successful. You can now log in with your new password.");
      setMode("signin");
    } catch (err) {
      setError(readableAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  const handleProfileFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setError("File must be smaller than 5MB");
      return;
    }
    setProfileFile(f);
    setProfilePreview(URL.createObjectURL(f));
    setError("");
  };

  async function handleProfileSetup(e) {
    e?.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (profileFile) {
        const result = await api.uploadProfilePhoto(profileFile);
        await auth.updateProfileAttributes(undefined, result.publicUrl);
        await refresh();
      }
      navigate("/app");
    } catch (err) {
      setError(err.message || "Failed to upload profile photo");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth__panel">
        <Link to="/" className="auth__logo">
          <TaskflowLogo className="nav__logo-mark" aria-hidden="true" />
          <span className="auth__logo-text">{PRODUCT_NAME}</span>
        </Link>

        {mode === "signin" && (
          <>
            <h1>Welcome back</h1>
            <p className="auth__sub">Log in to pick up where your team left off.</p>

            <form className="auth__form" onSubmit={handleSignIn}>
              <Field label="Email" type="email" required value={form.email} onChange={set("email")} autoComplete="email" />
              <Field
                label="Password"
                type="password"
                required
                value={form.password}
                onChange={set("password")}
                autoComplete="current-password"
              />
              <div style={{ textAlign: 'right', marginTop: '-8px', marginBottom: '16px' }}>
                <button type="button" onClick={() => { setMode("forgot"); setError(""); setInfo(""); }} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: 13, cursor: 'pointer', padding: 0 }}>
                  Forgot your password?
                </button>
              </div>
              {info && <p style={{ color: 'var(--teal-400)', fontSize: 14, marginBottom: 16 }}>{info}</p>}
              {error && <p className="auth__error">{error}</p>}
              <button className="btn btn--amber btn--block" type="submit" disabled={busy}>
                {busy ? "Signing in..." : "Log in"}
              </button>
            </form>

            <p className="auth__switch">
              New here?{" "}
              <button type="button" onClick={() => { setMode("signup"); setError(""); }}>
                Create an account
              </button>
            </p>
          </>
        )}

        {mode === "signup" && (
          <>
            <h1>Create your account</h1>
            {/* <p className="auth__sub">Free for one workspace - no card required.</p> */}

            <form className="auth__form" onSubmit={handleSignUp}>
              <Field label="Name" required value={form.name} onChange={set("name")} autoComplete="name" />
              <Field label="Email" type="email" required value={form.email} onChange={set("email")} autoComplete="email" />
              <Field
                label="Password"
                type="password"
                required
                value={form.password}
                onChange={set("password")}
                autoComplete="new-password"
                hint="At least 8 characters, with a number and a symbol."
              />
              {error && <p className="auth__error">{error}</p>}
              <button className="btn btn--amber btn--block" type="submit" disabled={busy}>
                {busy ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="auth__switch">
              Already have an account?{" "}
              <button type="button" onClick={() => { setMode("signin"); setError(""); }}>
                Log in
              </button>
            </p>
          </>
        )}

        {mode === "confirm" && (
          <>
            <h1>Check your inbox</h1>
            <p className="auth__sub">{info || `Enter the code we sent to ${form.email}.`}</p>

            <form className="auth__form" onSubmit={handleConfirm}>
              <Field label="Confirmation code" required value={form.code} onChange={set("code")} autoComplete="one-time-code" />
              {error && <p className="auth__error">{error}</p>}
              <button className="btn btn--amber btn--block" type="submit" disabled={busy}>
                {busy ? "Confirming..." : "Confirm and continue"}
              </button>
            </form>

            <p className="auth__switch">
              Didn't get it?{" "}
              <button type="button" onClick={handleResend}>
                Resend code
              </button>
            </p>
          </>
        )}

        {mode === "forgot" && (
          <>
            <h1>Reset Password</h1>
            <p className="auth__sub">Enter your email and we'll send you a reset code.</p>

            <form className="auth__form" onSubmit={handleForgotPassword}>
              <Field label="Email" type="email" required value={form.email} onChange={set("email")} autoComplete="email" />
              {error && <p className="auth__error">{error}</p>}
              <button className="btn btn--amber btn--block" type="submit" disabled={busy}>
                {busy ? "Sending..." : "Send Reset Code"}
              </button>
            </form>

            <p className="auth__switch">
              Remembered your password?{" "}
              <button type="button" onClick={() => { setMode("signin"); setError(""); }}>
                Log in
              </button>
            </p>
          </>
        )}

        {mode === "reset_confirm" && (
          <>
            <h1>Set New Password</h1>
            <p className="auth__sub">{info || `Enter the code we sent to ${form.email}.`}</p>

            <form className="auth__form" onSubmit={handleResetConfirm}>
              <Field label="Confirmation code" required value={form.code} onChange={set("code")} autoComplete="one-time-code" />
              <Field
                label="New Password"
                type="password"
                required
                value={form.password}
                onChange={set("password")}
                autoComplete="new-password"
                hint="At least 8 characters, with a number and a symbol."
              />
              {error && <p className="auth__error">{error}</p>}
              <button className="btn btn--amber btn--block" type="submit" disabled={busy}>
                {busy ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <p className="auth__switch">
              Didn't get it?{" "}
              <button type="button" onClick={handleForgotPassword}>
                Resend code
              </button>
            </p>
          </>
        )}

        {mode === "setup_profile" && (
          <>
            <h1>Add a profile photo</h1>
            <p className="auth__sub">Help your team recognize you.</p>
            {info && <p className="auth__info">{info}</p>}

            <form className="auth__form" onSubmit={handleProfileSetup}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '24px 0' }}>
                <div 
                  style={{ 
                    width: '120px', 
                    height: '120px', 
                    borderRadius: '50%', 
                    background: 'var(--ink-700)',
                    backgroundImage: profilePreview ? `url(${profilePreview})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    border: '2px dashed var(--color-border)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {!profilePreview && <UploadCloud size={32} color="var(--text-500)" />}
                  <label style={{ 
                    position: 'absolute', inset: 0, cursor: 'pointer', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)',
                    opacity: 0, transition: 'opacity 0.2s' 
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                  >
                    <UploadCloud size={24} color="#fff" />
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleProfileFileChange} />
                  </label>
                </div>
                <span style={{ fontSize: '13px', color: 'var(--text-500)' }}>Click to upload (Max 5MB)</span>
              </div>

              {error && <p className="auth__error">{error}</p>}
              
              <button className="btn btn--accent btn--block" type="submit" disabled={busy}>
                {busy ? "Saving..." : "Save Profile"}
              </button>
              
              <button 
                type="button" 
                className="btn btn--outline btn--block" 
                style={{ marginTop: '12px' }}
                onClick={() => navigate("/app")}
                disabled={busy}
              >
                Skip for now
              </button>
            </form>
          </>
        )}
      </div>

      <div className="auth__side" aria-hidden="true">
        <div className="auth__side-card">
          <span className="board-mockup__card-ref">TSK-118</span>
          <p className="board-mockup__card-title">Ship the confirmation email copy</p>
          <span className="pill pill--amber">MEDIUM</span>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, type, ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <label className="field">
      <span>{label}</span>
      <div style={{ position: 'relative' }}>
        <input
          type={inputType}
          {...props}
          style={{
            ...props.style,
            paddingRight: isPassword ? '40px' : undefined,
            width: '100%',
            boxSizing: 'border-box'
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-500)',
              display: 'flex',
              padding: 0,
            }}
            title={showPassword ? "Hide password" : "Show password"}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {hint && <small>{hint}</small>}
    </label>
  );
}

function readableAuthError(err) {
  const name = err?.name || "";
  if (name === "UsernameExistsException") return "An account with that email already exists.";
  if (name === "NotAuthorizedException") return "Incorrect email or password.";
  if (name === "UserNotConfirmedException") return "Please confirm your email before logging in.";
  if (name === "CodeMismatchException") return "That code doesn't match. Check and try again.";
  if (name === "InvalidPasswordException") return "Password needs 8+ characters, a number, and a symbol.";
  if (name === "LimitExceededException") return "Too many attempts. Please wait a while before trying again.";
  if (name === "ExpiredCodeException") return "The code has expired. Please request a new one.";
  return err?.message || "Something went wrong. Try again.";
}
