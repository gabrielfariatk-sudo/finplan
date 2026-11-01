// Gera uma CÓPIA LIMPA do projeto (sem contas, sem segredos, sem pastas pesadas),
// pronta para subir no GitHub.
//
//   npm run copia:limpa -- "C:\Projetos\finplan-github"
//
// Fica de fora: node_modules, .next, data (banco e chave de sessão), backups, .git,
// arquivos .env (exceto .env.example), qualquer .db e chaves (.pem).
import fs from "node:fs";
import path from "node:path";

const target = process.argv[2];
if (!target) {
  console.error('Informe a pasta de destino. Ex.: npm run copia:limpa -- "C:\\Projetos\\finplan-github"');
  process.exit(1);
}

const src = process.cwd();
const out = path.resolve(target);

if (out === src || out.startsWith(src + path.sep)) {
  console.error("O destino não pode ficar dentro da pasta do projeto.");
  process.exit(1);
}
if (fs.existsSync(out) && fs.readdirSync(out).length > 0) {
  console.error(`A pasta de destino já tem arquivos: ${out}\nEscolha uma pasta nova ou vazia.`);
  process.exit(1);
}

const ROOT_ONLY = new Set(["data", "backups", ".git", ".next", "out", "build", "coverage", ".vercel"]);
const SENSITIVE_FILE = [
  /^\.env(\..+)?$/, // .env, .env.local... (o .env.example é liberado abaixo)
  /\.db(-wal|-shm|-journal)?$/i,
  /auth-secret\.key$/i,
  /\.pem$/i,
  /\.tsbuildinfo$/,
  /^next-env\.d\.ts$/,
  /^\.DS_Store$/,
  /^npm-debug\.log/,
];

const skipped = new Map(); // motivo -> quantidade
const skip = (why) => skipped.set(why, (skipped.get(why) ?? 0) + 1);

function filter(srcPath) {
  const rel = path.relative(src, srcPath);
  if (!rel) return true;
  const parts = rel.split(path.sep);
  const name = parts.at(-1);
  if (parts.includes("node_modules")) return name === "node_modules" ? (skip("node_modules"), false) : false;
  if (parts.length === 1 && ROOT_ONLY.has(name)) return skip(name), false;
  if (name === ".env.example") return true;
  if (SENSITIVE_FILE.some((re) => re.test(name))) return skip(`arquivo sensível/gerado (${name})`), false;
  return true;
}

fs.cpSync(src, out, { recursive: true, filter });

// Verificação final: nada sensível pode ter ido junto
const problems = [];
let files = 0;
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      const atRoot = dir === out; // app/api/data é código; só a data/ da RAIZ guarda o banco
      if (e.name === "node_modules" || (atRoot && ROOT_ONLY.has(e.name))) problems.push(p);
      else walk(p);
    } else {
      files++;
      if (e.name !== ".env.example" && SENSITIVE_FILE.some((re) => re.test(e.name))) problems.push(p);
    }
  }
})(out);

const gi = fs.existsSync(path.join(out, ".gitignore")) ? fs.readFileSync(path.join(out, ".gitignore"), "utf8") : "";
if (!/^\/data\/?\s*$/m.test(gi)) problems.push(".gitignore sem a linha /data/");
if (!/^!\.env\.example\s*$/m.test(gi)) problems.push(".gitignore sem a linha !.env.example");
if (!fs.existsSync(path.join(out, ".env.example"))) problems.push(".env.example ausente");

if (problems.length) {
  console.error("ATENÇÃO: a cópia não está limpa:\n - " + problems.join("\n - "));
  process.exit(1);
}

console.log(`Cópia limpa criada em: ${out}`);
console.log(`${files} arquivos copiados. Deixado de fora:`);
for (const [why, n] of skipped) console.log(`  - ${why}${n > 1 ? ` (${n})` : ""}`);
console.log(`
Próximos passos:
  cd "${out}"
  git init
  git add .
  git status          (confira: não pode aparecer data/, .env.local nem arquivos .db)
  git commit -m "FinPlan: versão inicial"
  git branch -M main
  git remote add origin https://github.com/SEU-USUARIO/finplan.git
  git push -u origin main
`);
