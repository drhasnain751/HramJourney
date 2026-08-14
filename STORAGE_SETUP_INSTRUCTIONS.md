Storage setup instructions (media bucket)

1) Create the `media` bucket in Supabase UI:
   - Open: https://app.supabase.com/project/jslelzkaibdcqrivqkwf/storage
   - Click **Create new bucket**
   - Name: `media`
   - Public: **Off** (private)
   - Save

2) Apply storage policies (if not already applied):
   - Open SQL editor: https://app.supabase.com/project/jslelzkaibdcqrivqkwf/sql/new
   - Paste the following SQL and click Run:

-- Policies for admin access to media objects
CREATE POLICY "Admins can read media objects" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "Admins can upload media objects" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "Admins can update media objects" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "Admins can delete media objects" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.is_admin());

3) Verify bucket exists locally with:

node test-storage.mjs

(Already present in repository.)

Notes:
- Creating the bucket requires Supabase Dashboard (UI) or the Service Role Key. I will not request or handle the Service Role Key.
- The SQL above only installs the policies; bucket creation must be done via UI or CLI.
