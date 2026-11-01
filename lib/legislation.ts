// Legislação de referência exibida em Configurações > Legislação.
// Para incluir outra lei, basta acrescentar um item neste array.
// Os textos são RESUMOS informativos, não substituem a leitura da lei nem orientação jurídica.

export type Law = {
  id: string;
  name: string; // nome popular
  number: string; // identificação oficial
  url: string; // texto oficial
  scope: string; // do que trata
  points: string[]; // pontos principais
  relation: string[]; // como se relaciona com o FinPlan
};

export const LAWS: Law[] = [
  {
    id: "lei-14181-2021",
    name: "Lei do Superendividamento",
    number: "Lei nº 14.181, de 1º de julho de 2021",
    url: "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14181.htm",
    scope:
      "Altera o Código de Defesa do Consumidor (Lei nº 8.078/1990) e o Estatuto do Idoso (Lei nº 10.741/2003) para melhorar as regras de crédito ao consumidor e criar meios de prevenir e tratar o superendividamento.",
    points: [
      "Superendividamento: situação em que a pessoa física, de boa-fé, não consegue pagar todas as suas dívidas de consumo (vencidas e a vencer) sem comprometer o mínimo existencial.",
      "Mínimo existencial: a renda que precisa ser preservada para as despesas básicas, como moradia, alimentação, saúde e educação. A lei deixou o valor para regulamento do Poder Executivo, e ele é discutido nos tribunais. Confira sempre o valor vigente (o Decreto nº 11.567/2023 fixou R$ 600,00).",
      "Crédito responsável: regras mais claras de informação e de oferta, com proibição de práticas abusivas ao conceder crédito, e a educação financeira como parte da proteção ao consumidor.",
      "Renegociação: o consumidor pode pedir uma audiência de conciliação com todos os credores e propor um plano de pagamento de até 5 anos, com a primeira parcela em até 180 dias.",
      "Sem acordo, o juiz pode impor um plano judicial. Depois de quitar o plano, só é possível pedir nova repactuação após 2 anos.",
      "Atinge apenas dívidas de consumo de pessoa física. Há proteção reforçada para a pessoa idosa.",
    ],
    relation: [
      "A categoria Necessidades da Base de Cálculo (gastos essenciais) lembra o conceito de mínimo existencial, mas o FinPlan não calcula nem declara superendividamento.",
      "O limite de 5 anos do plano de pagamento coincide com o fim do Médio Prazo padrão (60 meses). Dívidas com prazo acima do Curto Prazo recebem etiqueta e dica nas Previsões.",
      "Se você sente que suas dívidas comprometem o básico, procure o Procon, a Defensoria Pública ou os núcleos de conciliação do Judiciário.",
    ],
  },
];
