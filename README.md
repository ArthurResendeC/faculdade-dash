# Dashboard Preditivo de Absenteismo

Este projeto era um dashboard Streamlit em Python. Ele foi migrado para uma
aplicacao Next.js com TypeScript e nao depende mais de Python para rodar a
aplicacao.

A regra preditiva em TypeScript replica o padrao usado para gerar a base
sintetica original: distancia maior, turno noturno e alguns ajustes operacionais
elevam a probabilidade de falta. Os arquivos Python antigos continuam no projeto
como referencia de geracao/treino, mas nao sao usados pelo app Next.js.

## Como funciona

- `app/page.tsx`: Server Component que le `dados_absenteismo.csv` e passa o
  resumo para a interface.
- `app/dashboard-client.tsx`: orquestrador client-side de estado, API e
  historico local.
- `components/dashboard/*`: componentes pequenos da interface, estilizados com
  Tailwind CSS.
- `app/api/predict/route.ts`: endpoint `POST /api/predict`.
- `lib/prediction.ts`: preditor TypeScript compartilhado pela API.
- `lib/absenteeism-data.ts`: parser e agregador do CSV, com KPIs, risco por
  setor/turno e registros iniciais da tabela.
- `data/uce-overview.json`: resumo anonimizado gerado a partir das planilhas UCE
  locais.
- `scripts/generate-uce-overview.mjs`: gera novamente o resumo agregado a partir
  da pasta `planilhas/`.
- `treinar_modelo.py`: treina novamente o modelo a partir de
  `dados_absenteismo.csv` apenas para referencia historica.
- `gerador_dados.py`: gera a base sintetica usada no treino.
- O historico da tela inicia com registros do CSV e tambem salva novas analises
  no `localStorage` do navegador.

## O que o prototipo demonstra

- KPIs historicos derivados do CSV.
- Risco por setor e turno.
- Fatores criticos da analise preditiva.
- Estimativa de reserva tecnica diaria.
- Simulacao de impacto operacional e financeiro com referencias do projeto.
- Etapas CRISP-DM usadas como trilha metodologica.
- Possiveis integracoes futuras com ponto eletronico, ERP de RH, atestados,
  afastamentos e logs de producao.
- Diretrizes de LGPD para dados anonimizados e agregados.
- Dados reais agregados da UCE: base de ativos, horários contratuais, histórico
  de ponto, faltas, atestados, férias, horas extras, centros de custo e funções.

## Rodar localmente

Instale as dependencias JavaScript:

```bash
pnpm install
```

Inicie o Next.js:

```bash
pnpm dev
```

Abra `http://localhost:3000`.

## Deploy

Como o runtime agora e TypeScript/Node, o projeto pode ser publicado na Vercel
sem Python, `scikit-learn`, `.pkl` ou banco de dados. O CSV e lido no servidor
para popular a demonstracao inicial. Novas analises sem banco ficam restritas ao
navegador do usuario. Para historico compartilhado entre usuarios, use um banco
ou armazenamento persistente.

O Tailwind CSS esta configurado via `@tailwindcss/postcss`, seguindo o fluxo
oficial atual para Next.js.

As planilhas brutas ficam ignoradas pelo Git por conterem dados pessoais. O app
usa apenas `data/uce-overview.json`, que contem contagens e rankings agregados.
