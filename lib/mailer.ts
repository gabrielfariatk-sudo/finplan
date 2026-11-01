import nodemailer from "nodemailer";

const configured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);

const transport = configured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

export async function sendResetEmail(to: string, name: string, link: string) {
  if (!transport) {
    // Sem SMTP configurado (desenvolvimento): mostra o link no terminal
    console.log(`\n[FinPlan] SMTP não configurado. Link de redefinição para ${to}:\n${link}\n`);
    return;
  }
  await transport.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject: "FinPlan: crie uma nova senha",
    text: `Olá, ${name}.\n\nPara criar uma nova senha, acesse o link abaixo (válido por 1 hora):\n${link}\n\nSe você não pediu isso, ignore este e-mail.`,
  });
}
