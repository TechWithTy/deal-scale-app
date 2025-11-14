type NextAuthReturn = {
  handlers: any;
  auth: (...args: any[]) => Promise<null>;
  signIn: (...args: any[]) => Promise<void>;
  signOut: (...args: any[]) => Promise<void>;
  unstable_update: (...args: any[]) => Promise<void>;
};

export default function NextAuth(): NextAuthReturn {
  return {
    handlers: {},
    auth: async () => null,
    signIn: async () => {},
    signOut: async () => {},
    unstable_update: async () => {},
  };
}

