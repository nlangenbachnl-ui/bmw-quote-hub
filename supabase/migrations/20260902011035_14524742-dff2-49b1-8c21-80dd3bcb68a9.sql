CREATE TABLE public.retail_quotes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  access_token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  source_request_id text,
  reference text NOT NULL,
  customer_name text NOT NULL,
  vin text,
  model_year text,
  bmw_model text,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent','accepted','paid','completed','closed')),
  subtotal numeric NOT NULL DEFAULT 0,
  shipping_total numeric NOT NULL DEFAULT 0,
  delivery_label text,
  delivery_fee numeric NOT NULL DEFAULT 0,
  delivery_free boolean NOT NULL DEFAULT false,
  grand_total numeric NOT NULL DEFAULT 0,
  msrp_total numeric NOT NULL DEFAULT 0,
  expires_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX retail_quotes_source_request_idx
  ON public.retail_quotes (source_request_id) WHERE source_request_id IS NOT NULL;

CREATE TABLE public.retail_quote_lines (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id uuid NOT NULL REFERENCES public.retail_quotes(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  part_number text,
  description text NOT NULL DEFAULT '',
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  line_total numeric NOT NULL DEFAULT 0,
  msrp_total numeric NOT NULL DEFAULT 0,
  availability text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX retail_quote_lines_quote_idx ON public.retail_quote_lines (quote_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.retail_quotes TO authenticated;
GRANT ALL ON public.retail_quotes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.retail_quote_lines TO authenticated;
GRANT ALL ON public.retail_quote_lines TO service_role;

ALTER TABLE public.retail_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retail_quote_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage retail quotes" ON public.retail_quotes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage retail quote lines" ON public.retail_quote_lines
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER retail_quotes_set_updated_at
  BEFORE UPDATE ON public.retail_quotes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.mask_part_number(_part_number text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN _part_number IS NULL OR btrim(_part_number) = '' THEN NULL
    ELSE '******' || right(regexp_replace(_part_number, '\s', '', 'g'), 3)
  END
$$;

CREATE OR REPLACE FUNCTION public.get_retail_quote(_token text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  q public.retail_quotes;
  reveal boolean;
  result jsonb;
BEGIN
  IF _token IS NULL OR length(_token) < 16 THEN
    RETURN NULL;
  END IF;

  SELECT * INTO q FROM public.retail_quotes WHERE access_token = _token;
  IF q.id IS NULL THEN
    RETURN NULL;
  END IF;

  IF q.expires_at IS NOT NULL AND q.expires_at < now() THEN
    RETURN jsonb_build_object('expired', true, 'reference', q.reference);
  END IF;

  reveal := q.status IN ('paid', 'completed');

  SELECT jsonb_build_object(
    'expired', false,
    'reference', q.reference,
    'customer_name', q.customer_name,
    'vin', q.vin,
    'model_year', q.model_year,
    'bmw_model', q.bmw_model,
    'status', q.status,
    'subtotal', q.subtotal,
    'shipping_total', q.shipping_total,
    'delivery_label', q.delivery_label,
    'delivery_fee', q.delivery_fee,
    'delivery_free', q.delivery_free,
    'grand_total', q.grand_total,
    'msrp_total', q.msrp_total,
    'expires_at', q.expires_at,
    'part_numbers_revealed', reveal,
    'lines', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', l.id,
        'description', l.description,
        'quantity', l.quantity,
        'unit_price', l.unit_price,
        'line_total', l.line_total,
        'msrp_total', l.msrp_total,
        'availability', l.availability,
        'part_number', CASE WHEN reveal THEN l.part_number ELSE public.mask_part_number(l.part_number) END,
        'part_number_masked', NOT reveal
      ) ORDER BY l.position, l.created_at)
      FROM public.retail_quote_lines l WHERE l.quote_id = q.id
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_retail_quote(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_retail_quote(text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.publish_retail_quote(_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  qid uuid;
  token text;
  src text := nullif(_payload->>'source_request_id', '');
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can publish retail quotes';
  END IF;

  IF src IS NOT NULL THEN
    SELECT id, access_token INTO qid, token FROM public.retail_quotes WHERE source_request_id = src;
  END IF;

  IF qid IS NULL THEN
    INSERT INTO public.retail_quotes (
      source_request_id, reference, customer_name, vin, model_year, bmw_model,
      status, subtotal, shipping_total, delivery_label, delivery_fee, delivery_free,
      grand_total, msrp_total, expires_at, created_by
    ) VALUES (
      src,
      COALESCE(_payload->>'reference', 'PBP'),
      COALESCE(_payload->>'customer_name', 'Customer'),
      _payload->>'vin',
      _payload->>'model_year',
      _payload->>'bmw_model',
      COALESCE(nullif(_payload->>'status',''), 'sent'),
      COALESCE((_payload->>'subtotal')::numeric, 0),
      COALESCE((_payload->>'shipping_total')::numeric, 0),
      _payload->>'delivery_label',
      COALESCE((_payload->>'delivery_fee')::numeric, 0),
      COALESCE((_payload->>'delivery_free')::boolean, false),
      COALESCE((_payload->>'grand_total')::numeric, 0),
      COALESCE((_payload->>'msrp_total')::numeric, 0),
      nullif(_payload->>'expires_at','')::timestamptz,
      auth.uid()
    )
    RETURNING id, access_token INTO qid, token;
  ELSE
    UPDATE public.retail_quotes SET
      reference = COALESCE(_payload->>'reference', reference),
      customer_name = COALESCE(_payload->>'customer_name', customer_name),
      vin = _payload->>'vin',
      model_year = _payload->>'model_year',
      bmw_model = _payload->>'bmw_model',
      status = COALESCE(nullif(_payload->>'status',''), status),
      subtotal = COALESCE((_payload->>'subtotal')::numeric, 0),
      shipping_total = COALESCE((_payload->>'shipping_total')::numeric, 0),
      delivery_label = _payload->>'delivery_label',
      delivery_fee = COALESCE((_payload->>'delivery_fee')::numeric, 0),
      delivery_free = COALESCE((_payload->>'delivery_free')::boolean, false),
      grand_total = COALESCE((_payload->>'grand_total')::numeric, 0),
      msrp_total = COALESCE((_payload->>'msrp_total')::numeric, 0),
      expires_at = nullif(_payload->>'expires_at','')::timestamptz
    WHERE id = qid;

    DELETE FROM public.retail_quote_lines WHERE quote_id = qid;
  END IF;

  INSERT INTO public.retail_quote_lines (
    quote_id, position, part_number, description, quantity, unit_price, line_total, msrp_total, availability
  )
  SELECT
    qid,
    COALESCE((elem->>'position')::int, ord::int),
    elem->>'part_number',
    COALESCE(elem->>'description', ''),
    COALESCE((elem->>'quantity')::int, 1),
    COALESCE((elem->>'unit_price')::numeric, 0),
    COALESCE((elem->>'line_total')::numeric, 0),
    COALESCE((elem->>'msrp_total')::numeric, 0),
    elem->>'availability'
  FROM jsonb_array_elements(COALESCE(_payload->'lines', '[]'::jsonb)) WITH ORDINALITY AS t(elem, ord);

  RETURN jsonb_build_object('id', qid, 'access_token', token);
END;
$$;

REVOKE ALL ON FUNCTION public.publish_retail_quote(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.publish_retail_quote(jsonb) TO authenticated, service_role;