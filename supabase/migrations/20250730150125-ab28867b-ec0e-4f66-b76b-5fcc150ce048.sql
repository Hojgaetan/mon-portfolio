-- Update RLS policies to allow authenticated users to manage content

-- Projects table policies for authenticated users
CREATE POLICY "Authenticated users can insert projects" 
ON public.projects 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects" 
ON public.projects 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete projects" 
ON public.projects 
FOR DELETE 
TO authenticated 
USING (true);

-- Blog posts table policies for authenticated users
CREATE POLICY "Authenticated users can insert blog posts" 
ON public.blog_posts 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update blog posts" 
ON public.blog_posts 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete blog posts" 
ON public.blog_posts 
FOR DELETE 
TO authenticated 
USING (true);