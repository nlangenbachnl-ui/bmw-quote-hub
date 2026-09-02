CREATE TABLE public.account_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  business_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  business_type public.wholesale_business_type,
  business_email text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.account_profiles TO authenticated;
GRANT ALL ON public.account_profiles TO service_role;

ALTER TABLE public.account_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners read own account profile" ON public.account_profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Owners create own account profile" ON public.account_profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners update own account profile" ON public.account_profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins read account profiles" ON public.account_profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER account_profiles_updated_at BEFORE UPDATE ON public.account_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.wholesale_quotes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_number text NOT NULL DEFAULT public.generate_reference('WQ'),
  user_id uuid NOT NULL,
  request_id uuid REFERENCES public.wholesale_parts_requests(id) ON DELETE SET NULL,
  po_number text,
  status text NOT NULL DEFAULT 'sent',
  subtotal numeric NOT NULL DEFAULT 0,
  shipping_total numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  notes text,
  expires_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wholesale_quotes TO authenticated;
GRANT ALL ON public.wholesale_quotes TO service_role;

ALTER TABLE public.wholesale_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners read own wholesale quotes" ON public.wholesale_quotes
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins manage wholesale quotes" ON public.wholesale_quotes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER wholesale_quotes_updated_at BEFORE UPDATE ON public.wholesale_quotes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.wholesale_quote_lines (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id uuid NOT NULL REFERENCES public.wholesale_quotes(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  part_number text,
  description text NOT NULL DEFAULT '',
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  line_total numeric NOT NULL DEFAULT 0,
  availability text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wholesale_quote_lines TO authenticated;
GRANT ALL ON public.wholesale_quote_lines TO service_role;

ALTER TABLE public.wholesale_quote_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners read own wholesale quote lines" ON public.wholesale_quote_lines
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM public.wholesale_quotes q
    WHERE q.id = wholesale_quote_lines.quote_id AND q.user_id = auth.uid()
  ));
CREATE POLICY "Admins manage wholesale quote lines" ON public.wholesale_quote_lines
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX wholesale_quotes_user_idx ON public.wholesale_quotes (user_id, created_at DESC);
CREATE INDEX wholesale_quote_lines_quote_idx ON public.wholesale_quote_lines (quote_id);