import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { PRODUCT_NAME } from "../config";
import { useAuth } from "../hooks/useAuth.jsx";
import * as auth from "../lib/auth";
import "../styles/auth.css";

export default function LoginPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, refresh } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/app", { replace: true });
    }
  }, [user, navigate]);

  const [mode, setMode] = useState(params.get("intent") === "signup" ? "signup" : "signin");
  const [form, setForm] = useState({ name: "", email: "", password: "", code: "" });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

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
      navigate("/app");
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

  return (
    <div className="auth">
      <div className="auth__panel">
        <Link to="/" className="auth__logo">
          <span className="nav__logo-mark" aria-hidden="true" />
          {PRODUCT_NAME}
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
            <p className="auth__sub">Free for one workspace - no card required.</p>

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

function Field({ label, hint, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} />
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
  return err?.message || "Something went wrong. Try again.";
}
