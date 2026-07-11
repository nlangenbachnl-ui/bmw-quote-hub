DROP POLICY "Anyone can submit a quote request" ON public.quote_requests;
CREATE POLICY "Anyone can submit a valid quote request"
ON public.quote_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(name) BETWEEN 1 AND 100
  AND char_length(email) BETWEEN 5 AND 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND char_length(phone) BETWEEN 5 AND 30
  AND (vin IS NULL OR char_length(vin) <= 20)
  AND char_length(bmw_model) BETWEEN 1 AND 60
  AND char_length(model_year) BETWEEN 4 AND 4
  AND char_length(parts_requested) BETWEEN 1 AND 2000
  AND (notes IS NULL OR char_length(notes) <= 2000)
  AND status = 'new'
  AND cardinality(photo_paths) <= 6
);

DROP POLICY "Anyone can upload quote photos" ON storage.objects;
CREATE POLICY "Anyone can upload quote photos"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'quote-photos'
  AND (storage.extension(name) = ANY (ARRAY['jpg','jpeg','png','webp','heic']))
);