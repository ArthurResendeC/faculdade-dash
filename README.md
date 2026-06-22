# Dashboard de Absenteismo Industrial

Este projeto e um prototipo de dashboard para ajudar RH e producao a enxergar
riscos de faltas de colaboradores em uma industria.

Em vez de mostrar apenas quem faltou, a ideia e mostrar indicadores, padroes e
alertas que ajudem a tomar decisoes antes que a ausencia vire um problema na
linha de producao.

## O que o sistema mostra

- Total de colaboradores da base.
- Quantidade de faltas registradas.
- Taxa historica de absenteismo.
- Setores e turnos com maior risco.
- Horas extras historicas.
- Atestados, ferias e registros de ponto.
- Ranking de centros de custo, funcoes e horarios.
- Simulacao de risco de falta para um colaborador.
- Fatores que aumentam o risco, como distancia e turno.
- Estimativa de impacto operacional e financeiro.
- Etapas da metodologia CRISP-DM usadas no projeto.
- Aviso de LGPD e uso de dados anonimizados.

## Como funciona

O projeto usa uma aplicacao web feita com Next.js, TypeScript e Tailwind CSS.

Ele nao precisa de Python, banco de dados, Supabase, Neon ou backend separado
para funcionar.

Os dados aparecem de duas formas:

1. `dados_absenteismo.csv`
   - Base sintetica usada para demonstrar o funcionamento do modelo preditivo.

2. `data/uce-overview.json`
   - Resumo anonimo gerado a partir das planilhas reais da UCE.
   - Esse arquivo tem apenas contagens e rankings.
   - Ele nao guarda nome, endereco, e-mail, CPF ou dados sensiveis.

As planilhas originais ficam fora do Git porque podem conter dados pessoais.

## Como rodar no computador

Voce precisa ter Node.js e pnpm instalados.

Instale as dependencias:

```bash
pnpm install
```

Rode o projeto:

```bash
pnpm dev
```

Abra no navegador:

```text
http://localhost:3000
```

Se a porta 3000 estiver ocupada, o Next.js pode abrir em outra porta, como:

```text
http://localhost:3001
```

## Como atualizar os dados das planilhas

Coloque os arquivos dentro da pasta `planilhas/` com estes nomes:

```text
planilhas/Base Ativos UCE.csv
planilhas/Horário de trabalho contratual.xlsx
planilhas/Planilha_Historico_Ponto_UCE.xlsx
```

Depois rode:

```bash
node scripts/generate-uce-overview.mjs
```

Isso recria o arquivo:

```text
data/uce-overview.json
```

Esse JSON e o que o dashboard usa. As planilhas completas continuam fora do Git.

## Como testar se esta tudo certo

Verifique os tipos do TypeScript:

```bash
pnpm typecheck
```

Gere uma build de producao:

```bash
pnpm build
```

Se os dois comandos passarem, o projeto esta pronto para rodar localmente ou ser
publicado.

## Deploy

O projeto pode ser publicado na Vercel.

Ele funciona bem na Vercel porque:

- usa Next.js;
- usa TypeScript;
- nao depende de Python;
- nao precisa de banco de dados;
- nao precisa das planilhas brutas no servidor;
- usa apenas arquivos estaticos e uma API simples do proprio Next.js.

## Limites do prototipo

Este projeto e um prototipo academico.

O historico de novas analises fica salvo apenas no navegador da pessoa que esta
usando o sistema. Se abrir em outro computador, esse historico nao aparece.

Para virar um sistema real de empresa, seria necessario adicionar:

- login de usuarios;
- banco de dados;
- integracao automatica com ponto eletronico;
- integracao com RH/ERP;
- politicas formais de LGPD;
- validacao estatistica de modelo preditivo em dados reais.

## Principais arquivos

- `app/page.tsx`: carrega os dados do dashboard.
- `app/dashboard-client.tsx`: controla a interacao da tela.
- `components/dashboard/`: componentes visuais do dashboard.
- `app/api/predict/route.ts`: API que calcula o risco.
- `lib/prediction.ts`: regra de predicao em TypeScript.
- `lib/absenteeism-data.ts`: junta os dados do CSV e do JSON agregado.
- `data/uce-overview.json`: resumo anonimo das planilhas.
- `scripts/generate-uce-overview.mjs`: recria o resumo das planilhas.
