
-- Realtime: set replica identity full and add to publication (idempotent)
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['announcements','attendance','fees','exams','grades','library_books','book_loans','students','teachers','courses']) LOOP
    EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', t);
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;

-- Extend handle_new_user to also link student/teacher rows by email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  requested text;
  assigned public.app_role;
  is_first boolean;
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  )
  ON CONFLICT (id) DO NOTHING;

  requested := lower(coalesce(NEW.raw_user_meta_data ->> 'role', 'student'));
  IF requested NOT IN ('student','teacher') THEN
    requested := 'student';
  END IF;
  assigned := requested::public.app_role;

  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles) INTO is_first;
  IF is_first THEN
    assigned := 'admin'::public.app_role;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Auto-link to existing student/teacher record by matching email (case-insensitive)
  IF assigned = 'student'::public.app_role THEN
    UPDATE public.students
       SET user_id = NEW.id
     WHERE user_id IS NULL
       AND lower(email) = lower(NEW.email);
  ELSIF assigned = 'teacher'::public.app_role THEN
    UPDATE public.teachers
       SET user_id = NEW.id
     WHERE user_id IS NULL
       AND lower(email) = lower(NEW.email);
  END IF;

  RETURN NEW;
END;
$function$;

-- When a student/teacher row is created/updated, try to back-link to an existing auth user with the same email
CREATE OR REPLACE FUNCTION public.link_student_to_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.user_id IS NULL AND NEW.email IS NOT NULL THEN
    SELECT id INTO NEW.user_id FROM auth.users WHERE lower(email) = lower(NEW.email) LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS link_student_to_user_trg ON public.students;
CREATE TRIGGER link_student_to_user_trg
BEFORE INSERT OR UPDATE OF email ON public.students
FOR EACH ROW EXECUTE FUNCTION public.link_student_to_user();

DROP TRIGGER IF EXISTS link_teacher_to_user_trg ON public.teachers;
CREATE TRIGGER link_teacher_to_user_trg
BEFORE INSERT OR UPDATE OF email ON public.teachers
FOR EACH ROW EXECUTE FUNCTION public.link_student_to_user();
