export type Gender = "masculino" | "feminino" | "nao_informado";

export type SessionUser = {
  id: number;
  firstName: string;
  lastName: string;
  gender: Gender;
  username: string;
  email: string;
};

// "Bem-vindo, João Silva" | "Bem-vinda, Maria Souza" | "Bem-vindo(a), Alex Lima"
export function welcomeText(user: Pick<SessionUser, "firstName" | "lastName" | "gender">) {
  const word =
    user.gender === "feminino"
      ? "Bem-vinda"
      : user.gender === "masculino"
        ? "Bem-vindo"
        : "Bem-vindo(a)";
  return `${word}, ${user.firstName} ${user.lastName}`;
}
