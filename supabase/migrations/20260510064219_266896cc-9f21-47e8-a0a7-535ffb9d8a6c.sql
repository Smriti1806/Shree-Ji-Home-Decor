CREATE TABLE public.customer_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  email text,
  question text NOT NULL,
  answer text,
  is_public boolean NOT NULL DEFAULT false,
  answered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can ask a question"
  ON public.customer_questions FOR INSERT
  WITH CHECK (answer IS NULL AND is_public = false);

CREATE POLICY "Public view answered public questions"
  ON public.customer_questions FOR SELECT
  USING ((answer IS NOT NULL AND is_public = true) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update questions"
  ON public.customer_questions FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete questions"
  ON public.customer_questions FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_customer_questions_updated_at
  BEFORE UPDATE ON public.customer_questions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();