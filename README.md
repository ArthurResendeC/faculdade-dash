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
- `app/dashboard-client.tsx`: interface React interativa do dashboard.
- `app/api/predict/route.ts`: endpoint `POST /api/predict`.
- `lib/prediction.ts`: preditor TypeScript compartilhado pela API.
- `lib/absenteeism-data.ts`: parser e agregador do CSV, com KPIs, risco por
  setor/turno e registros iniciais da tabela.
- `treinar_modelo.py`: treina novamente o modelo a partir de
  `dados_absenteismo.csv` apenas para referencia historica.
- `gerador_dados.py`: gera a base sintetica usada no treino.
- O historico da tela inicia com registros do CSV e tambem salva novas analises
  no `localStorage` do navegador.

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
