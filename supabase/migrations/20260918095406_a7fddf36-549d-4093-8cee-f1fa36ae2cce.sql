
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  state TEXT,
  linkedin TEXT,
  portfolio TEXT,
  github TEXT,
  website TEXT,
  target_role TEXT,
  professional_area TEXT,
  seniority TEXT,
  work_model TEXT,
  desired_location TEXT,
  availability TEXT,
  salary_expectation TEXT,
  summary TEXT,
  resume_text TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  profile_completion INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  location TEXT,
  start_date TEXT,
  end_date TEXT,
  current BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  responsibilities TEXT,
  achievements TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experiences TO authenticated;
GRANT ALL ON public.experiences TO service_role;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own experiences" ON public.experiences FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  institution TEXT NOT NULL,
  course TEXT,
  degree TEXT,
  start_date TEXT,
  end_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.education TO authenticated;
GRANT ALL ON public.education TO service_role;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own education" ON public.education FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'hard',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skills TO authenticated;
GRANT ALL ON public.skills TO service_role;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own skills" ON public.skills FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  language TEXT NOT NULL,
  level TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.languages TO authenticated;
GRANT ALL ON public.languages TO service_role;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own languages" ON public.languages FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT,
  year TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certifications TO authenticated;
GRANT ALL ON public.certifications TO service_role;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own certifications" ON public.certifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  work_model TEXT,
  seniority TEXT,
  area TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  description TEXT,
  requirements TEXT[] NOT NULL DEFAULT '{}',
  responsibilities TEXT[] NOT NULL DEFAULT '{}',
  benefits TEXT[] NOT NULL DEFAULT '{}',
  keywords TEXT[] NOT NULL DEFAULT '{}',
  source TEXT NOT NULL DEFAULT 'demo',
  source_url TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.jobs TO anon;
GRANT SELECT ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jobs are public" ON public.jobs FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.job_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs ON DELETE CASCADE,
  match_score INTEGER NOT NULL DEFAULT 0,
  matching_skills TEXT[] NOT NULL DEFAULT '{}',
  missing_information TEXT[] NOT NULL DEFAULT '{}',
  analysis JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, job_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_matches TO authenticated;
GRANT ALL ON public.job_matches TO service_role;
ALTER TABLE public.job_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own matches" ON public.job_matches FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_job_id UUID REFERENCES public.jobs ON DELETE SET NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  template TEXT NOT NULL DEFAULT 'classic',
  ats_score INTEGER,
  ats_analysis JSONB,
  changes JSONB,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resumes TO authenticated;
GRANT ALL ON public.resumes TO service_role;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own resumes" ON public.resumes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER resumes_updated_at BEFORE UPDATE ON public.resumes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs ON DELETE SET NULL,
  resume_id UUID REFERENCES public.resumes ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'saved',
  applied_at TIMESTAMPTZ,
  notes TEXT,
  job_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own applications" ON public.applications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.jobs (title, company, location, work_model, seniority, area, salary_min, salary_max, description, requirements, responsibilities, benefits, keywords, source, source_url, published_at) VALUES
('Engenheiro de Processos', 'Indústria Nova Vale', 'Belo Horizonte, MG', 'hibrido', 'senior', 'Engenharia', 12000, 16000,
 'Buscamos Engenheiro de Processos para liderar iniciativas de melhoria contínua em planta industrial, com foco em produtividade, redução de perdas e padronização.',
 ARRAY['Graduação em Engenharia','Experiência com Lean Manufacturing','Six Sigma','Análise de dados com Excel avançado','Power BI','Inglês intermediário'],
 ARRAY['Mapear e redesenhar processos produtivos','Conduzir projetos de melhoria contínua','Definir indicadores de produtividade','Treinar equipes operacionais'],
 ARRAY['Plano de saúde','Vale alimentação','PLR'],
 ARRAY['Lean','Six Sigma','Power BI','Melhoria Contínua','PDCA','Excel'], 'demo', 'https://exemplo.com/vagas/eng-processos', now() - interval '2 days'),
('Analista de Dados', 'Fintech Clarity', 'São Paulo, SP', 'remoto', 'pleno', 'Dados', 8000, 11000,
 'Procuramos Analista de Dados para transformar dados em decisões: construção de dashboards, análises exploratórias e apoio às áreas de negócio.',
 ARRAY['SQL avançado','Python para análise de dados','Power BI ou Looker','Estatística aplicada','Comunicação com áreas de negócio'],
 ARRAY['Construir e manter dashboards','Realizar análises exploratórias','Documentar métricas e indicadores','Apoiar times de produto e marketing'],
 ARRAY['Trabalho remoto','Auxílio home office','Day off no aniversário'],
 ARRAY['SQL','Python','Power BI','Data Analysis','ETL','Estatística'], 'demo', 'https://exemplo.com/vagas/analista-dados', now() - interval '5 days'),
('Product Manager', 'Orbita Software', 'Remoto, Brasil', 'remoto', 'senior', 'Produto', 15000, 20000,
 'Product Manager responsável por descoberta, priorização e entrega de valor em um produto B2B SaaS de alto crescimento.',
 ARRAY['Experiência em produtos digitais B2B','Discovery e entrevistas com usuários','Métricas de produto','Roadmap e priorização','Inglês avançado'],
 ARRAY['Conduzir descoberta contínua','Definir e comunicar roadmap','Trabalhar junto a design e engenharia','Acompanhar métricas de adoção'],
 ARRAY['Stock options','Plano de saúde','Budget de estudos'],
 ARRAY['Product Discovery','Roadmap','OKR','Analytics','SaaS','B2B'], 'demo', 'https://exemplo.com/vagas/product-manager', now() - interval '1 day'),
('Desenvolvedor Full Stack', 'Camada Digital', 'Curitiba, PR', 'presencial', 'pleno', 'Tecnologia', 9000, 13000,
 'Desenvolvedor Full Stack para atuar em produtos web com React no frontend e Node.js no backend, em time multidisciplinar.',
 ARRAY['React e TypeScript','Node.js','PostgreSQL','APIs REST','Testes automatizados','Git'],
 ARRAY['Desenvolver features ponta a ponta','Participar de code reviews','Escrever testes','Colaborar com produto e design'],
 ARRAY['Vale transporte','Plano odontológico','Horário flexível'],
 ARRAY['React','TypeScript','Node.js','PostgreSQL','REST','Testes'], 'demo', 'https://exemplo.com/vagas/full-stack', now() - interval '9 days'),
('Analista de BI', 'Rede Sul Varejo', 'Porto Alegre, RS', 'hibrido', 'junior', 'Dados', 5000, 7000,
 'Analista de BI para apoiar áreas comerciais com relatórios, indicadores e automação de rotinas de dados.',
 ARRAY['SQL','Power BI','Excel avançado','Modelagem de dados','Organização e atenção a detalhes'],
 ARRAY['Criar relatórios e painéis','Automatizar rotinas de extração','Validar qualidade dos dados','Atender demandas das áreas'],
 ARRAY['Vale refeição','Plano de saúde'],
 ARRAY['SQL','Power BI','DAX','Excel','Modelagem','BI'], 'demo', 'https://exemplo.com/vagas/analista-bi', now() - interval '12 days');
