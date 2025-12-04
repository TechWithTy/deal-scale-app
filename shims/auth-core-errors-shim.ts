// Minimal shim for '@auth/core/errors' to unblock builds.
export class OAuthCallbackError extends Error {}
export class InvalidCallbackUrl extends Error {}
export class InvalidCheck extends Error {}
export class AccountNotLinked extends Error {}
export class MissingCSRF extends Error {}
export class MissingState extends Error {}
export class OAuthSignInError extends Error {}
export class OAuthAccountNotLinkedError extends Error {}
export class OAuthProfileParseError extends Error {}
export class SignInError extends Error {}
export class UnknownAction extends Error {}
export class UnknownFlow extends Error {}
export class UnknownMessage extends Error {}
export class UnknownError extends Error {}
export class AuthError extends Error {}
export class CredentialsSignin extends Error {}
export default {
  OAuthCallbackError,
  InvalidCallbackUrl,
  InvalidCheck,
  AccountNotLinked,
  MissingCSRF,
  MissingState,
  OAuthSignInError,
  OAuthAccountNotLinkedError,
  OAuthProfileParseError,
  SignInError,
  UnknownAction,
  UnknownFlow,
  UnknownMessage,
  UnknownError,
  AuthError,
  CredentialsSignin,
};
