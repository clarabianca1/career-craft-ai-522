# Match & Craft

# Prompt único para o Lovable

Crie do zero um aplicativo web SaaS completo, moderno e responsivo de **matchmaking entre candidatos e vagas de emprego**, com geração automática de **currículos personalizados e ATS-friendly para cada vaga**.

O aplicativo deve ser construído **100% dentro do Lovable**, com frontend, backend, banco de dados, autenticação e integrações necessários para que o produto funcione de ponta a ponta.

## 1. Conceito do produto

O produto deve funcionar como um "job matching + currículo inteligente".

O usuário cadastra seu perfil profissional e seu currículo uma única vez. A plataforma analisa:

- experiência profissional;

- cargos anteriores;

- habilidades;

- competências técnicas;

- competências comportamentais;

- formação;

- certificações;

- idiomas;

- localização;

- pretensão salarial;

- senioridade;

- preferências profissionais.

A plataforma então compara esse perfil com vagas de emprego e calcula um **Match Score** para cada vaga.

Ao selecionar uma vaga, o sistema deve analisar a descrição da vaga e gerar uma versão personalizada do currículo do usuário, otimizada para:

1. refletir fielmente a experiência real do candidato;

2. destacar experiências relevantes para aquela vaga;

3. utilizar palavras-chave presentes na descrição da vaga quando forem verdadeiras e compatíveis com o perfil;

4. melhorar a compatibilidade com sistemas ATS;

5. manter o currículo profissional, claro e natural;

6. nunca inventar experiências, cargos, resultados, habilidades, certificações ou informações.

O objetivo não é criar um currículo "enganoso", mas apresentar melhor e de forma mais estratégica as experiências que o usuário realmente possui.

---

# 2. Identidade visual

Use **shadcn/ui** como biblioteca principal de componentes e construa uma interface premium, elegante e minimalista.

### Cores principais

- Dourado: `#D3AF37`

- Borgonha: `#4A0404`

### Cores auxiliares

- Background principal: `#FAF9F6`

- Branco: `#FFFFFF`

- Texto principal: `#1F1F1F`

- Texto secundário: `#6B6B6B`

- Bordas: `#E5E0D8`

- Verde para sucesso: `#2E7D32`

- Vermelho para alertas: `#B3261E`

O **borgonha `#4A0404`** deve ser a cor de maior presença em elementos estruturais importantes.

O **dourado `#D3AF37`** deve ser usado como cor de destaque premium, CTAs importantes, indicadores de match, ícones selecionados e detalhes de interface.

Evite excesso de dourado.

A interface deve transmitir:

- sofisticação;

- confiança;

- tecnologia;

- empregabilidade;

- inteligência artificial;

- profissionalismo.

Não utilizar aparência genérica de dashboard administrativo.

---

# 3. Stack

Utilize:

- React + TypeScript;

- Vite;

- Tailwind CSS;

- shadcn/ui;

- Lucide Icons;

- Supabase para autenticação, banco de dados e storage;

- arquitetura preparada para integração com APIs de IA;

- componentes reutilizáveis;

- código organizado e escalável.

Priorize componentes shadcn/ui para:

- Button;

- Card;

- Input;

- Textarea;

- Select;

- Dialog;

- Dropdown Menu;

- Tabs;

- Badge;

- Progress;

- Avatar;

- Sheet;

- Accordion;

- Alert;

- Tooltip;

- Table;

- Checkbox;

- Radio Group;

- Separator;

- Skeleton;

- Toast/Sonner.

---

# 4. Estrutura principal do aplicativo

Crie as seguintes áreas:

## Landing Page

Criar uma página inicial premium explicando o produto.

Hero:

**"Seu currículo. A vaga certa. Um match mais inteligente."**

Subheadline:

**"Encontre vagas compatíveis com seu perfil e crie currículos personalizados para cada oportunidade — sem inventar experiências."**

CTAs:

- "Criar meu perfil"

- "Como funciona"

Mostrar uma demonstração visual de:

Perfil → Match com vaga → Análise da vaga → Currículo personalizado → Aplicação

Adicionar seção:

### Como funciona

1. Crie seu perfil profissional

2. Encontre vagas compatíveis

3. Veja seu Match Score

4. Personalize seu currículo

5. Baixe e candidate-se

Adicionar seção de benefícios:

- Match inteligente;

- Currículos personalizados;

- Otimização ATS;

- Análise de palavras-chave;

- Histórico de currículos;

- Organização das candidaturas.

Adicionar seção explicando que a IA **não inventa informações profissionais**.

---

# 5. Autenticação

Criar:

- Login;

- Cadastro;

- Recuperação de senha;

- Logout;

- Proteção de rotas;

- Persistência da sessão.

Após o primeiro cadastro, direcionar o usuário para um onboarding.

---

# 6. Onboarding

Criar um fluxo visual em etapas com barra de progresso.

### Etapa 1 — Informações pessoais

Campos:

- nome;

- email;

- telefone;

- cidade;

- estado;

- LinkedIn;

- portfólio;

- GitHub;

- site pessoal.

Não tornar todos os campos obrigatórios.

### Etapa 2 — Objetivo profissional

Campos:

- cargo desejado;

- área profissional;

- senioridade;

- localização desejada;

- modelo de trabalho:

  - remoto;

  - híbrido;

  - presencial;

- disponibilidade;

- pretensão salarial.

### Etapa 3 — Experiência

Permitir adicionar múltiplas experiências.

Cada experiência deve possuir:

- empresa;

- cargo;

- data inicial;

- data final;

- localização;

- descrição;

- principais responsabilidades;

- conquistas/resultados;

- tecnologias/habilidades utilizadas.

Permitir editar, excluir e reordenar experiências.

### Etapa 4 — Formação

Campos:

- instituição;

- curso;

- grau;

- início;

- conclusão.

Permitir múltiplos registros.

### Etapa 5 — Habilidades

Separar em:

**Hard Skills**

e

**Soft Skills**

Permitir adicionar/remover habilidades.

### Etapa 6 — Idiomas

Campos:

- idioma;

- nível.

### Etapa 7 — Currículo

Permitir:

- upload de PDF;

- upload de DOCX;

- colar currículo em texto;

- criar currículo manualmente.

O sistema deve extrair o conteúdo do currículo e permitir que o usuário revise os dados antes de salvar.

---

# 7. Dashboard

Após o onboarding, criar um dashboard elegante.

Mostrar:

### Card "Seu perfil"

- percentual de completude;

- cargo-alvo;

- senioridade;

- principais skills.

### Card "Seu Match"

Mostrar quantidade de vagas compatíveis.

Exemplo:

**24 vagas encontradas**

### Card "Currículos"

Mostrar:

**8 currículos personalizados**

### Card "Candidaturas"

Mostrar:

- salvas;

- aplicadas;

- entrevistas;

- rejeitadas.

Criar gráfico simples mostrando evolução das candidaturas.

---

# 8. Página de vagas

Criar página **"Encontrar vagas"**.

Layout:

- filtros na lateral;

- lista de vagas no centro;

- painel de detalhes ao selecionar uma vaga.

Filtros:

- cargo;

- palavra-chave;

- localização;

- remoto/híbrido/presencial;

- senioridade;

- salário;

- empresa;

- data de publicação;

- Match Score mínimo.

Cada vaga deve aparecer em um card contendo:

- cargo;

- empresa;

- localização;

- modelo de trabalho;

- faixa salarial, quando disponível;

- data da publicação;

- Match Score.

Exemplo:

**87% Match**

Usar um indicador visual circular ou progress bar.

Classificar o match em faixas apenas como informação visual, sem afirmar que determinada vaga é "garantida":

- 80–100%: alta compatibilidade

- 60–79%: compatibilidade moderada

- abaixo de 60%: baixa compatibilidade

---

# 9. Algoritmo de Match

Criar uma arquitetura de matchmaking.

O score deve considerar, por exemplo:

- skills relevantes;

- experiência;

- senioridade;

- cargo;

- formação;

- localização;

- modelo de trabalho;

- requisitos explícitos da vaga.

Mostrar ao usuário **por que ele recebeu determinado score**.

Exemplo:

### Seu Match — 87%

**Pontos de compatibilidade**

✓ 8 de 10 habilidades principais  

✓ Senioridade compatível  

✓ Experiência semelhante à exigida  

✓ Localização compatível  

**Pontos de atenção**

! A vaga solicita experiência com uma tecnologia que não aparece no seu perfil.

Nunca afirmar que o candidato conseguirá a vaga.

O score deve ser tratado como uma estimativa de compatibilidade baseada nas informações disponíveis.

---

# 10. Página de detalhes da vaga

Ao abrir uma vaga, mostrar:

### Informações da vaga

- cargo;

- empresa;

- localização;

- modelo;

- salário;

- data;

- descrição completa;

- requisitos;

- responsabilidades;

- benefícios, quando disponíveis.

### Seu Match

Mostrar o Match Score.

Criar abas:

**Resumo | Compatibilidade | Palavras-chave | Currículo**

---

# 11. Análise da vaga

Criar uma análise inteligente da descrição.

Mostrar:

### Skills encontradas

Separar em:

- técnicas;

- comportamentais;

- ferramentas;

- idiomas;

- formação;

- experiência.

### Palavras-chave importantes

Mostrar tags.

Exemplo:

`Python` `SQL` `Power BI` `Data Analysis`

### Requisitos que você possui

Lista dos requisitos presentes no perfil.

### Requisitos ausentes

Lista dos requisitos que não aparecem no perfil.

Importante:

Não tratar uma informação ausente como prova de que o usuário não possui aquela habilidade.

Usar linguagem como:

**"Não encontramos essa informação no seu perfil."**

---

# 12. Gerador de currículo ATS

Criar uma funcionalidade chamada:

**"Criar currículo para esta vaga"**

Ao clicar:

Abrir uma tela de análise antes da geração.

Mostrar:

### O que será personalizado

- título profissional;

- resumo profissional;

- ordem das experiências;

- descrição das experiências;

- palavras-chave relevantes;

- habilidades;

- organização do currículo.

### Regra fundamental

A IA deve:

- utilizar somente informações fornecidas pelo usuário;

- não inventar experiências;

- não criar empresas;

- não inventar cargos;

- não inventar certificações;

- não inventar números;

- não inventar resultados;

- não adicionar tecnologias que o usuário não declarou possuir.

Se uma palavra-chave da vaga não estiver comprovadamente presente no perfil, não adicioná-la como experiência ou habilidade.

---

# 13. Editor de currículo

Criar um editor dividido em duas áreas:

### Esquerda

Editor de conteúdo.

Seções:

- informações pessoais;

- título;

- resumo;

- experiência;

- formação;

- habilidades;

- idiomas;

- certificações;

- projetos;

- links.

Permitir editar tudo manualmente.

### Direita

Preview em tempo real do currículo.

O preview deve parecer um currículo profissional real.

Criar templates:

1. Classic ATS

2. Modern ATS

3. Executive ATS

Todos devem priorizar:

- texto;

- hierarquia clara;

- headings convencionais;

- layout simples;

- boa legibilidade;

- ausência de elementos que prejudiquem parsing de ATS.

Evitar:

- excesso de colunas;

- barras gráficas de habilidades;

- ícones substituindo texto;

- informações dentro de imagens;

- elementos decorativos desnecessários.

---

# 14. ATS Scanner

Criar uma funcionalidade:

**"Verificar compatibilidade ATS"**

Depois de gerar o currículo, analisar:

- presença das principais palavras-chave;

- correspondência entre currículo e vaga;

- estrutura;

- títulos das seções;

- legibilidade;

- informações de contato;

- possíveis problemas de parsing;

- excesso de elementos gráficos;

- ausência de informações relevantes.

Mostrar:

### ATS Check

**Estrutura**

✓ OK

**Palavras-chave**

✓ Boa cobertura

**Experiência relevante**

✓ Encontrada

**Informações de contato**

✓ OK

**Formato**

✓ ATS-friendly

Mostrar também:

### Oportunidades de melhoria

Lista objetiva de sugestões.

Não prometer que o currículo será aprovado por nenhum ATS específico.

---

# 15. Explicação das alterações

Após gerar o currículo, mostrar:

**"O que foi alterado para esta vaga?"**

Exemplo:

- resumo profissional ajustado;

- experiência mais relevante colocada em destaque;

- palavras-chave da vaga incorporadas quando compatíveis com seu perfil;

- habilidades relevantes reorganizadas.

Criar opção:

**"Ver versão original"**

e

**"Ver versão personalizada"**

---

# 16. Download

Permitir exportar o currículo em:

- PDF;

- DOCX.

O PDF deve ser profissional e adequado para candidatura.

Nome sugerido:

`Nome_Sobrenome_Curriculo_Empresa_Cargo.pdf`

---

# 17. Histórico

Criar página:

**"Meus currículos"**

Mostrar todos os currículos criados.

Cada item deve apresentar:

- vaga;

- empresa;

- data;

- versão;

- status;

- ações.

Ações:

- visualizar;

- editar;

- duplicar;

- baixar;

- excluir.

---

# 18. Rastreador de candidaturas

Criar uma área:

**"Minhas candidaturas"**

Visualização em Kanban:

### Salvas

### Aplicadas

### Entrevista

### Oferta

### Encerradas

Permitir arrastar cards entre etapas.

Cada candidatura deve guardar:

- vaga;

- empresa;

- currículo utilizado;

- data da candidatura;

- observações;

- status;

- link da vaga.

---

# 19. Banco de dados Supabase

Criar estrutura de banco organizada.

Principais tabelas:

### users/profiles

- id

- name

- email

- phone

- city

- state

- linkedin

- portfolio

- github

- target_role

- seniority

- work_model

- desired_location

- salary_expectation

- profile_completion

- created_at

- updated_at

### experiences

- id

- user_id

- company

- position

- location

- start_date

- end_date

- description

- achievements

- skills

- created_at

### education

- id

- user_id

- institution

- course

- degree

- start_date

- end_date

### skills

- id

- user_id

- name

- type

### languages

- id

- user_id

- language

- level

### resumes

- id

- user_id

- title

- target_job_id

- content

- template

- ats_score

- created_at

- updated_at

### jobs

- id

- title

- company

- location

- work_model

- salary_min

- salary_max

- description

- requirements

- responsibilities

- source

- source_url

- published_at

- created_at

### job_matches

- id

- user_id

- job_id

- match_score

- matching_skills

- missing_information

- analysis

- created_at

### applications

- id

- user_id

- job_id

- resume_id

- status

- applied_at

- notes

- created_at

- updated_at

---

# 20. Segurança

Implementar:

- Row Level Security no Supabase;

- usuários só podem acessar seus próprios dados;

- proteção das rotas;

- validação dos inputs;

- tratamento de erros;

- loading states;

- empty states;

- mensagens de erro amigáveis.

Nunca expor chaves privadas ou secrets no frontend.

---

# 21. IA

Estruturar o aplicativo para utilizar uma API de LLM através de backend/Edge Functions.

Criar funções separadas para:

### analyzeJob()

Analisa a descrição da vaga.

### calculateMatch()

Compara perfil e vaga.

### customizeResume()

Gera currículo personalizado.

### analyzeATS()

Avalia compatibilidade estrutural e palavras-chave.

### explainChanges()

Explica as alterações realizadas.

As respostas da IA devem seguir JSON estruturado quando apropriado, para facilitar a integração com a interface.

---

# 22. Prompt interno da IA

Criar uma camada de instruções para a IA com estas regras:

"Você é um especialista em recrutamento, currículos e sistemas ATS.

Seu objetivo é ajudar o candidato a apresentar sua experiência real da forma mais relevante possível para determinada vaga.

Você deve analisar o currículo do candidato e a descrição da vaga.

Nunca invente informações.

Nunca atribua ao candidato uma habilidade, experiência, certificação, cargo, empresa, resultado ou tecnologia que não esteja presente ou claramente sustentada pelas informações fornecidas.

Você pode reorganizar, resumir, melhorar a redação e destacar informações existentes.

Você pode utilizar palavras-chave da vaga somente quando elas forem verdadeiramente compatíveis com a experiência ou informações fornecidas pelo candidato.

Quando uma informação não estiver presente, indique que ela não foi encontrada.

O currículo final deve ser profissional, claro, objetivo e ATS-friendly.

Não utilize linguagem exagerada ou promessas de contratação."

---

# 23. UX

Criar uma experiência extremamente simples.

O usuário deve sempre saber:

**Onde estou → o que devo fazer → qual será o próximo passo.**

Usar:

- breadcrumbs;

- progress indicators;

- skeleton loading;

- empty states;

- tooltips;

- confirmações;

- feedback visual.

Evitar telas excessivamente carregadas.

---

# 24. Responsividade

O aplicativo deve funcionar perfeitamente em:

- desktop;

- tablet;

- celular.

No mobile:

- sidebar deve virar menu;

- cards devem ocupar largura total;

- editor de currículo deve adaptar o preview;

- filtros de vagas devem abrir em Sheet/Drawer;

- Kanban deve ser utilizável em telas pequenas.

---

# 25. Navegação

Criar sidebar com:

- Dashboard

- Encontrar vagas

- Minhas candidaturas

- Meus currículos

- Meu perfil

- Configurações

Header:

- avatar;

- nome;

- notificações;

- menu da conta.

---

# 26. Estados vazios

Criar estados vazios bem desenhados.

Exemplo:

### Ainda não há currículos personalizados

"Escolha uma vaga compatível e crie seu primeiro currículo personalizado."

Botão:

**Encontrar vagas**

---

# 27. Dados demonstrativos

Para que o aplicativo fique visualmente completo durante o desenvolvimento, criar dados mockados apenas para demonstração.

Exemplo de vagas:

- Engenheiro de Processos

- Analista de Dados

- Product Manager

- Desenvolvedor Full Stack

- Analista de BI

Criar perfis e matches fictícios apenas quando necessário para demonstrar a interface.

Deixar claramente separado do banco real.

---

# 28. Dashboard visual

Criar uma experiência premium semelhante a um produto SaaS moderno.

Usar:

- cards com bordas suaves;

- sombras discretas;

- cantos arredondados;

- bastante espaço em branco;

- tipografia elegante;

- pequenos detalhes dourados;

- elementos borgonha;

- gráficos minimalistas.

O Match Score deve ser um dos elementos visuais mais importantes da interface.

---

# 29. Microinterações

Adicionar animações sutis:

- hover;

- transições;

- progress animation;

- geração de currículo;

- análise da vaga;

- loading da IA.

Durante a geração do currículo, mostrar uma tela de processamento:

**Analisando a vaga...**

**Comparando seu perfil...**

**Selecionando experiências relevantes...**

**Otimizando seu currículo...**

**Executando verificação ATS...**

**Currículo pronto.**

---

# 30. Página de configurações

Criar:

- informações da conta;

- preferências profissionais;

- preferências de vagas;

- privacidade;

- notificações;

- excluir conta.

---

# 31. Landing page + produto

A landing page deve funcionar independentemente do dashboard.

Usuários não autenticados devem visualizar a landing page.

Usuários autenticados devem acessar o dashboard.

Rotas sugeridas:

`/`

`/login`

`/signup`

`/onboarding`

`/dashboard`

`/jobs`

`/jobs/:id`

`/resumes`

`/resumes/:id`

`/applications`

`/profile`

`/settings`

---

# 32. Qualidade do código

Não criar um protótipo superficial.

Construir uma base de produto SaaS real.

Requisitos:

- TypeScript tipado;

- componentes reutilizáveis;

- evitar código duplicado;

- separar lógica de negócio da apresentação;

- tratamento de erros;

- estados de loading;

- estados vazios;

- validação de formulários;

- arquitetura preparada para crescimento;

- acessibilidade;

- boa semântica HTML;

- responsive design;

- SEO básico na landing page.

---

# 33. Prioridade de desenvolvimento

Implemente nesta ordem:

1. Estrutura visual e design system com shadcn/ui

2. Landing page

3. Autenticação

4. Onboarding

5. Perfil profissional

6. Banco de dados Supabase

7. Dashboard

8. Sistema de vagas

9. Match Score

10. Página de análise da vaga

11. Gerador de currículo

12. Editor de currículo

13. ATS Scanner

14. Exportação PDF/DOCX

15. Histórico de currículos

16. Rastreador de candidaturas

17. Configurações

18. Responsividade

19. Tratamento completo de erros e estados

20. Polimento final da UX

---

# 34. Regra importante sobre integrações de vagas

Não invente integrações ou APIs de vagas.

Estruture o sistema para aceitar diferentes fontes de vagas através de uma camada de abstração.

Cada vaga deve armazenar sua origem:

- `source`

- `source_url`

Inicialmente, utilize dados mockados para desenvolver a experiência se nenhuma API de vagas estiver configurada.

Deixe a arquitetura preparada para posteriormente conectar APIs externas de empregos.

---

# 35. Regra importante sobre IA

Não colocar uma API key diretamente no frontend.

A comunicação com o provedor de IA deve acontecer através de backend/Edge Functions ou mecanismo seguro equivalente.

Criar uma estrutura que permita substituir o provedor de IA futuramente sem reescrever todo o aplicativo.

---

# 36. Resultado esperado

Ao finalizar, quero ter um aplicativo funcional no qual um novo usuário consiga:

1. criar uma conta;

2. preencher seu perfil profissional;

3. adicionar experiências, formação e skills;

4. inserir/importar seu currículo;

5. visualizar vagas;

6. receber um Match Score;

7. abrir uma vaga;

8. entender por que existe aquele match;

9. analisar os requisitos da vaga;

10. gerar um currículo personalizado;

11. editar o currículo;

12. executar uma análise ATS;

13. visualizar o currículo em formato profissional;

14. baixar o currículo;

15. salvar a vaga;

16. registrar a candidatura;

17. acompanhar o processo no Kanban;

18. acessar seus currículos posteriormente.

Construa o produto com aparência de um **SaaS premium de carreira**, usando **shadcn/ui**, **borgonha `#4A0404` + dourado `#D3AF37`**, interface limpa e sofisticada, excelente experiência mobile e desktop e arquitetura preparada para escalar.

**Não entregue apenas telas estáticas. Implemente a lógica funcional, banco de dados, autenticação, estados da aplicação e fluxos principais do produto.**

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fcb0f482-8afa-4274-bf37-71749b6c092b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
