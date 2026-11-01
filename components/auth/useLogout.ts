"use client";

import { useRouter } from "next/navigation";

// Encerra a sessão, volta para a home e atualiza os Server Components (navbar, boas-vindas)
export function useLogout() {
  const router = useRouter();
  return async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/");
    router.refresh();
  };
}
