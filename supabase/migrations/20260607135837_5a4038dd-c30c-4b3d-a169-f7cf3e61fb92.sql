
CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  country TEXT,
  state TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT true,
  ai_status TEXT NOT NULL DEFAULT 'pending',
  ai_response TEXT,
  blockchain_tx_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.submissions TO anon, authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read submissions" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "Public insert submissions" ON public.submissions FOR INSERT WITH CHECK (true);

CREATE TABLE public.chat_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  response TEXT,
  category TEXT,
  language TEXT DEFAULT 'en',
  country TEXT,
  was_escalated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.chat_logs TO anon, authenticated;
GRANT ALL ON public.chat_logs TO service_role;
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read chat_logs" ON public.chat_logs FOR SELECT USING (true);
CREATE POLICY "Public insert chat_logs" ON public.chat_logs FOR INSERT WITH CHECK (true);

CREATE TABLE public.governance_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal TEXT NOT NULL,
  votes_for INTEGER NOT NULL DEFAULT 0,
  votes_against INTEGER NOT NULL DEFAULT 0,
  outcome TEXT,
  voted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.governance_votes TO anon, authenticated;
GRANT ALL ON public.governance_votes TO service_role;
ALTER TABLE public.governance_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read governance_votes" ON public.governance_votes FOR SELECT USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;

INSERT INTO public.governance_votes (proposal, votes_for, votes_against, outcome) VALUES
  ('Add Swahili language support to AI assistant', 142, 8, 'passed'),
  ('Require human review for all corruption reports', 198, 22, 'passed'),
  ('Establish regional steward councils', 87, 65, 'passed'),
  ('Open-source the AI prompt library', 234, 3, 'passed'),
  ('Add legal-aid partner directory', 156, 11, 'passed');
