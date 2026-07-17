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
  return amplifySignIn({ username: email, password });
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
