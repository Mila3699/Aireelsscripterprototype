# Copy & Paste SQL Solution

## Open SQL Editor:
https://supabase.com/dashboard/project/ssqcxrimivxqdydgmfcn/sql/new

## Copy this code:

```sql
CREATE POLICY "Users can upload their own videos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'make-f3dc28c4-videos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own videos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'make-f3dc28c4-videos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own videos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'make-f3dc28c4-videos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own videos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'make-f3dc28c4-videos' AND (storage.foldername(name))[1] = auth.uid()::text) WITH CHECK (bucket_id = 'make-f3dc28c4-videos' AND (storage.foldername(name))[1] = auth.uid()::text);
```

## Paste → Run → Done!

---

## Quick Alternative (less secure):

```sql
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

Use only for prototyping!
