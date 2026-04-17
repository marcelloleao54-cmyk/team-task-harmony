
DROP POLICY IF EXISTS "Authenticated can update tasks" ON public.tasks;

CREATE POLICY "Creator assignee or admin can update tasks"
  ON public.tasks FOR UPDATE TO authenticated
  USING (
    auth.uid() = created_by
    OR auth.uid() = assigned_to
    OR public.has_role(auth.uid(), 'admin')
  );
