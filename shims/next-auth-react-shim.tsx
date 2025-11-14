import type { ReactNode } from "react";

export type SessionProviderProps = {
  session?: any;
  children?: ReactNode;
};

export function SessionProvider({ children }: SessionProviderProps) {
  return <>{children}</>;
}

export default {} as unknown as { SessionProvider: typeof SessionProvider };

