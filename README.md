# FinPlan

> Seu futuro financeiro em boas mãos.

Aplicação web de planejamento financeiro pessoal. Você cadastra rendas e gastos, monta metas (caixinhas), planos de quitação de dívidas e uma reserva de emergência, e recebe análises e dicas calculadas por um motor de regras (orçamento 50/30/20, reserva, prazos).

**Tudo roda no seu computador.** O banco de dados é um arquivo SQLite local e nada é enviado para a nuvem.

## Funcionalidades

- Contas com login por usuário ou e-mail, senha criptografada e recuperação de senha por e-mail.
- **Planejamento:** categorias (Necessidade, Desejo ou Investimento), rendas, gastos fixos e variáveis.
- **Previsões:** reserva de emergência (com pausa e retomada), caixinhas, quitação de dívidas e dicas da API.
- **Dashboard:** indicadores, gráficos e filtros de período.
- **Configurações:** dados da conta (exige a senha atual), legislação de referência e **Base de Cálculo** editável (valores valem para todo o histórico ou a partir do mês seguinte).

A documentação completa (rotas, regras, validações e limitações) está em [`docs/FinPlan-Documentacao-da-API.pdf`](docs/FinPlan-Documentacao-da-API.pdf).

## Requisitos

- Node.js 22 ou superior
- npm

## Instalação

```bash
npm install
cp .env.example .env.local   # opcional: veja "Configuração"
```

## Uso diário no seu computador

```bash
npm run build   # só na primeira vez e depois de cada atualização do código
npm start       # abre em http://localhost:3000
```

O `npm start` aceita conexões **somente deste computador** (`127.0.0.1`). Para abrir de outros aparelhos da rede use `npm run start:rede`, mas só com HTTPS (veja "Segurança").

No Windows, o arquivo `iniciar-finplan.bat` faz isso sozinho. Para iniciar junto com o Windows, coloque um atalho dele na pasta `shell:startup`.

## Desenvolvimento

```bash
npm run dev     # http://localhost:3000, com recarga automática
npm run lint
```

> O build baixa as fontes Geist do Google, então precisa de internet nessa etapa.

## Configuração (`.env.local`)

Todas as variáveis são opcionais. Modelo em `.env.example`.

| Variável | Para que serve |
| --- | --- |
| `AUTH_SECRET` | Segredo que assina as sessões. **Defina um valor próprio** (`openssl rand -hex 32`). Se vazio, é gerado em `data/auth-secret.key`. |
| `DB_PATH` | Caminho do arquivo do banco. Útil para guardar os dados fora da pasta do código (ex.: `C:\FinPlanDados\finplan.db`). |
| `APP_URL` | Endereço usado no link do e-mail de recuperação de senha. |
| `COOKIE_SECURE` | `true` somente se o app for servido por HTTPS. |
| `SMTP_*` e `MAIL_FROM` | E-mail de recuperação de senha. Sem SMTP, o link aparece no terminal. |

## Backup dos dados

```bash
npm run backup:db                                   # salva em ./backups (mantém os 30 mais recentes)
npm run backup:db -- --dest "D:\Backups" --keep 60  # outra pasta e quantidade
```

O backup é seguro mesmo com o app rodando. **Para restaurar:** pare o app, copie o arquivo de backup por cima de `data/finplan.db` (ou do caminho de `DB_PATH`) e apague `finplan.db-wal` e `finplan.db-shm`, se existirem.

## Gerar uma cópia limpa (sem contas) para o GitHub

```bash
npm run copia:limpa -- "C:\Projetos\finplan-github"
```

A cópia não leva `node_modules`, `.next`, `data/` (banco e chave de sessão), `backups/`, `.git`, arquivos `.env` (exceto `.env.example`) nem arquivos `.db`.

## Atualizar uma instalação em uso

1. Faça um backup: `npm run backup:db`.
2. Atualize o código (`git pull` ou copie os arquivos novos).
3. `npm install`, depois `npm run build` e `npm start`.

Os dados não são afetados, porque ficam em `data/` (ou em `DB_PATH`), que não faz parte do código.

## Estrutura

```
app/            páginas e rotas da API (app/api)
components/     telas e peças visuais
lib/            banco, sessão, regras de negócio, validações e hooks
scripts/        backup do banco e cópia limpa
proxy.ts        controle de acesso (sem login, só Início e Login)
data/           banco e chave de sessão (criados sozinhos, NUNCA versionar)
```

## Segurança

- **Nunca** envie `data/`, `.env.local` ou arquivos `.db` para o GitHub. O `.gitignore` já os protege.
- Os dados não são criptografados no arquivo: quem tiver acesso ao computador ou ao banco consegue lê-los. Proteja a máquina e os backups.
- Trocar a senha não encerra sessões já abertas em outros navegadores, e não há verificação em duas etapas.
- Se for acessar de outros aparelhos da rede, use HTTPS (e `COOKIE_SECURE=true`).

## Aviso

As dicas e a aba Legislação são informativas e não substituem um profissional financeiro ou jurídico.

## Licença

A definir. Escolha uma licença antes de tornar o repositório público.
