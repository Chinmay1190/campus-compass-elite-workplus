
-- Student demographics
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS guardian_name text,
  ADD COLUMN IF NOT EXISTS guardian_phone text;

-- Course details
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS semester text;

-- Faculty details
ALTER TABLE public.teachers
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS qualification text,
  ADD COLUMN IF NOT EXISTS specialization text,
  ADD COLUMN IF NOT EXISTS office text;

-- Book metadata
ALTER TABLE public.library_books
  ADD COLUMN IF NOT EXISTS publisher text,
  ADD COLUMN IF NOT EXISTS year_published integer,
  ADD COLUMN IF NOT EXISTS edition text,
  ADD COLUMN IF NOT EXISTS shelf text;

-- Exam logistics
ALTER TABLE public.exams
  ADD COLUMN IF NOT EXISTS duration_minutes integer,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS start_time time,
  ADD COLUMN IF NOT EXISTS instructions text;

-- Announcement priority/pinning/expiry
ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS pinned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS expires_at date;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'announcements_priority_check') THEN
    ALTER TABLE public.announcements
      ADD CONSTRAINT announcements_priority_check
      CHECK (priority IN ('normal','important','urgent'));
  END IF;
END$$;

-- Institution-wide settings (single row, keyed by 'global')
CREATE TABLE IF NOT EXISTS public.app_settings (
  id text PRIMARY KEY DEFAULT 'global',
  institution_name text NOT NULL DEFAULT 'Verdant Academy',
  registrar text,
  contact_email text,
  phone text,
  address text,
  academic_year text DEFAULT '2025-2026',
  default_term text DEFAULT 'Fall',
  notify_attendance_digest boolean NOT NULL DEFAULT true,
  notify_overdue_tuition boolean NOT NULL DEFAULT true,
  notify_sms_faculty boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings read" ON public.app_settings;
CREATE POLICY "settings read" ON public.app_settings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "settings admin write" ON public.app_settings;
CREATE POLICY "settings admin write" ON public.app_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP TRIGGER IF EXISTS app_settings_updated_at ON public.app_settings;
CREATE TRIGGER app_settings_updated_at BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed the global row
INSERT INTO public.app_settings (id) VALUES ('global') ON CONFLICT (id) DO NOTHING;
