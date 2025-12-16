-- Allow admins to view ALL contractors (not just verified ones)
CREATE POLICY "Admins can view all contractors"
ON public.contractors
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update contractor verification status
CREATE POLICY "Admins can update contractor verification"
ON public.contractors
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));