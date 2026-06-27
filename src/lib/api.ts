import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Student = {
  id: string;
  student_no: string;
  full_name: string;
  email: string;
  course_id: string | null;
  year: number;
  status: string;
  gpa: number | null;
  enrolled_on: string;
  phone?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  address?: string | null;
  guardian_name?: string | null;
  guardian_phone?: string | null;
  course?: { code: string; title: string } | null;
};

export type Course = {
  id: string;
  code: string;
  title: string;
  department: string;
  credits: number;
  schedule: string | null;
  capacity: number;
  instructor_id: string | null;
  description?: string | null;
  semester?: string | null;
  instructor?: { full_name: string } | null;
  enrolled_count?: number;
};

export type Teacher = {
  id: string;
  staff_no: string;
  full_name: string;
  email: string;
  department: string;
  title: string;
  joined_year: number | null;
  phone?: string | null;
  qualification?: string | null;
  specialization?: string | null;
  office?: string | null;
};

export type Fee = {
  id: string;
  invoice_no: string;
  student_id: string;
  term: string;
  amount: number;
  status: "Paid" | "Pending" | "Overdue";
  due_date: string;
  method: string | null;
  student?: { full_name: string; student_no: string } | null;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  audience: string;
  created_at: string;
  priority?: "normal" | "important" | "urgent";
  pinned?: boolean;
  expires_at?: string | null;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  category: string | null;
  total_copies: number;
  available_copies: number;
  publisher?: string | null;
  year_published?: number | null;
  edition?: string | null;
  shelf?: string | null;
};

export type AttendanceRow = {
  id: string;
  student_id: string;
  course_id: string;
  date: string;
  status: "present" | "late" | "absent";
};

export type ExamWithGrades = {
  id: string;
  title: string;
  exam_date: string;
  total_marks: number;
  course_id: string;
  duration_minutes?: number | null;
  location?: string | null;
  start_time?: string | null;
  instructions?: string | null;
  course?: { code: string; title: string } | null;
  grades?: { id: string; score: number; student_id: string; student?: { full_name: string } | null }[];
};

export type Loan = {
  id: string;
  book_id: string;
  student_id: string;
  borrowed_on: string;
  due_date: string;
  returned_on: string | null;
  book?: { title: string } | null;
  student?: { full_name: string } | null;
};

export function useQuery<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fn()
      .then((res) => {
        if (active) {
          setData(res);
          setError(null);
        }
      })
      .catch((e) => active && setError(String(e)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch: () => fn().then(setData) };
}

/* ----------------------------- Fetchers ----------------------------- */

export const fetchStudents = async (): Promise<Student[]> => {
  const { data, error } = await supabase
    .from("students")
    .select("*, course:courses(code, title)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Student[];
};

export const fetchCourses = async (): Promise<Course[]> => {
  const { data, error } = await supabase
    .from("courses")
    .select("*, instructor:teachers(full_name)")
    .order("code");
  if (error) throw error;
  const { data: students } = await supabase.from("students").select("course_id");
  const counts = new Map<string, number>();
  (students ?? []).forEach((s) => {
    if (s.course_id) counts.set(s.course_id, (counts.get(s.course_id) ?? 0) + 1);
  });
  return (data ?? []).map((c) => ({ ...c, enrolled_count: counts.get(c.id) ?? 0 })) as Course[];
};

export const fetchTeachers = async (): Promise<Teacher[]> => {
  const { data, error } = await supabase.from("teachers").select("*").order("full_name");
  if (error) throw error;
  return (data ?? []) as Teacher[];
};

export const fetchFees = async (): Promise<Fee[]> => {
  const { data, error } = await supabase
    .from("fees")
    .select("*, student:students(full_name, student_no)")
    .order("due_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Fee[];
};

export const fetchAnnouncements = async (): Promise<Announcement[]> => {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Announcement[];
};

export const fetchBooks = async (): Promise<Book[]> => {
  const { data, error } = await supabase.from("library_books").select("*").order("title");
  if (error) throw error;
  return (data ?? []) as Book[];
};

export const fetchAttendance = async (sinceDays = 14): Promise<AttendanceRow[]> => {
  const since = new Date();
  since.setDate(since.getDate() - sinceDays);
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .gte("date", since.toISOString().slice(0, 10))
    .order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AttendanceRow[];
};

export const fetchExams = async (): Promise<ExamWithGrades[]> => {
  const { data, error } = await supabase
    .from("exams")
    .select("*, course:courses(code, title), grades(id, score, student_id, student:students(full_name))")
    .order("exam_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ExamWithGrades[];
};

export const fetchLoans = async (): Promise<Loan[]> => {
  const { data, error } = await supabase
    .from("book_loans")
    .select("*, book:library_books(title), student:students(full_name)")
    .order("borrowed_on", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Loan[];
};

/* ----------------------------- Mutations ----------------------------- */

const genNo = (prefix: string) => `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

export const createStudent = async (input: {
  full_name: string;
  email: string;
  course_id: string | null;
  year: number;
  status: string;
  phone?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  address?: string | null;
  guardian_name?: string | null;
  guardian_phone?: string | null;
  enrolled_on?: string;
}) => {
  const { error } = await supabase
    .from("students")
    .insert({ student_no: genNo("STU"), ...input } as never);
  if (error) throw error;
};

export const createTeacher = async (input: {
  full_name: string;
  email: string;
  department: string;
  title: string;
  joined_year: number | null;
  phone?: string | null;
  qualification?: string | null;
  specialization?: string | null;
  office?: string | null;
}) => {
  const { error } = await supabase
    .from("teachers")
    .insert({ staff_no: genNo("STF"), ...input } as never);
  if (error) throw error;
};

export const createCourse = async (input: {
  code: string;
  title: string;
  department: string;
  credits: number;
  capacity: number;
  schedule: string | null;
  instructor_id: string | null;
  description?: string | null;
  semester?: string | null;
}) => {
  const { error } = await supabase.from("courses").insert(input as never);
  if (error) throw error;
};

export const createBook = async (input: {
  title: string;
  author: string;
  isbn: string | null;
  category: string | null;
  total_copies: number;
  publisher?: string | null;
  year_published?: number | null;
  edition?: string | null;
  shelf?: string | null;
}) => {
  const { error } = await supabase
    .from("library_books")
    .insert({ ...input, available_copies: input.total_copies } as never);
  if (error) throw error;
};

export const scheduleExam = async (input: {
  course_id: string;
  title: string;
  exam_date: string;
  total_marks: number;
  duration_minutes?: number | null;
  location?: string | null;
  start_time?: string | null;
  instructions?: string | null;
}) => {
  const { error } = await supabase.from("exams").insert(input as never);
  if (error) throw error;
};

export const markAttendance = async (
  student_id: string,
  course_id: string,
  date: string,
  status: "present" | "late" | "absent",
) => {
  const { error } = await supabase
    .from("attendance")
    .upsert({ student_id, course_id, date, status }, { onConflict: "student_id,course_id,date" });
  if (error) throw error;
};

export const markAttendanceBulk = async (
  rows: { student_id: string; course_id: string; date: string; status: "present" | "late" | "absent" }[],
) => {
  if (!rows.length) return;
  const { error } = await supabase
    .from("attendance")
    .upsert(rows, { onConflict: "student_id,course_id,date" });
  if (error) throw error;
};

export const lendBook = async (book: Book, student_id: string, due_date: string) => {
  const { error } = await supabase.from("book_loans").insert({
    book_id: book.id,
    student_id,
    due_date,
  });
  if (error) throw error;
  await supabase
    .from("library_books")
    .update({ available_copies: Math.max(0, book.available_copies - 1) })
    .eq("id", book.id);
};

export const returnLoan = async (loan: Loan) => {
  const { error } = await supabase
    .from("book_loans")
    .update({ returned_on: new Date().toISOString().slice(0, 10) })
    .eq("id", loan.id);
  if (error) throw error;
  const { data: book } = await supabase
    .from("library_books")
    .select("available_copies, total_copies")
    .eq("id", loan.book_id)
    .single();
  if (book) {
    await supabase
      .from("library_books")
      .update({ available_copies: Math.min(book.total_copies, book.available_copies + 1) })
      .eq("id", loan.book_id);
  }
};

export const createFee = async (input: {
  student_id: string;
  term: string;
  amount: number;
  due_date: string;
  status: string;
  method: string | null;
}) => {
  const { error } = await supabase.from("fees").insert({
    invoice_no: genNo("INV"),
    ...input,
  });
  if (error) throw error;
};

export const markFeePaid = async (fee: Fee, method: string) => {
  const { error } = await supabase
    .from("fees")
    .update({ status: "Paid", method })
    .eq("id", fee.id);
  if (error) throw error;
};

export const createAnnouncement = async (input: {
  title: string;
  body: string;
  audience: string;
  priority?: "normal" | "important" | "urgent";
  pinned?: boolean;
  expires_at?: string | null;
}) => {
  const { error } = await supabase.from("announcements").insert(input as never);
  if (error) throw error;
};

export const deleteAnnouncement = async (id: string) => {
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw error;
};

export const recordGrade = async (input: {
  exam_id: string;
  student_id: string;
  score: number;
}) => {
  const { error } = await supabase
    .from("grades")
    .upsert(input, { onConflict: "exam_id,student_id" });
  if (error) throw error;
};


/* ----------------------------- Updates & Deletes ----------------------------- */

export const updateStudent = async (id: string, input: Partial<Student>) => {
  const { error } = await supabase.from("students").update(input as never).eq("id", id);
  if (error) throw error;
};
export const deleteStudent = async (id: string) => {
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) throw error;
};

export const updateTeacher = async (id: string, input: Partial<Teacher>) => {
  const { error } = await supabase.from("teachers").update(input as never).eq("id", id);
  if (error) throw error;
};
export const deleteTeacher = async (id: string) => {
  const { error } = await supabase.from("teachers").delete().eq("id", id);
  if (error) throw error;
};

export const updateCourse = async (id: string, input: Partial<Course>) => {
  const { error } = await supabase.from("courses").update(input as never).eq("id", id);
  if (error) throw error;
};
export const deleteCourse = async (id: string) => {
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw error;
};

export const updateBook = async (id: string, input: Partial<Book>) => {
  const { error } = await supabase.from("library_books").update(input as never).eq("id", id);
  if (error) throw error;
};
export const deleteBook = async (id: string) => {
  const { error } = await supabase.from("library_books").delete().eq("id", id);
  if (error) throw error;
};

export const updateFee = async (id: string, input: Partial<Pick<Fee, "term" | "amount" | "due_date" | "status" | "method">>) => {
  const { error } = await supabase.from("fees").update(input).eq("id", id);
  if (error) throw error;
};
export const deleteFee = async (id: string) => {
  const { error } = await supabase.from("fees").delete().eq("id", id);
  if (error) throw error;
};

export const updateAnnouncement = async (id: string, input: Partial<Pick<Announcement, "title" | "body" | "audience">>) => {
  const { error } = await supabase.from("announcements").update(input as never).eq("id", id);
  if (error) throw error;
};

/* ----------------------------- App settings ----------------------------- */

export type AppSettings = {
  id: string;
  institution_name: string;
  registrar: string | null;
  contact_email: string | null;
  phone: string | null;
  address: string | null;
  academic_year: string | null;
  default_term: string | null;
  notify_attendance_digest: boolean;
  notify_overdue_tuition: boolean;
  notify_sms_faculty: boolean;
};

export const fetchSettings = async (): Promise<AppSettings> => {
  const { data, error } = await supabase
    .from("app_settings" as never)
    .select("*")
    .eq("id", "global")
    .maybeSingle();
  if (error) throw error;
  return (data ?? { id: "global", institution_name: "Verdant Academy" }) as AppSettings;
};

export const updateSettings = async (input: Partial<Omit<AppSettings, "id">>) => {
  const { error } = await supabase
    .from("app_settings" as never)
    .upsert({ id: "global", ...input } as never);
  if (error) throw error;
};

/* ----------------------------- Realtime ----------------------------- */

export function useRealtime(
  channelName: string,
  tables: string[],
  onChange: () => void,
) {
  useEffect(() => {
    const ch = supabase.channel(channelName);
    tables.forEach((t) => {
      ch.on(
        "postgres_changes" as never,
        { event: "*", schema: "public", table: t },
        () => onChange(),
      );
    });
    ch.subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName]);
}

/* ----------------------------- Self-service ----------------------------- */

export const fetchMyStudent = async (): Promise<Student | null> => {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const { data } = await supabase
    .from("students")
    .select("*, course:courses(code, title)")
    .eq("user_id", u.user.id)
    .maybeSingle();
  return (data ?? null) as Student | null;
};

export const fetchMyTeacher = async (): Promise<Teacher | null> => {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const { data } = await supabase
    .from("teachers")
    .select("*")
    .eq("user_id", u.user.id)
    .maybeSingle();
  return (data ?? null) as Teacher | null;
};

export const fetchMyAttendance = async (): Promise<AttendanceRow[]> => {
  const me = await fetchMyStudent();
  if (!me) return [];
  const { data } = await supabase
    .from("attendance")
    .select("*")
    .eq("student_id", me.id)
    .order("date", { ascending: false })
    .limit(60);
  return (data ?? []) as AttendanceRow[];
};

export const fetchMyGrades = async () => {
  const me = await fetchMyStudent();
  if (!me) return [];
  const { data } = await supabase
    .from("grades")
    .select("id, score, exam:exams(title, total_marks, exam_date, course:courses(code, title))")
    .eq("student_id", me.id);
  return data ?? [];
};

export const fetchMyFees = async (): Promise<Fee[]> => {
  const me = await fetchMyStudent();
  if (!me) return [];
  const { data } = await supabase
    .from("fees")
    .select("*, student:students(full_name, student_no)")
    .eq("student_id", me.id)
    .order("due_date", { ascending: false });
  return (data ?? []) as Fee[];
};

export const fetchMyLoans = async (): Promise<Loan[]> => {
  const me = await fetchMyStudent();
  if (!me) return [];
  const { data } = await supabase
    .from("book_loans")
    .select("*, book:library_books(title), student:students(full_name)")
    .eq("student_id", me.id)
    .order("borrowed_on", { ascending: false });
  return (data ?? []) as Loan[];
};

export const fetchTeacherCourses = async (): Promise<Course[]> => {
  const me = await fetchMyTeacher();
  if (!me) return [];
  const { data } = await supabase
    .from("courses")
    .select("*, instructor:teachers(full_name)")
    .eq("instructor_id", me.id)
    .order("code");
  const { data: students } = await supabase.from("students").select("course_id");
  const counts = new Map<string, number>();
  (students ?? []).forEach((s) => {
    if (s.course_id) counts.set(s.course_id, (counts.get(s.course_id) ?? 0) + 1);
  });
  return (data ?? []).map((c) => ({ ...c, enrolled_count: counts.get(c.id) ?? 0 })) as Course[];
};

export const fetchExamRoster = async (examId: string) => {
  const { data: exam } = await supabase
    .from("exams")
    .select("*, course:courses(code, title)")
    .eq("id", examId)
    .maybeSingle();
  if (!exam) return { exam: null, rows: [] as { student: Student; score: number | null; grade_id: string | null }[] };
  const { data: students } = await supabase
    .from("students")
    .select("*, course:courses(code, title)")
    .eq("course_id", exam.course_id)
    .eq("status", "Active")
    .order("full_name");
  const { data: grades } = await supabase
    .from("grades")
    .select("id, score, student_id")
    .eq("exam_id", examId);
  const gmap = new Map<string, { id: string; score: number }>();
  (grades ?? []).forEach((g) => gmap.set(g.student_id, { id: g.id, score: Number(g.score) }));
  const rows = (students ?? []).map((s) => {
    const g = gmap.get(s.id);
    return { student: s as Student, score: g?.score ?? null, grade_id: g?.id ?? null };
  });
  return { exam, rows };
};

export const recordGradesBulk = async (
  rows: { exam_id: string; student_id: string; score: number }[],
) => {
  if (!rows.length) return;
  const { error } = await supabase
    .from("grades")
    .upsert(rows, { onConflict: "exam_id,student_id" });
  if (error) throw error;
};
