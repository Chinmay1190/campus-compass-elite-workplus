-- 1. Roles enum + table
create type public.app_role as enum ('admin', 'teacher', 'student');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

-- Security definer for role checks
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- Auto-create profile + default role on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  insert into public.user_roles (user_id, role) values (new.id, 'student');
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- 2. Domain tables
create table public.teachers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  staff_no text unique not null,
  full_name text not null,
  email text not null,
  department text not null,
  title text not null,
  joined_year int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger teachers_updated_at before update on public.teachers
  for each row execute function public.set_updated_at();

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text not null,
  department text not null,
  credits int not null default 3,
  instructor_id uuid references public.teachers(id) on delete set null,
  schedule text,
  capacity int not null default 30,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger courses_updated_at before update on public.courses
  for each row execute function public.set_updated_at();

create table public.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  student_no text unique not null,
  full_name text not null,
  email text not null,
  course_id uuid references public.courses(id) on delete set null,
  year int not null default 1,
  status text not null default 'Active',
  gpa numeric(3,2) default 0,
  enrolled_on date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger students_updated_at before update on public.students
  for each row execute function public.set_updated_at();

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_on date not null default current_date,
  unique (student_id, course_id)
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  date date not null default current_date,
  status text not null check (status in ('present','late','absent')),
  recorded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (student_id, course_id, date)
);

create table public.fees (
  id uuid primary key default gen_random_uuid(),
  invoice_no text unique not null,
  student_id uuid not null references public.students(id) on delete cascade,
  term text not null,
  amount numeric(10,2) not null,
  status text not null default 'Pending' check (status in ('Paid','Pending','Overdue')),
  due_date date not null,
  method text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger fees_updated_at before update on public.fees
  for each row execute function public.set_updated_at();

create table public.exams (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  exam_date date not null,
  total_marks int not null default 100,
  created_at timestamptz not null default now()
);

create table public.grades (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  score numeric(5,2) not null,
  graded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (exam_id, student_id)
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  audience text not null default 'all' check (audience in ('all','students','teachers','admin')),
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.library_books (
  id uuid primary key default gen_random_uuid(),
  isbn text unique,
  title text not null,
  author text not null,
  category text,
  total_copies int not null default 1,
  available_copies int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger library_books_updated_at before update on public.library_books
  for each row execute function public.set_updated_at();

create table public.book_loans (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.library_books(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  borrowed_on date not null default current_date,
  due_date date not null,
  returned_on date,
  created_at timestamptz not null default now()
);

-- 3. Enable RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.teachers enable row level security;
alter table public.courses enable row level security;
alter table public.students enable row level security;
alter table public.enrollments enable row level security;
alter table public.attendance enable row level security;
alter table public.fees enable row level security;
alter table public.exams enable row level security;
alter table public.grades enable row level security;
alter table public.announcements enable row level security;
alter table public.library_books enable row level security;
alter table public.book_loans enable row level security;

-- 4. Policies
-- profiles: each user reads/updates own; admins read all
create policy "profiles self read" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profiles admin read" on public.profiles for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "profiles self update" on public.profiles for update to authenticated using (auth.uid() = id);

-- user_roles: read own; admin manage
create policy "roles self read" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "roles admin read" on public.user_roles for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "roles admin write" on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Reference data: any authenticated user reads, admin writes
create policy "teachers read" on public.teachers for select to authenticated using (true);
create policy "teachers admin write" on public.teachers for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "courses read" on public.courses for select to authenticated using (true);
create policy "courses admin write" on public.courses for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "students read" on public.students for select to authenticated using (true);
create policy "students admin write" on public.students for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "enrollments read" on public.enrollments for select to authenticated using (true);
create policy "enrollments admin write" on public.enrollments for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- attendance: admin/teacher write, students read own, admin/teacher read all
create policy "attendance staff read" on public.attendance for select to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'teacher'));
create policy "attendance self read" on public.attendance for select to authenticated
  using (exists (select 1 from public.students s where s.id = student_id and s.user_id = auth.uid()));
create policy "attendance staff write" on public.attendance for all to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'teacher'))
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'teacher'));

-- fees: admin all; student own
create policy "fees admin read" on public.fees for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "fees self read" on public.fees for select to authenticated
  using (exists (select 1 from public.students s where s.id = student_id and s.user_id = auth.uid()));
create policy "fees admin write" on public.fees for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- exams: read all auth, write staff
create policy "exams read" on public.exams for select to authenticated using (true);
create policy "exams staff write" on public.exams for all to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'teacher'))
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'teacher'));

-- grades: staff all, student own
create policy "grades staff read" on public.grades for select to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'teacher'));
create policy "grades self read" on public.grades for select to authenticated
  using (exists (select 1 from public.students s where s.id = student_id and s.user_id = auth.uid()));
create policy "grades staff write" on public.grades for all to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'teacher'))
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'teacher'));

-- announcements: read all auth, write admin
create policy "announcements read" on public.announcements for select to authenticated using (true);
create policy "announcements admin write" on public.announcements for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- library books: read all auth, write admin
create policy "books read" on public.library_books for select to authenticated using (true);
create policy "books admin write" on public.library_books for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- book_loans: admin all, student own
create policy "loans admin read" on public.book_loans for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "loans self read" on public.book_loans for select to authenticated
  using (exists (select 1 from public.students s where s.id = student_id and s.user_id = auth.uid()));
create policy "loans admin write" on public.book_loans for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));