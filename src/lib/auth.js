import { Amplify } from "aws-amplify";
import {
  signUp as amplifySignUp,
  confirmSignUp as amplifyConfirmSignUp,
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  fetchAuthSession,
  getCurrentUser as amplifyGetCurrentUser,
  resendSignUpCode,
  resetPassword as amplifyResetPassword,
  confirmResetPassword as amplifyConfirmResetPassword,
  updateUserAttributes,
  fetchUserAttributes,
} from "aws-amplify/auth";
import { AWS_REGION, USER_POOL_ID, USER_POOL_CLIENT_ID } from "../config";

Amplify.configure({
  Auth: {
    Cognito: {
      region: AWS_REGION,
      userPoolId: USER_POOL_ID,
      userPoolClientId: USER_POOL_CLIENT_ID,
    },
  },
});

export async function signUp(email, password, name) {
  return amplifySignUp({
    username: email,
    password,
    options: { userAttributes: { email, name } },
  });
}

export async function confirmSignUp(email, code) {
  return amplifyConfirmSignUp({ username: email, confirmationCode: code });
}

export async function resendCode(email) {
  return resendSignUpCode({ username: email });
}

export async function signIn(email, password) {
  const result = await amplifySignIn({ username: email, password });
  if (result.isSignedIn) {
    const sessionId = crypto.randomUUID();
    await updateUserAttributes({ userAttributes: { profile: sessionId } });
    localStorage.setItem("taskflow_session_id", sessionId);
  }
  return result;
}

export async function signOut() {
  return amplifySignOut();
}

export async function getCurrentUser() {
  try {
    return await amplifyGetCurrentUser();
  } catch {
    return null;
  }
}

export async function getToken() {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  if (!token) throw new Error("Not authenticated");
  return token;
}

export async function resetPassword(email) {
  return amplifyResetPassword({ username: email });
}

export async function confirmResetPassword(email, code, newPassword) {
  return amplifyConfirmResetPassword({ username: email, confirmationCode: code, newPassword });
}

export async function verifySession() {
  try {
    const attrs = await fetchUserAttributes();
    const currentSessionId = localStorage.getItem("taskflow_session_id");
    if (attrs.profile && attrs.profile !== currentSessionId) {
      return false;
    }
    return true;
  } catch {
    return true;
  }
}
