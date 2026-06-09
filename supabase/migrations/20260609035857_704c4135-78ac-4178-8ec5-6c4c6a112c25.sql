
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('super_admin', 'school_admin', 'clerk');
CREATE TYPE public.student_status AS ENUM ('active', 'inactive', 'graduated');
CREATE TYPE public.payment_method AS ENUM ('mpesa', 'bank', 'cash', 'cheque');
CREATE TYPE public.unmatched_status AS ENUM ('pending', 'matched', 'ignored');

-- ============ SCHOOLS ============
CREATE TABLE public.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  plan text DEFAULT 'free',
  subscription_status text DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schools TO authenticated;
GRANT ALL ON public.schools TO service_role;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- ============ STAFF ============
CREATE TABLE public.staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text,
  phone text,
  role public.app_role NOT NULL DEFAULT 'clerk',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, school_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff TO authenticated;
GRANT ALL ON public.staff TO service_role;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- ============ SECURITY DEFINER HELPERS ============
CREATE OR REPLACE FUNCTION public.is_school_member(_school_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff
    WHERE user_id = auth.uid() AND school_id = _school_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_school_admin(_school_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff
    WHERE user_id = auth.uid()
      AND school_id = _school_id
      AND role IN ('school_admin', 'super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.my_school_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT school_id FROM public.staff WHERE user_id = auth.uid() LIMIT 1;
$$;

-- ============ CLASSES ============
CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  level int,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (school_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT ALL ON public.classes TO service_role;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- ============ STUDENTS ============
CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  admission_number text NOT NULL,
  full_name text NOT NULL,
  parent_name text,
  parent_phone text,
  term_fee numeric(12,2) NOT NULL DEFAULT 0,
  total_paid numeric(12,2) NOT NULL DEFAULT 0,
  balance numeric(12,2) GENERATED ALWAYS AS (term_fee - total_paid) STORED,
  status public.student_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (school_id, admission_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- ============ PAYMENTS ============
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  admission_number text NOT NULL,
  amount numeric(12,2) NOT NULL,
  payment_method public.payment_method NOT NULL DEFAULT 'cash',
  receipt_number text,
  mpesa_transaction_code text,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  balance_before numeric(12,2),
  balance_after numeric(12,2),
  notes text,
  recorded_by uuid REFERENCES auth.users(id),
  recorded_by_name text,
  is_reversed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ============ RECEIPTS ============
CREATE TABLE public.receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  payment_id uuid NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  receipt_number text NOT NULL,
  student_name text NOT NULL,
  admission_number text NOT NULL,
  amount numeric(12,2) NOT NULL,
  payment_method public.payment_method NOT NULL,
  previous_balance numeric(12,2),
  new_balance numeric(12,2),
  payment_date date NOT NULL,
  recorded_by_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (school_id, receipt_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.receipts TO authenticated;
GRANT ALL ON public.receipts TO service_role;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- ============ UNMATCHED PAYMENTS ============
CREATE TABLE public.unmatched_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  mpesa_transaction_code text,
  sender_name text,
  sender_phone text,
  amount numeric(12,2) NOT NULL,
  reference text,
  status public.unmatched_status NOT NULL DEFAULT 'pending',
  received_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.unmatched_payments TO authenticated;
GRANT ALL ON public.unmatched_payments TO service_role;
ALTER TABLE public.unmatched_payments ENABLE ROW LEVEL SECURITY;

-- ============ RLS POLICIES ============

-- schools
CREATE POLICY "School members read their school" ON public.schools
  FOR SELECT TO authenticated USING (public.is_school_member(id));
CREATE POLICY "School admins update their school" ON public.schools
  FOR UPDATE TO authenticated USING (public.is_school_admin(id));
CREATE POLICY "Any authed user can create a school" ON public.schools
  FOR INSERT TO authenticated WITH CHECK (true);

-- staff
CREATE POLICY "Staff read own school staff" ON public.staff
  FOR SELECT TO authenticated USING (public.is_school_member(school_id) OR user_id = auth.uid());
CREATE POLICY "Admins manage staff" ON public.staff
  FOR ALL TO authenticated
  USING (public.is_school_admin(school_id))
  WITH CHECK (public.is_school_admin(school_id));
CREATE POLICY "Users can insert self" ON public.staff
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- classes
CREATE POLICY "School members manage classes" ON public.classes
  FOR ALL TO authenticated
  USING (public.is_school_member(school_id))
  WITH CHECK (public.is_school_member(school_id));

-- students
CREATE POLICY "School members manage students" ON public.students
  FOR ALL TO authenticated
  USING (public.is_school_member(school_id))
  WITH CHECK (public.is_school_member(school_id));

-- payments
CREATE POLICY "School members manage payments" ON public.payments
  FOR ALL TO authenticated
  USING (public.is_school_member(school_id))
  WITH CHECK (public.is_school_member(school_id));

-- receipts
CREATE POLICY "School members manage receipts" ON public.receipts
  FOR ALL TO authenticated
  USING (public.is_school_member(school_id))
  WITH CHECK (public.is_school_member(school_id));

-- unmatched_payments
CREATE POLICY "School members manage unmatched" ON public.unmatched_payments
  FOR ALL TO authenticated
  USING (public.is_school_member(school_id))
  WITH CHECK (public.is_school_member(school_id));

-- ============ TIMESTAMP TRIGGERS ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_schools_updated BEFORE UPDATE ON public.schools FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_staff_updated BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_students_updated BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ AUTO-CREATE SCHOOL + STAFF ON SIGNUP ============
-- When a user signs up, create a school for them (using metadata.school_name if provided)
-- and link them as school_admin.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_school_id uuid;
  display_name text;
  school_name text;
BEGIN
  display_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
  school_name := COALESCE(NEW.raw_user_meta_data->>'school_name', display_name || '''s School');

  INSERT INTO public.schools (name) VALUES (school_name) RETURNING id INTO new_school_id;

  INSERT INTO public.staff (user_id, school_id, full_name, email, role)
  VALUES (NEW.id, new_school_id, display_name, NEW.email, 'school_admin');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
