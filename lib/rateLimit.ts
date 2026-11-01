// Limite simples em memória: bloqueia depois de `max` erros dentro de 10 minutos.
const WINDOW = 10 * 60 * 1000;

export function createLimiter(max = 5) {
  const attempts = new Map<string, { count: number; first: number }>();
  return {
    blocked(key: string) {
      const a = attempts.get(key);
      return !!a && a.count >= max && Date.now() - a.first < WINDOW;
    },
    fail(key: string) {
      const a = attempts.get(key);
      if (!a || Date.now() - a.first > WINDOW) attempts.set(key, { count: 1, first: Date.now() });
      else a.count++;
    },
    reset(key: string) {
      attempts.delete(key);
    },
  };
}
