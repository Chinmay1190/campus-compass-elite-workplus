
-- AUDIT LOGS
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid,
  action text NOT NULL,
  actor_id uuid,
  actor_email text,
  summary text,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins and teachers can read audit logs" ON public.audit_logs
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher')
  );
CREATE INDEX audit_logs_table_created_idx ON public.audit_logs (table_name, created_at DESC);
CREATE INDEX audit_logs_meta_idx ON public.audit_logs USING gin (meta);

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  type text DEFAULT 'info',
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users delete own notifications" ON public.notifications
  FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE INDEX notifications_user_created_idx ON public.notifications (user_id, created_at DESC);

-- AUDIT TRIGGER: ATTENDANCE
CREATE OR REPLACE FUNCTION public.audit_attendance()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  uemail text;
  sname text;
  ccode text;
  oldstatus text;
  newstatus text;
BEGIN
  SELECT email INTO uemail FROM auth.users WHERE id = uid;
  IF TG_OP = 'DELETE' THEN
    SELECT full_name INTO sname FROM public.students WHERE id = OLD.student_id;
    SELECT code INTO ccode FROM public.courses WHERE id = OLD.course_id;
    INSERT INTO public.audit_logs(table_name, record_id, action, actor_id, actor_email, summary, meta)
    VALUES('attendance', OLD.id, 'DELETE', uid, uemail,
      format('Removed attendance for %s (%s) on %s', coalesce(sname,'?'), coalesce(ccode,'?'), OLD.date),
      jsonb_build_object('student_id', OLD.student_id, 'course_id', OLD.course_id, 'date', OLD.date, 'old_status', OLD.status));
    RETURN OLD;
  END IF;

  newstatus := NEW.status;
  oldstatus := CASE WHEN TG_OP='UPDATE' THEN OLD.status ELSE NULL END;
  IF TG_OP='UPDATE' AND oldstatus IS NOT DISTINCT FROM newstatus THEN RETURN NEW; END IF;

  SELECT full_name INTO sname FROM public.students WHERE id = NEW.student_id;
  SELECT code INTO ccode FROM public.courses WHERE id = NEW.course_id;

  INSERT INTO public.audit_logs(table_name, record_id, action, actor_id, actor_email, summary, meta)
  VALUES('attendance', NEW.id, TG_OP, uid, uemail,
    format('Marked %s as %s for %s on %s', coalesce(sname,'?'), newstatus, coalesce(ccode,'?'), NEW.date),
    jsonb_build_object('student_id', NEW.student_id, 'course_id', NEW.course_id, 'date', NEW.date, 'old_status', oldstatus, 'new_status', newstatus));

  INSERT INTO public.notifications(user_id, title, body, link, type)
  SELECT s.user_id, 'Attendance updated',
    format('Marked %s for %s on %s', newstatus, coalesce(ccode,''), NEW.date),
    '/me', 'attendance'
  FROM public.students s WHERE s.id = NEW.student_id AND s.user_id IS NOT NULL;

  RETURN NEW;
END $$;

CREATE TRIGGER audit_attendance_trg
  AFTER INSERT OR UPDATE OR DELETE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION public.audit_attendance();

-- AUDIT TRIGGER: GRADES
CREATE OR REPLACE FUNCTION public.audit_grades()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  uemail text;
  sname text;
  etitle text;
  emarks numeric;
  oldscore numeric;
  newscore numeric;
BEGIN
  SELECT email INTO uemail FROM auth.users WHERE id = uid;
  IF TG_OP = 'DELETE' THEN
    SELECT full_name INTO sname FROM public.students WHERE id = OLD.student_id;
    SELECT title, total_marks INTO etitle, emarks FROM public.exams WHERE id = OLD.exam_id;
    INSERT INTO public.audit_logs(table_name, record_id, action, actor_id, actor_email, summary, meta)
    VALUES('grades', OLD.id, 'DELETE', uid, uemail,
      format('Removed grade for %s on %s', coalesce(sname,'?'), coalesce(etitle,'?')),
      jsonb_build_object('student_id', OLD.student_id, 'exam_id', OLD.exam_id, 'old_score', OLD.score));
    RETURN OLD;
  END IF;

  newscore := NEW.score;
  oldscore := CASE WHEN TG_OP='UPDATE' THEN OLD.score ELSE NULL END;
  IF TG_OP='UPDATE' AND oldscore IS NOT DISTINCT FROM newscore THEN RETURN NEW; END IF;

  SELECT full_name INTO sname FROM public.students WHERE id = NEW.student_id;
  SELECT title, total_marks INTO etitle, emarks FROM public.exams WHERE id = NEW.exam_id;

  INSERT INTO public.audit_logs(table_name, record_id, action, actor_id, actor_email, summary, meta)
  VALUES('grades', NEW.id, TG_OP, uid, uemail,
    format('Recorded %s/%s for %s on %s', newscore, coalesce(emarks,0), coalesce(sname,'?'), coalesce(etitle,'?')),
    jsonb_build_object('student_id', NEW.student_id, 'exam_id', NEW.exam_id, 'old_score', oldscore, 'new_score', newscore));

  INSERT INTO public.notifications(user_id, title, body, link, type)
  SELECT s.user_id, 'New grade posted',
    format('%s: %s/%s', coalesce(etitle,'Exam'), newscore, coalesce(emarks,0)),
    '/me', 'grade'
  FROM public.students s WHERE s.id = NEW.student_id AND s.user_id IS NOT NULL;

  RETURN NEW;
END $$;

CREATE TRIGGER audit_grades_trg
  AFTER INSERT OR UPDATE OR DELETE ON public.grades
  FOR EACH ROW EXECUTE FUNCTION public.audit_grades();

-- ANNOUNCEMENT FANOUT
CREATE OR REPLACE FUNCTION public.fanout_announcement()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  target text := lower(coalesce(NEW.audience, 'all'));
  ntype text := CASE WHEN NEW.priority = 'urgent' THEN 'urgent'
                     WHEN NEW.priority = 'important' THEN 'important'
                     ELSE 'announcement' END;
BEGIN
  INSERT INTO public.notifications(user_id, title, body, link, type)
  SELECT ur.user_id, NEW.title, left(coalesce(NEW.body,''), 240), '/announcements', ntype
  FROM public.user_roles ur
  WHERE
    target IN ('all','everyone')
    OR (target = 'students' AND ur.role = 'student')
    OR (target IN ('teachers','faculty') AND ur.role = 'teacher')
    OR (target = 'admin' AND ur.role = 'admin');
  RETURN NEW;
END $$;

CREATE TRIGGER fanout_announcement_trg
  AFTER INSERT ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.fanout_announcement();

REVOKE EXECUTE ON FUNCTION public.audit_attendance() FROM public;
REVOKE EXECUTE ON FUNCTION public.audit_grades() FROM public;
REVOKE EXECUTE ON FUNCTION public.fanout_announcement() FROM public;

-- REALTIME
ALTER TABLE public.audit_logs REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
