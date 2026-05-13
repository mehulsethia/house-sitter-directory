--
-- PostgreSQL database dump
--

\restrict PMoYzjulnkYgbIRntfh5b2FpHoJLCEBv1hfGgyLSuWkaqleB1tZq2G0w4YJoDsd

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: enforce_booking_max_advance_window(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.enforce_booking_max_advance_window() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.scheduled_start > (NOW() + interval '28 days') THEN
    RAISE EXCEPTION 'Bookings can only be made up to 28 days in advance';
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: enforce_review_reply_immutable(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.enforce_review_reply_immutable() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  -- If reply is being set for first time, auto-stamp timestamp when missing
  if old.cleaner_reply is null and new.cleaner_reply is not null and new.cleaner_reply_at is null then
    new.cleaner_reply_at := now();
  end if;

  -- Prevent removing/altering reply once set
  if old.cleaner_reply is not null and new.cleaner_reply is distinct from old.cleaner_reply then
    raise exception 'Cleaner reply cannot be edited once posted';
  end if;

  -- Prevent altering timestamp once set
  if old.cleaner_reply_at is not null and new.cleaner_reply_at is distinct from old.cleaner_reply_at then
    raise exception 'Cleaner reply timestamp cannot be edited once posted';
  end if;

  return new;
end;
$$;


--
-- Name: handle_new_auth_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_auth_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;


--
-- Name: rls_auto_enable(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.rls_auto_enable() RETURNS event_trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


--
-- Name: set_booking_flow_drafts_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_booking_flow_drafts_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_cleaner_rating(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_cleaner_rating() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE public.cleaners
  SET
    average_rating = (
      SELECT ROUND(AVG(rating)::NUMERIC, 2)
      FROM public.reviews
      WHERE cleaner_id = NEW.cleaner_id
        AND is_public = TRUE
    ),
    total_jobs = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE cleaner_id = NEW.cleaner_id
    )
  WHERE id = NEW.cleaner_id;
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: availability_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.availability_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cleaner_id uuid NOT NULL,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    buffer_minutes integer DEFAULT 30 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT availability_schedules_buffer_minutes_check CHECK ((buffer_minutes >= 0)),
    CONSTRAINT availability_schedules_day_of_week_check CHECK (((day_of_week >= 1) AND (day_of_week <= 7))),
    CONSTRAINT chk_schedule_times CHECK ((end_time > start_time))
);


--
-- Name: blocked_times; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blocked_times (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cleaner_id uuid NOT NULL,
    start_datetime timestamp with time zone NOT NULL,
    end_datetime timestamp with time zone NOT NULL,
    reason text,
    booking_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_blocked_times_order CHECK ((end_datetime > start_datetime))
);


--
-- Name: booking_flow_drafts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking_flow_drafts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    cleaner_id uuid NOT NULL,
    booking_id uuid,
    last_step integer DEFAULT 1 NOT NULL,
    duration_hours numeric(4,2),
    selected_date text,
    selected_slot timestamp with time zone,
    payload jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    cleaner_id uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    service_type text NOT NULL,
    special_instructions text,
    address text NOT NULL,
    city text NOT NULL,
    postcode text NOT NULL,
    country text DEFAULT 'IE'::text NOT NULL,
    scheduled_start timestamp with time zone NOT NULL,
    scheduled_end timestamp with time zone NOT NULL,
    duration_hours numeric(4,2) NOT NULL,
    hourly_rate numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    platform_fee_pct numeric(5,2) DEFAULT 15.00 NOT NULL,
    platform_fee numeric(10,2) NOT NULL,
    cleaner_payout numeric(10,2) NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    cancellation_reason text,
    cancelled_by uuid,
    cancelled_at timestamp with time zone,
    accepted_at timestamp with time zone,
    confirmed_at timestamp with time zone,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    accept_by timestamp with time zone,
    pay_by timestamp with time zone,
    client_gcal_event_id text,
    cleaner_gcal_event_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    proposed_start timestamp with time zone,
    proposed_end timestamp with time zone,
    proposal_by text,
    cleaner_proposals integer DEFAULT 0 NOT NULL,
    client_proposals integer DEFAULT 0 NOT NULL,
    apartment_details text,
    access_notes text NOT NULL,
    proposal_context text,
    proposal_expires_at timestamp with time zone,
    post_cleaner_proposals integer DEFAULT 0 NOT NULL,
    post_client_proposals integer DEFAULT 0 NOT NULL,
    original_scheduled_start timestamp with time zone NOT NULL,
    reauthorization_required boolean DEFAULT false NOT NULL,
    reauthorization_grace_expires_at timestamp with time zone,
    CONSTRAINT bookings_duration_hours_check CHECK ((duration_hours >= 1.0)),
    CONSTRAINT bookings_service_type_check CHECK ((service_type = ANY (ARRAY['standard'::text, 'deep_clean'::text, 'end_of_tenancy'::text, 'move_in'::text]))),
    CONSTRAINT bookings_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'pending'::text, 'accepted'::text, 'confirmed'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text, 'declined'::text, 'expired'::text, 'disputed'::text]))),
    CONSTRAINT chk_booking_amend_same_day_shift CHECK (((proposal_context <> 'amend_start'::text) OR (proposed_start IS NULL) OR ((date_trunc('day'::text, (proposed_start AT TIME ZONE 'Europe/Nicosia'::text)) = date_trunc('day'::text, (scheduled_start AT TIME ZONE 'Europe/Nicosia'::text))) AND (abs(EXTRACT(epoch FROM (proposed_start - scheduled_start))) <= (10800)::numeric)))),
    CONSTRAINT chk_booking_cleaner_proposals CHECK (((cleaner_proposals >= 0) AND (cleaner_proposals <= 1))),
    CONSTRAINT chk_booking_client_proposals CHECK (((client_proposals >= 0) AND (client_proposals <= 1))),
    CONSTRAINT chk_booking_post_cleaner_proposals CHECK (((post_cleaner_proposals >= 0) AND (post_cleaner_proposals <= 1))),
    CONSTRAINT chk_booking_post_client_proposals CHECK (((post_client_proposals >= 0) AND (post_client_proposals <= 1))),
    CONSTRAINT chk_booking_post_confirm_date_limit CHECK (((proposal_context <> 'post_confirmation'::text) OR (proposed_start IS NULL) OR (proposed_start <= (date_trunc('day'::text, original_scheduled_start) + '14 days'::interval)))),
    CONSTRAINT chk_booking_proposal_by CHECK (((proposal_by IS NULL) OR (proposal_by = ANY (ARRAY['client'::text, 'cleaner'::text])))),
    CONSTRAINT chk_booking_proposal_context CHECK (((proposal_context IS NULL) OR (proposal_context = ANY (ARRAY['pre_confirmation'::text, 'post_confirmation'::text, 'amend_start'::text])))),
    CONSTRAINT chk_booking_reauth_grace CHECK ((reauthorization_required OR (reauthorization_grace_expires_at IS NULL))),
    CONSTRAINT chk_booking_times CHECK ((scheduled_end > scheduled_start)),
    CONSTRAINT chk_pricing_positive CHECK (((subtotal > (0)::numeric) AND (platform_fee >= (0)::numeric) AND (cleaner_payout > (0)::numeric) AND (total_amount > (0)::numeric)))
);


--
-- Name: cleaner_strikes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cleaner_strikes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cleaner_id uuid NOT NULL,
    booking_id uuid,
    strike_type text NOT NULL,
    reason text NOT NULL,
    issued_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT cleaner_strikes_strike_type_check CHECK ((strike_type = ANY (ARRAY['late_cancellation'::text, 'no_show'::text, 'policy_violation'::text, 'client_complaint'::text])))
);


--
-- Name: cleaners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cleaners (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    bio text,
    years_experience integer DEFAULT 0 NOT NULL,
    hourly_rate numeric(10,2) NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    rejection_reason text,
    approved_at timestamp with time zone,
    approved_by uuid,
    profile_complete boolean DEFAULT false NOT NULL,
    identity_verified boolean DEFAULT false NOT NULL,
    stripe_onboarding_complete boolean DEFAULT false NOT NULL,
    stripe_account_id text,
    total_jobs integer DEFAULT 0 NOT NULL,
    average_rating numeric(3,2) DEFAULT NULL::numeric,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    profile_image_url text,
    skills text[] DEFAULT ARRAY[]::text[] NOT NULL,
    transport_mode text,
    transport_pickup_location text,
    id_type text,
    id_file_name text,
    pet_acceptance boolean DEFAULT false NOT NULL,
    work_eligibility_confirmed boolean DEFAULT false NOT NULL,
    terms_accepted boolean DEFAULT false NOT NULL,
    onboarding_step integer DEFAULT 1 NOT NULL,
    onboarding_skipped_step3 boolean DEFAULT false NOT NULL,
    onboarding_skipped_step4 boolean DEFAULT false NOT NULL,
    onboarding_completed_at timestamp with time zone,
    id_file_url text,
    cleaning_supplies text,
    pet_comfortable boolean,
    work_eligibility_answer boolean,
    cleaning_standards_accepted boolean DEFAULT false NOT NULL,
    cleaning_quiz_score integer,
    cleaning_quiz_passed_at timestamp with time zone,
    standards_completed boolean DEFAULT false NOT NULL,
    quiz_passed boolean DEFAULT false NOT NULL,
    quiz_score integer,
    CONSTRAINT cleaners_average_rating_check CHECK (((average_rating IS NULL) OR ((average_rating >= 1.00) AND (average_rating <= 5.00)))),
    CONSTRAINT cleaners_hourly_rate_check CHECK ((hourly_rate >= 15.00)),
    CONSTRAINT cleaners_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'suspended'::text]))),
    CONSTRAINT cleaners_years_experience_check CHECK ((years_experience >= 0))
);


--
-- Name: client_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_addresses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    label text,
    address_line1 text NOT NULL,
    city text NOT NULL,
    postcode text NOT NULL,
    country text DEFAULT 'CY'::text NOT NULL,
    apartment_details text,
    access_notes text DEFAULT ''::text NOT NULL,
    latitude numeric(9,6),
    longitude numeric(9,6),
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: client_favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_favorites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    cleaner_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    stripe_customer_id text,
    default_address text,
    default_city text,
    default_postcode text,
    default_country text DEFAULT 'IE'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id_file_name text,
    id_file_url text,
    id_submitted_at timestamp with time zone
);


--
-- Name: disputes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.disputes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid NOT NULL,
    raised_by uuid NOT NULL,
    reason text NOT NULL,
    evidence jsonb,
    status text DEFAULT 'open'::text NOT NULL,
    resolution_type text,
    resolution_note text,
    refund_amount numeric(10,2),
    resolved_by uuid,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    issue_type text,
    explanation text,
    CONSTRAINT disputes_resolution_type_check CHECK ((resolution_type = ANY (ARRAY['full_refund'::text, 'partial_refund'::text, 'no_refund'::text, 'payment_released'::text]))),
    CONSTRAINT disputes_status_check CHECK ((status = ANY (ARRAY['open'::text, 'under_review'::text, 'resolved'::text, 'closed'::text])))
);


--
-- Name: google_calendar_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.google_calendar_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    access_token text NOT NULL,
    refresh_token text NOT NULL,
    token_expiry timestamp with time zone NOT NULL,
    calendar_id text DEFAULT 'primary'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT messages_content_check CHECK (((char_length(content) >= 1) AND (char_length(content) <= 2000)))
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    data jsonb,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid NOT NULL,
    stripe_payment_intent_id text NOT NULL,
    stripe_charge_id text,
    stripe_transfer_id text,
    stripe_refund_id text,
    amount numeric(10,2) NOT NULL,
    platform_fee numeric(10,2) NOT NULL,
    cleaner_payout numeric(10,2) NOT NULL,
    currency text DEFAULT 'eur'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    refund_amount numeric(10,2),
    refund_reason text,
    authorized_at timestamp with time zone,
    captured_at timestamp with time zone,
    transferred_at timestamp with time zone,
    payout_scheduled_at timestamp with time zone,
    refunded_at timestamp with time zone,
    failed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payments_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'authorized'::text, 'captured'::text, 'transferred'::text, 'refunded'::text, 'partially_refunded'::text, 'failed'::text])))
);


--
-- Name: phone_verification_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.phone_verification_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    phone text NOT NULL,
    event_type text NOT NULL,
    success boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: platform_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_config (
    key text NOT NULL,
    value text NOT NULL,
    description text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid NOT NULL,
    cleaner_id uuid NOT NULL,
    client_id uuid NOT NULL,
    rating integer NOT NULL,
    comment text,
    is_public boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    cleaner_reply text,
    cleaner_reply_at timestamp(6) with time zone,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: COLUMN reviews.cleaner_reply; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reviews.cleaner_reply IS 'Single public reply from cleaner; immutable after first set';


--
-- Name: COLUMN reviews.cleaner_reply_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reviews.cleaner_reply_at IS 'Timestamp when cleaner reply was posted';


--
-- Name: service_areas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_areas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cleaner_id uuid NOT NULL,
    city text NOT NULL,
    postcode_prefix text,
    radius_km numeric(5,2),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    phone text,
    role text NOT NULL,
    avatar_url text,
    is_active boolean DEFAULT true NOT NULL,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    phone_verified_at timestamp with time zone,
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['client'::text, 'cleaner'::text, 'admin'::text])))
);


--
-- Data for Name: availability_schedules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.availability_schedules (id, cleaner_id, day_of_week, start_time, end_time, buffer_minutes, is_active, created_at, updated_at) FROM stdin;
5a379ee8-4300-427e-b567-f2963763b3b4	6b2286a2-3a19-4edb-9b1f-a7b69970c5f1	1	09:00:00	17:00:00	30	t	2026-05-01 14:24:25.223+00	2026-05-01 14:24:25.223+00
136e08d4-5704-4d1b-98aa-695ba1769415	6b2286a2-3a19-4edb-9b1f-a7b69970c5f1	2	09:00:00	17:00:00	30	t	2026-05-01 14:24:25.223+00	2026-05-01 14:24:25.223+00
849e53b3-fd0f-4687-a947-216364540ef0	6b2286a2-3a19-4edb-9b1f-a7b69970c5f1	3	09:00:00	17:00:00	30	t	2026-05-01 14:24:25.223+00	2026-05-01 14:24:25.223+00
4c588186-2543-488f-8cfe-aa1a848b51c7	6b2286a2-3a19-4edb-9b1f-a7b69970c5f1	4	09:00:00	11:30:00	30	t	2026-05-01 14:24:25.223+00	2026-05-01 14:24:25.223+00
08016314-729b-4bbc-9358-2df573d077bb	6b2286a2-3a19-4edb-9b1f-a7b69970c5f1	4	16:00:00	18:00:00	30	t	2026-05-01 14:24:25.223+00	2026-05-01 14:24:25.223+00
caf9b40f-095c-4992-9eea-6859717fe04c	6b2286a2-3a19-4edb-9b1f-a7b69970c5f1	4	19:30:00	21:30:00	30	t	2026-05-01 14:24:25.223+00	2026-05-01 14:24:25.223+00
5166ca1a-6909-4c73-be6f-3cb376a4be74	6b2286a2-3a19-4edb-9b1f-a7b69970c5f1	4	22:30:00	23:30:00	30	t	2026-05-01 14:24:25.223+00	2026-05-01 14:24:25.223+00
57dd44c4-86e9-44b4-9f70-9a8506eefd58	a46a3bdb-8f0c-47dc-a31c-7cd5d05e8265	1	09:00:00	17:00:00	30	t	2026-04-11 16:49:52.529+00	2026-04-11 16:49:52.529+00
1985b81e-1e41-4f6f-865c-7845281f0267	a46a3bdb-8f0c-47dc-a31c-7cd5d05e8265	2	09:00:00	17:00:00	30	t	2026-04-11 16:49:53.383+00	2026-04-11 16:49:53.383+00
0c76cd55-f65f-4356-83cb-fd609ea11800	a46a3bdb-8f0c-47dc-a31c-7cd5d05e8265	3	09:00:00	17:00:00	30	t	2026-04-11 16:49:54.236+00	2026-04-11 16:49:54.236+00
5b112c23-a58d-4fd2-9e08-a2f6ee1c539e	a46a3bdb-8f0c-47dc-a31c-7cd5d05e8265	4	09:00:00	17:00:00	30	t	2026-04-11 16:49:55.09+00	2026-04-11 16:49:55.09+00
387cd889-a5c7-4f57-9a55-0c4e877e6ac5	a46a3bdb-8f0c-47dc-a31c-7cd5d05e8265	5	09:00:00	17:00:00	30	t	2026-04-11 16:49:55.942+00	2026-04-11 16:49:55.942+00
21f43dd2-ae28-4a56-814a-157ee0cb79d4	a46a3bdb-8f0c-47dc-a31c-7cd5d05e8265	6	09:00:00	17:00:00	30	t	2026-04-11 16:49:56.796+00	2026-04-11 16:49:56.796+00
062dbd21-d63f-466e-b49c-61a1c79276ad	7e7b9330-0b99-4d63-b3c3-64d81cb9c815	1	09:00:00	17:00:00	30	t	2026-04-27 13:02:41.525+00	2026-04-27 13:02:41.525+00
015568f8-2d15-426f-b501-5dd56ce1aa0b	7e7b9330-0b99-4d63-b3c3-64d81cb9c815	2	09:00:00	17:00:00	30	t	2026-04-27 13:02:41.525+00	2026-04-27 13:02:41.525+00
9f676c09-2b3a-4f0f-899d-2f456e9dc0a8	7e7b9330-0b99-4d63-b3c3-64d81cb9c815	3	09:00:00	17:00:00	30	t	2026-04-27 13:02:41.525+00	2026-04-27 13:02:41.525+00
d20dbcab-f18a-4dd4-86a3-ab36c090a5d3	7e7b9330-0b99-4d63-b3c3-64d81cb9c815	4	09:00:00	17:00:00	30	t	2026-04-27 13:02:41.525+00	2026-04-27 13:02:41.525+00
aa4f27c1-3cdd-49ef-a84a-8bd8c7f7eac4	7e7b9330-0b99-4d63-b3c3-64d81cb9c815	5	09:00:00	17:00:00	30	t	2026-04-27 13:02:41.525+00	2026-04-27 13:02:41.525+00
52280ac2-6855-43cc-b886-e1c4eaad0f28	6b2286a2-3a19-4edb-9b1f-a7b69970c5f1	5	09:00:00	17:00:00	30	t	2026-05-01 14:24:25.223+00	2026-05-01 14:24:25.223+00
583ac035-5d68-4a51-bfb1-cc23aae5f6e4	647d4819-1c9e-4ba0-bc91-5896ff1533cf	1	09:00:00	17:00:00	30	t	2026-05-09 06:04:28.824+00	2026-05-09 06:04:28.824+00
3e0b8ece-44d6-4838-a0a3-fef238f22482	647d4819-1c9e-4ba0-bc91-5896ff1533cf	2	09:00:00	17:00:00	30	t	2026-05-09 06:04:28.824+00	2026-05-09 06:04:28.824+00
4c7a484b-99da-4ca3-b903-794cb4036c03	647d4819-1c9e-4ba0-bc91-5896ff1533cf	3	09:00:00	17:00:00	30	t	2026-05-09 06:04:28.824+00	2026-05-09 06:04:28.824+00
c6652ccc-81d7-4c93-b920-485b6ad318b6	647d4819-1c9e-4ba0-bc91-5896ff1533cf	4	09:00:00	17:00:00	30	t	2026-05-09 06:04:28.824+00	2026-05-09 06:04:28.824+00
10118fb0-6ca3-4381-a3d4-86629dea2fbc	c5333555-5873-4df8-ae80-2ab7c9362026	1	09:00:00	17:00:00	30	t	2026-04-22 08:48:55.786+00	2026-04-22 08:48:55.786+00
a56b130f-23f5-4df3-b79f-b061983cdd62	c5333555-5873-4df8-ae80-2ab7c9362026	2	09:00:00	17:00:00	30	t	2026-04-22 08:48:55.786+00	2026-04-22 08:48:55.786+00
1be32645-dc70-4f6c-9a4a-136d07eda10a	c5333555-5873-4df8-ae80-2ab7c9362026	3	09:00:00	17:00:00	30	t	2026-04-22 08:48:55.786+00	2026-04-22 08:48:55.786+00
254d23dd-02b2-428f-aa0a-590772f92ba7	c5333555-5873-4df8-ae80-2ab7c9362026	4	09:00:00	17:00:00	30	t	2026-04-22 08:48:55.786+00	2026-04-22 08:48:55.786+00
9163b7ec-94d1-44d8-ba2b-d361c9db9b38	c5333555-5873-4df8-ae80-2ab7c9362026	5	09:00:00	17:00:00	30	t	2026-04-22 08:48:55.786+00	2026-04-22 08:48:55.786+00
9c7a652d-3f02-4693-a732-d38fb56ecc36	647d4819-1c9e-4ba0-bc91-5896ff1533cf	5	09:00:00	17:00:00	30	t	2026-05-09 06:04:28.824+00	2026-05-09 06:04:28.824+00
25840e9c-8829-4b60-9149-95a9595e678f	647d4819-1c9e-4ba0-bc91-5896ff1533cf	6	09:00:00	17:00:00	30	t	2026-05-09 06:04:28.824+00	2026-05-09 06:04:28.824+00
6afc0681-37d1-42e5-81cb-d719921ea49d	647d4819-1c9e-4ba0-bc91-5896ff1533cf	7	09:00:00	17:00:00	30	t	2026-05-09 06:04:28.824+00	2026-05-09 06:04:28.824+00
\.


--
-- Data for Name: blocked_times; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blocked_times (id, cleaner_id, start_datetime, end_datetime, reason, booking_id, created_at) FROM stdin;
51d4bcdc-df9b-4ac3-a288-4c471182d1b9	6b2286a2-3a19-4edb-9b1f-a7b69970c5f1	2026-05-11 00:00:00+00	2026-05-11 23:59:59.999+00	\N	\N	2026-05-09 10:12:56.343+00
\.


--
-- Data for Name: booking_flow_drafts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.booking_flow_drafts (id, client_id, cleaner_id, booking_id, last_step, duration_hours, selected_date, selected_slot, payload, created_at, updated_at) FROM stdin;
8d6f4e43-dffc-401a-ace0-afaf69109773	bd280669-146e-4335-bcfb-317febb94a72	6b2286a2-3a19-4edb-9b1f-a7b69970c5f1	\N	1	2.00	2026-06-02	\N	{"date": "2026-06-02", "step": 1, "version": 1, "duration": 2, "revision": 4, "bookingId": "", "updatedAt": "2026-05-11T17:11:56.493Z", "selectedSlot": ""}	2026-05-11 17:11:26.96+00	2026-05-11 17:11:59.474337+00
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bookings (id, client_id, cleaner_id, status, service_type, special_instructions, address, city, postcode, country, scheduled_start, scheduled_end, duration_hours, hourly_rate, subtotal, platform_fee_pct, platform_fee, cleaner_payout, total_amount, cancellation_reason, cancelled_by, cancelled_at, accepted_at, confirmed_at, started_at, completed_at, accept_by, pay_by, client_gcal_event_id, cleaner_gcal_event_id, created_at, updated_at, proposed_start, proposed_end, proposal_by, cleaner_proposals, client_proposals, apartment_details, access_notes, proposal_context, proposal_expires_at, post_cleaner_proposals, post_client_proposals, original_scheduled_start, reauthorization_required, reauthorization_grace_expires_at) FROM stdin;
172b9697-e1c6-436c-9af8-0e180af0fdd1	bd280669-146e-4335-bcfb-317febb94a72	6b2286a2-3a19-4edb-9b1f-a7b69970c5f1	cancelled	standard	Job type: One-off clean\nBedrooms: 2\nBathrooms: 1\nProperty condition: Normal\nCleaning supplies: Cleaner should bring supplies\nCleaner transport: Requires pickup/drop-off\nPickup location snapshot: Finikoudes bus stop, Larnaca\nWhat needs to be cleaned: whole apartment including windows\nJob photos (2): https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/booking-photos/bookings/ae72fef5-c44c-4909-804b-7ee5a2e581b9/1778323035365-1e0f2171-f5cf-424e-ae91-1dcc1d3688a8.png, https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/booking-photos/bookings/ae72fef5-c44c-4909-804b-7ee5a2e581b9/1778323038223-eafa2553-b351-48a1-bdc9-9639fced3bcb.png	Antoni Papadopoulou 1	Larnaca	6053	CY	2026-05-12 09:00:00+00	2026-05-12 11:00:00+00	2.00	16.00	32.00	10.00	3.20	32.00	35.20	Cancelled by client while in draft payment-required state	ae72fef5-c44c-4909-804b-7ee5a2e581b9	2026-05-09 11:27:20.113+00	\N	\N	\N	\N	2026-05-10 10:37:21.824+00	\N	\N	\N	2026-05-09 10:37:22.294+00	2026-05-09 11:27:20.253543+00	\N	\N	\N	0	0	ground floor	ring the doorbell when you arrive	\N	\N	0	0	2026-05-12 09:00:00+00	f	\N
01bbdc4a-e972-4ed8-ad46-b3fcc1e3ba44	bd280669-146e-4335-bcfb-317febb94a72	6b2286a2-3a19-4edb-9b1f-a7b69970c5f1	expired	standard	Job type: Regular clean\nBedrooms: 2\nBathrooms: 1\nProperty condition: Needs extra attention\nCleaning supplies: I will provide cleaning supplies\nCleaner transport: Requires pickup/drop-off\nPickup location snapshot: Finikoudes bus stop, Larnaca\nWhat needs to be cleaned: bathroom, kitchen, bedrooms, floor and surfaces and windows\nJob photos (2): https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/booking-photos/bookings/ae72fef5-c44c-4909-804b-7ee5a2e581b9/1778325850068-e95df61a-a61e-4f32-8ecc-85c106c25e44.png, https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/booking-photos/bookings/ae72fef5-c44c-4909-804b-7ee5a2e581b9/1778325855628-4112234a-18da-4d11-a5e9-59ce6420506f.png	7 Kilkis Street	Larnaca	6015	CY	2026-05-14 13:00:00+00	2026-05-14 15:00:00+00	2.00	16.00	32.00	10.00	3.20	32.00	35.20	\N	\N	\N	\N	\N	\N	\N	2026-05-10 12:20:02.803+00	\N	\N	\N	2026-05-09 11:24:19.451+00	2026-05-09 13:51:38.119512+00	\N	\N	\N	0	0	ground floor	call me when you arrive.	\N	\N	0	0	2026-05-14 13:00:00+00	f	\N
9ef925f5-7a31-4bcc-9fd4-735793ac5775	bd280669-146e-4335-bcfb-317febb94a72	6b2286a2-3a19-4edb-9b1f-a7b69970c5f1	declined	standard	Job type: One-off clean\nBedrooms: 1\nBathrooms: 1\nProperty condition: Normal\nCleaning supplies: I will provide cleaning supplies\nCleaner transport: Requires pickup/drop-off\nPickup location snapshot: Finikoudes bus stop, finikoudes beach, Larnaca, 6023\nWhat needs to be cleaned: whole apartment including windows and balcony.\nJob photos (2): https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/booking-photos/bookings/ae72fef5-c44c-4909-804b-7ee5a2e581b9/1778350024424-67f7a445-25f8-4a03-843a-570addd9f841.png, https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/booking-photos/bookings/ae72fef5-c44c-4909-804b-7ee5a2e581b9/1778350027274-ead4a101-372f-477e-9feb-8813e02c9321.png	Antoni Papadopoulou 1	Larnaca	6053	CY	2026-05-15 06:30:00+00	2026-05-15 08:30:00+00	2.00	16.00	32.00	10.00	3.20	32.00	35.20	\N	\N	\N	\N	\N	\N	\N	2026-05-10 18:08:58.69+00	\N	\N	\N	2026-05-09 18:07:11.74+00	2026-05-10 09:41:21.891192+00	\N	\N	\N	0	0	ground floor	ring the doorbell when you arrive	\N	\N	0	0	2026-05-15 06:30:00+00	f	\N
4f42275c-c9ba-41c9-b96b-2be5f5a2fae3	bd280669-146e-4335-bcfb-317febb94a72	6b2286a2-3a19-4edb-9b1f-a7b69970c5f1	cancelled	standard	Job type: Regular clean\nBedrooms: 2\nBathrooms: 1\nProperty condition: Light / well maintained\nCleaning supplies: I will provide cleaning supplies\nCleaner transport: Requires pickup/drop-off\nPickup location snapshot: Finikoudes bus stop, finikoudes beach, Larnaca, 6023\nWhat needs to be cleaned: balcony, windows, bathroom, bedrooms, surfaces and floors need mopping.\nJob photos (2): https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/booking-photos/bookings/ae72fef5-c44c-4909-804b-7ee5a2e581b9/1778411697280-ab1572a0-60cf-40fd-b934-eb19d721cf80.png, https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/booking-photos/bookings/ae72fef5-c44c-4909-804b-7ee5a2e581b9/1778411701528-fce48a10-4c5d-47a2-9e48-a07f0435a741.png	Antoni Papadopoulou 1	Larnaca	6053	CY	2026-05-25 06:00:00+00	2026-05-25 08:00:00+00	2.00	16.00	32.00	10.00	3.20	32.00	35.20	Cancelled by client while pending cleaner acceptance	ae72fef5-c44c-4909-804b-7ee5a2e581b9	2026-05-10 11:29:04.924+00	\N	\N	\N	\N	2026-05-11 11:16:24.089+00	\N	\N	\N	2026-05-10 11:15:05.642+00	2026-05-10 11:29:04.972455+00	\N	\N	\N	0	0	ground floor	ring the doorbell when you arrive	\N	\N	0	0	2026-05-25 06:00:00+00	f	\N
a58f2111-275b-43e7-aca8-5cca9e6d1f4b	3152b032-77c2-4049-acbf-608d2eafdd9a	647d4819-1c9e-4ba0-bc91-5896ff1533cf	pending	standard	Job type: Regular clean\nBedrooms: 2\nBathrooms: 2\nProperty condition: Light / well maintained\nCleaning supplies: I will provide cleaning supplies\nCleaner transport: Requires pickup/drop-off\nPickup location snapshot: Main buS stop, City Centre, Larnaca, 1234\nWhat needs to be cleaned: Clean everything	Zuck Street	Larnaca	1234	CY	2026-05-15 06:00:00+00	2026-05-15 09:00:00+00	3.00	25.00	75.00	10.00	7.50	75.00	82.50	\N	\N	\N	\N	\N	\N	\N	2026-05-11 15:55:46.074+00	\N	\N	\N	2026-05-10 15:55:16.053+00	2026-05-10 15:56:33.415533+00	2026-05-15 09:30:00+00	2026-05-15 12:30:00+00	cleaner	1	0	771/A	Call me when you're at the door!	pre_confirmation	2026-05-11 15:55:46.074+00	0	0	2026-05-15 06:00:00+00	f	\N
1ed1c41c-9822-4a1b-9567-91bd87bc4857	bd280669-146e-4335-bcfb-317febb94a72	6b2286a2-3a19-4edb-9b1f-a7b69970c5f1	confirmed	standard	Job type: One-off clean\nBedrooms: 2\nBathrooms: 1\nProperty condition: Normal\nCleaning supplies: I will provide cleaning supplies\nCleaner transport: Requires pickup/drop-off\nPickup location snapshot: Finikoudes bus stop, finikoudes beach, Larnaca, 6023\nWhat needs to be cleaned: balcony, windows, bathroom, bedrooms, surfaces wiping and also the floors need mopping\nJob photos (3): https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/booking-photos/bookings/ae72fef5-c44c-4909-804b-7ee5a2e581b9/1778417592406-bed87e44-e36c-42db-a909-a69f0baf0424.png, https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/booking-photos/bookings/ae72fef5-c44c-4909-804b-7ee5a2e581b9/1778417596364-5393ba66-7886-4da6-a89a-3e8ac4de126d.png, https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/booking-photos/bookings/ae72fef5-c44c-4909-804b-7ee5a2e581b9/1778417601521-5fcc5746-caca-47f2-98c4-e774dd0ffcc2.png	Antoni Papadopoulou 1	Larnaca	6053	CY	2026-06-02 06:00:00+00	2026-06-02 08:00:00+00	2.00	16.00	32.00	10.00	3.20	32.00	35.20	\N	\N	\N	2026-05-10 18:40:34.511+00	2026-05-10 18:40:34.511+00	\N	\N	2026-05-11 12:54:33.081+00	\N	\N	\N	2026-05-10 12:53:26.74+00	2026-05-10 18:40:34.559626+00	\N	\N	\N	0	0	ground floor	ring the doorbell when you arrive	\N	\N	0	0	2026-06-01 06:00:00+00	f	\N
71dc5d9a-cf42-4009-b95c-eb7645c9b210	3152b032-77c2-4049-acbf-608d2eafdd9a	647d4819-1c9e-4ba0-bc91-5896ff1533cf	accepted	standard	Job type: Regular clean\nBedrooms: 1\nBathrooms: 1\nProperty condition: Light / well maintained\nCleaning supplies: I will provide cleaning supplies\nCleaner transport: Requires pickup/drop-off\nPickup location snapshot: Main buS stop, City Centre, Larnaca, 1234\nWhat needs to be cleaned: Clean everything	Zuck Street	Larnaca	1234	CY	2026-05-30 10:00:00+00	2026-05-30 11:00:00+00	1.00	25.00	25.00	10.00	2.50	25.00	27.50	\N	\N	\N	2026-05-12 07:40:27.708+00	\N	\N	\N	2026-05-13 07:33:37.939+00	2026-05-28 10:00:00+00	\N	\N	2026-05-12 07:32:38.169+00	2026-05-12 07:45:01.899895+00	\N	\N	\N	0	0	771/A	Call me when you're at the door!	\N	\N	1	1	2026-05-20 06:00:00+00	t	\N
ac4f3cc6-2cdb-4133-a6e4-cb97c840ae58	3152b032-77c2-4049-acbf-608d2eafdd9a	647d4819-1c9e-4ba0-bc91-5896ff1533cf	confirmed	standard	Job type: One-off clean\nBedrooms: 4\nBathrooms: 3\nProperty condition: Needs extra attention\nCleaning supplies: I will provide cleaning supplies\nCleaner transport: Requires pickup/drop-off\nPickup location snapshot: Main buS stop, City Centre, Larnaca, 1234\nWhat needs to be cleaned: Clean everything	Zuck Street	Larnaca	1234	CY	2026-05-12 13:00:00+00	2026-05-12 14:00:00+00	1.00	25.00	25.00	10.00	2.50	25.00	27.50	\N	\N	\N	2026-05-12 07:40:24.757+00	2026-05-12 07:40:24.757+00	\N	\N	2026-05-12 13:00:00+00	\N	\N	\N	2026-05-12 07:38:03.452+00	2026-05-12 07:47:27.79564+00	2026-05-12 11:00:00+00	2026-05-12 12:00:00+00	client	0	0	771/A	Call me when you're at the door!	amend_start	2026-05-12 08:47:27.747+00	0	0	2026-05-12 13:00:00+00	f	\N
26d5b54b-c1ee-4850-b0f1-1cdf94edfb75	3152b032-77c2-4049-acbf-608d2eafdd9a	647d4819-1c9e-4ba0-bc91-5896ff1533cf	pending	standard	Job type: Regular clean\nBedrooms: 1\nBathrooms: 2\nProperty condition: Light / well maintained\nCleaning supplies: I will provide cleaning supplies\nCleaner transport: Requires pickup/drop-off\nPickup location snapshot: Main buS stop, City Centre, Larnaca, 1234\nWhat needs to be cleaned: Clean everything	Zuck Street	Larnaca	1234	CY	2026-05-13 07:00:00+00	2026-05-13 08:00:00+00	1.00	25.00	25.00	10.00	2.50	25.00	27.50	\N	\N	\N	\N	\N	\N	\N	2026-05-13 07:00:00+00	\N	\N	\N	2026-05-12 07:59:30.517+00	2026-05-12 08:00:25.863601+00	\N	\N	\N	0	0	771/A	Call me when you're at the door!	\N	\N	0	0	2026-05-13 07:00:00+00	f	\N
a14341f7-270d-488d-be63-486bc56def48	3152b032-77c2-4049-acbf-608d2eafdd9a	647d4819-1c9e-4ba0-bc91-5896ff1533cf	pending	deep_clean	Job type: Deep clean\nBedrooms: 1\nBathrooms: 2\nProperty condition: Very dirty / heavy clean\nCleaning supplies: I will provide cleaning supplies\nCleaner transport: Requires pickup/drop-off\nPickup location snapshot: Main buS stop, City Centre, Larnaca, 1234\nWhat needs to be cleaned: Clean everything	Zuck Street	Larnaca	1234	CY	2026-05-25 09:00:00+00	2026-05-25 10:00:00+00	1.00	25.00	25.00	10.00	2.50	25.00	27.50	\N	\N	\N	\N	\N	\N	\N	2026-05-13 08:02:52.612+00	\N	\N	\N	2026-05-12 08:02:27.085+00	2026-05-12 08:02:54.720565+00	\N	\N	\N	0	0	771/A	Call me when you're at the door!	\N	\N	0	0	2026-05-25 09:00:00+00	f	\N
\.


--
-- Data for Name: cleaner_strikes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cleaner_strikes (id, cleaner_id, booking_id, strike_type, reason, issued_by, created_at) FROM stdin;
\.


--
-- Data for Name: cleaners; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cleaners (id, user_id, bio, years_experience, hourly_rate, status, rejection_reason, approved_at, approved_by, profile_complete, identity_verified, stripe_onboarding_complete, stripe_account_id, total_jobs, average_rating, created_at, updated_at, profile_image_url, skills, transport_mode, transport_pickup_location, id_type, id_file_name, pet_acceptance, work_eligibility_confirmed, terms_accepted, onboarding_step, onboarding_skipped_step3, onboarding_skipped_step4, onboarding_completed_at, id_file_url, cleaning_supplies, pet_comfortable, work_eligibility_answer, cleaning_standards_accepted, cleaning_quiz_score, cleaning_quiz_passed_at, standards_completed, quiz_passed, quiz_score) FROM stdin;
38f2f0eb-fa7a-44db-8e8d-fd6d7d7fa649	74fdf459-1a2c-43c7-ae35-7b4714432d71	\N	3	15.00	rejected	Profile incomplete. Thanks for applying to MaidHive.\n\nYour profile is currently incomplete, so we’re unable to approve it yet.\n\nPlease make sure all required sections are fully completed, including your profile details, availability, and setup information.\n\nOnce updated, you’re welcome to resubmit for review.\n\nWe look forward to reviewing your updated profile.	\N	\N	f	f	f	\N	0	\N	2026-04-28 19:23:49.68+00	2026-05-12 21:34:57.603026+00	https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/profile-images/74fdf459-1a2c-43c7-ae35-7b4714432d71/1777404382037-a595111b-ac9d-458e-b86b-84fa5173a149.jpg	{}	\N	\N	\N	\N	f	f	f	1	f	f	\N	\N	\N	\N	\N	f	\N	\N	f	f	\N
a46a3bdb-8f0c-47dc-a31c-7cd5d05e8265	d6a27467-df36-47c3-9b6f-194d8e757f81	None.	0	20.00	approved	\N	2026-04-11 14:29:50.494+00	7aed0a70-c140-489b-a6f3-ba070e3c926c	t	f	t	acct_1TL2JmPPlg0oV6ZB	0	\N	2026-04-11 14:01:47.856+00	2026-05-12 21:34:57.603026+00	Screenshot from 2026-04-11 21-38-45.png	{Ironing,Windows}	own_car	\N	passport	i767b6b7tg76tg76g	t	t	t	4	f	f	2026-04-11 16:55:30.385+00	\N	\N	\N	\N	f	\N	\N	f	f	\N
647d4819-1c9e-4ba0-bc91-5896ff1533cf	cbf49760-284d-4f83-a422-48e7292aa0fd	Cleaner Pro Max!	3	25.00	approved	\N	2026-05-06 16:02:16.897+00	7aed0a70-c140-489b-a6f3-ba070e3c926c	t	f	t	acct_1TU7uePC9nb14j9z	0	\N	2026-05-06 08:34:15.273+00	2026-05-12 21:34:57.603026+00	https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/profile-images/cbf49760-284d-4f83-a422-48e7292aa0fd/1778056491334-4c6cd145-7029-49d7-84b8-6082ee57c39f.jpg	{"Regular home cleaning","One-off cleaning","Move in/out","Deep cleaning"}	requires_pickup	pickup_v2:{"label":"Main buS stop","address":"City Centre","city":"Larnaca","country":"Cyprus","postcode":"1234","meetNotes":"Main bus stop"}	passport	MEHUL_PASSPORT_SIZE_PICTURE_LATEST.jpg	f	t	t	5	f	f	2026-05-06 08:38:59.878+00	https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/cleaner-kyc/cbf49760-284d-4f83-a422-48e7292aa0fd/1778056565308-dc91b1aa-7c40-4fcf-baef-2508d6cff2a6.jpg	client_supplies	t	t	t	100	2026-05-06 08:38:58.376+00	t	t	100
7e7b9330-0b99-4d63-b3c3-64d81cb9c815	0ebee37d-3a91-4c41-be89-a3b379f045cb	Test account by Nikhil.	0	20.00	approved	\N	2026-04-27 13:23:17.241+00	7aed0a70-c140-489b-a6f3-ba070e3c926c	t	f	t	acct_1TQp90ACrsEs7jE6	0	\N	2026-04-27 12:53:20.805+00	2026-05-12 21:34:57.603026+00	https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/profile-images/0ebee37d-3a91-4c41-be89-a3b379f045cb/1777294427067-899a2c05-4f15-4398-8483-d9ff326e19c4.png	{"Regular home cleaning",Ironing}	own_car	\N	passport	Screenshot from 2026-04-27 18-42-04.png	f	t	t	5	f	f	2026-04-27 13:04:16.485+00	https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/cleaner-kyc/0ebee37d-3a91-4c41-be89-a3b379f045cb/1777295529933-a4eb5a20-7393-4571-8d85-f0c3caec8b67.png	own_supplies	t	t	t	100	2026-04-27 13:04:14.993+00	f	f	100
c5333555-5873-4df8-ae80-2ab7c9362026	883f2268-a03e-40fc-8230-c864e39b9045	Hi, I am a professional cleaner.	0	19.00	approved	\N	2026-04-25 15:49:32.051+00	7aed0a70-c140-489b-a6f3-ba070e3c926c	t	f	t	acct_1TOwT7Asf0eLbTpz	0	\N	2026-04-22 08:47:09.699+00	2026-05-12 21:34:57.603026+00	https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/profile-images/883f2268-a03e-40fc-8230-c864e39b9045/1776847662202-ab710b45-f580-4fe9-9386-0a108f71bf58.png	{Ironing,Windows}	own_car	\N	passport	logo..png	t	t	t	4	f	f	2026-04-22 08:52:30.896+00	\N	\N	\N	\N	f	\N	\N	f	f	\N
6b2286a2-3a19-4edb-9b1f-a7b69970c5f1	9ac548b0-f037-43df-8acb-604a316b8594	good cleaning service provider 	3	16.00	approved	\N	2026-05-01 11:31:21.405+00	7aed0a70-c140-489b-a6f3-ba070e3c926c	t	f	t	acct_1TRztsPFSUhJockd	0	\N	2026-04-28 19:36:45.954+00	2026-05-12 21:34:57.603026+00	https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/profile-images/9ac548b0-f037-43df-8acb-604a316b8594/1777405096600-791e5c07-fa43-4956-95ad-cd40a5176eca.jpg	{"Regular home cleaning","One-off cleaning","Laundry / folding clothes",Windows}	requires_pickup	pickup_v2:{"label":"Finikoudes bus stop","address":"finikoudes beach","city":"Larnaca","country":"Cyprus","postcode":"6023","meetNotes":"meet at the main bus stop finikoudes beach"}	drivers_licence	Image 28-04-2026 at 23.03.png	f	t	t	5	f	f	2026-04-28 21:16:55.644+00	https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/cleaner-kyc/9ac548b0-f037-43df-8acb-604a316b8594/1777407695803-78769286-2834-4a1e-8a4d-fe6316a17310.png	client_supplies	f	t	t	100	2026-04-28 21:19:08.393+00	t	t	100
\.


--
-- Data for Name: client_addresses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.client_addresses (id, client_id, label, address_line1, city, postcode, country, apartment_details, access_notes, latitude, longitude, is_default, created_at, updated_at) FROM stdin;
f69aedbc-9ead-42a6-b80a-d2c71f37fb77	7387dbf4-2534-4be7-b7d8-a7a2642d6d68	Nicosia	Nicosia	Larnaca	1010	CY	\N		\N	\N	t	2026-05-06 13:08:14.848688+00	2026-05-06 13:08:14.848688+00
0caa91cc-a4d3-4dc6-a97e-b0f1cd3d0568	3152b032-77c2-4049-acbf-608d2eafdd9a	Home	Zuck Street	Larnaca	1234	CY	771/A	Call me when you're at the door!	\N	\N	t	2026-05-06 16:11:44.302746+00	2026-05-06 16:11:44.302746+00
1afbb45a-49f3-45fa-9b0d-c02cba32fd6d	bd280669-146e-4335-bcfb-317febb94a72	apartment 2	7 Kilkis Street	Larnaca	6015	CY	\N		\N	\N	t	2026-05-05 16:22:48.90668+00	2026-05-06 17:23:10.83072+00
93653f7c-1b72-438d-9ac1-6e4dcc0fce2f	bd280669-146e-4335-bcfb-317febb94a72	\N	Antoni Papadopoulou 1	Larnaca	6053	CY	ground floor	ring the doorbell when you arrive	\N	\N	f	2026-05-07 16:19:07.778579+00	2026-05-07 16:19:07.778579+00
\.


--
-- Data for Name: client_favorites; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.client_favorites (id, client_id, cleaner_id, created_at) FROM stdin;
37fb0995-3582-4841-b9d5-4347a016f406	3152b032-77c2-4049-acbf-608d2eafdd9a	647d4819-1c9e-4ba0-bc91-5896ff1533cf	2026-05-06 16:12:07.853+00
8b6015c9-693b-47e6-b2f8-17dc3c8c4275	bd280669-146e-4335-bcfb-317febb94a72	6b2286a2-3a19-4edb-9b1f-a7b69970c5f1	2026-05-08 08:34:12.746+00
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.clients (id, user_id, stripe_customer_id, default_address, default_city, default_postcode, default_country, created_at, updated_at, id_file_name, id_file_url, id_submitted_at) FROM stdin;
7387dbf4-2534-4be7-b7d8-a7a2642d6d68	49ad0a8e-fac8-4351-8a44-99bb108119d1	cus_UT3iFNmrTWB7ry	Nicosia	Larnaca	1010	CY	2026-05-06 13:01:17.36+00	2026-05-06 15:43:13.953883+00	\N	\N	\N
eed755c6-786e-4f15-9297-feccb834d2eb	50728cb4-af02-4104-857b-47cd20399695	\N	\N	\N	\N	IE	2026-04-24 12:09:01.274+00	2026-04-24 12:09:01.274+00	\N	\N	\N
53593905-b9f7-45b1-9b6a-125b37ac608e	41cc7d36-6d6d-4e3e-a236-e8c2e1bdf88b	cus_UPeoQtdcGh4Ipl	\N	\N	\N	IE	2026-04-11 13:31:23.949+00	2026-04-27 13:47:16.272347+00	\N	\N	\N
3152b032-77c2-4049-acbf-608d2eafdd9a	1450f0c8-5ab7-4f33-bbaa-c9d571f83966	cus_UT4E8pFphCI8lm	Zuck Street	Larnaca	1234	CY	2026-05-06 07:51:32.859+00	2026-05-06 16:15:08.719432+00	\N	\N	\N
bd280669-146e-4335-bcfb-317febb94a72	ae72fef5-c44c-4909-804b-7ee5a2e581b9	cus_UQScdbz4YTkhys	7 Kilkis Street	Larnaca	6015	CY	2026-04-29 10:53:29.449+00	2026-05-07 16:16:14.044027+00	Image 01-05-2026 at 18.21.png	https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/client-ids/ae72fef5-c44c-4909-804b-7ee5a2e581b9/1777650772803-5782cf0c-c3e5-4cad-9882-4e7585dfd0bc.png	2026-05-01 15:52:54.367+00
\.


--
-- Data for Name: disputes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.disputes (id, booking_id, raised_by, reason, evidence, status, resolution_type, resolution_note, refund_amount, resolved_by, resolved_at, created_at, updated_at, issue_type, explanation) FROM stdin;
\.


--
-- Data for Name: google_calendar_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.google_calendar_tokens (id, user_id, access_token, refresh_token, token_expiry, calendar_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, booking_id, sender_id, content, is_read, created_at) FROM stdin;
7ad1f552-6ce3-4fab-9a31-b59a4f90336a	1ed1c41c-9822-4a1b-9567-91bd87bc4857	9ac548b0-f037-43df-8acb-604a316b8594	hi	t	2026-05-10 19:06:50.411+00
06f0e20e-dbff-4bcc-9b4d-fe14e252e948	1ed1c41c-9822-4a1b-9567-91bd87bc4857	ae72fef5-c44c-4909-804b-7ee5a2e581b9	hello I am the client	t	2026-05-11 17:09:58.448+00
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, type, title, body, data, is_read, created_at) FROM stdin;
b6e58a15-7ae2-421d-b4da-49f1a7ffbc92	ae72fef5-c44c-4909-804b-7ee5a2e581b9	booking_created_pending	Booking request created	Your booking request was created and sent to the cleaner.	{"booking_id": "01bbdc4a-e972-4ed8-ad46-b3fcc1e3ba44"}	t	2026-05-09 12:19:55.329+00
61194b8d-f6f3-4fe4-8e2a-08ac26e99e6d	ae72fef5-c44c-4909-804b-7ee5a2e581b9	booking_request_expired	Booking request declined	Cleaner declined this booking request.	{"booking_id": "01bbdc4a-e972-4ed8-ad46-b3fcc1e3ba44"}	t	2026-05-09 13:51:41.033+00
a60fa75c-7aa6-4045-9b40-3afa04bd022c	ae72fef5-c44c-4909-804b-7ee5a2e581b9	booking_created_pending	Booking request created	Your booking request was created and sent to the cleaner.	{"booking_id": "9ef925f5-7a31-4bcc-9fd4-735793ac5775"}	t	2026-05-09 18:08:53.13+00
b34c9dc5-71a1-445f-9a30-c9c18b65955a	ae72fef5-c44c-4909-804b-7ee5a2e581b9	booking_proposed_new_time	Cleaner proposed a new time	Review and accept, decline, or counter once before the request expires.	{"booking_id": "9ef925f5-7a31-4bcc-9fd4-735793ac5775"}	t	2026-05-09 18:26:43.862+00
a947789b-198f-476a-93af-ec3cb2888529	ae72fef5-c44c-4909-804b-7ee5a2e581b9	booking_created_pending	Booking request created	Your booking request was created and sent to the cleaner.	{"booking_id": "4f42275c-c9ba-41c9-b96b-2be5f5a2fae3"}	t	2026-05-10 11:16:18.57+00
82160a34-0f62-4aa6-aa94-70a7f61d694a	ae72fef5-c44c-4909-804b-7ee5a2e581b9	booking_created_pending	Booking request created	Your booking request was created and sent to the cleaner.	{"booking_id": "1ed1c41c-9822-4a1b-9567-91bd87bc4857"}	f	2026-05-10 12:54:26.779+00
7aece012-d6aa-45dd-a675-ab589fb7d9ad	cbf49760-284d-4f83-a422-48e7292aa0fd	booking_proposed_new_time	Client proposed a reschedule	Accept or decline before the 24-hour cutoff; otherwise original booking remains active.	{"booking_id": "71dc5d9a-cf42-4009-b95c-eb7645c9b210"}	f	2026-05-12 07:44:04.949+00
53b676f4-aba3-4146-8c72-e6312e7be345	1450f0c8-5ab7-4f33-bbaa-c9d571f83966	booking_payment_required	Card re-authorization required	Please re-authorize your card before 48 hours prior to the rescheduled start time.	{"booking_id": "71dc5d9a-cf42-4009-b95c-eb7645c9b210"}	f	2026-05-12 07:45:03.609+00
5db3c1ef-fdb6-46cb-a8e5-5e645b4d8e0d	ae72fef5-c44c-4909-804b-7ee5a2e581b9	booking_proposed_new_time	Cleaner proposed a new time	Review and accept, decline, or counter once before the request expires.	{"booking_id": "1ed1c41c-9822-4a1b-9567-91bd87bc4857"}	f	2026-05-10 12:59:51.868+00
d5ddec76-9722-4b2e-b16d-370442c536ad	cbf49760-284d-4f83-a422-48e7292aa0fd	booking_request	New Request	You have a new request from Mehul Sethia. Status: Pending Cleaner Acceptance.	{"booking_id": "a58f2111-275b-43e7-aca8-5cca9e6d1f4b"}	f	2026-05-10 15:55:49.868+00
078187e5-b6a9-4a13-8553-472a6929db39	1450f0c8-5ab7-4f33-bbaa-c9d571f83966	booking_created_pending	Booking request created	Your booking request was created and sent to the cleaner.	{"booking_id": "a58f2111-275b-43e7-aca8-5cca9e6d1f4b"}	f	2026-05-10 15:55:50.333+00
c0782edb-72e5-456f-b9ba-8c2d1b0721fa	1450f0c8-5ab7-4f33-bbaa-c9d571f83966	booking_proposed_new_time	Cleaner proposed a new time	Review and accept, decline, or counter once before the request expires.	{"booking_id": "a58f2111-275b-43e7-aca8-5cca9e6d1f4b"}	f	2026-05-10 15:56:35.135+00
3f11edd4-ee48-4822-b719-7c232cab1750	ae72fef5-c44c-4909-804b-7ee5a2e581b9	booking_time_agreed	Booking time confirmed	The proposed booking time has been accepted and confirmed.	{"booking_id": "1ed1c41c-9822-4a1b-9567-91bd87bc4857"}	f	2026-05-10 18:40:36.336+00
17fadc93-00f0-497d-838e-35e707813be2	9ac548b0-f037-43df-8acb-604a316b8594	booking_cancelled	Booking Cancelled	A booking has been cancelled	{"booking_id": "172b9697-e1c6-436c-9af8-0e180af0fdd1"}	t	2026-05-09 11:27:22.156+00
0417ffeb-b5b4-4c2b-ae06-f3e041a3619d	9ac548b0-f037-43df-8acb-604a316b8594	booking_request	New Request	You have a new request from sam than. Status: Pending Cleaner Acceptance.	{"booking_id": "01bbdc4a-e972-4ed8-ad46-b3fcc1e3ba44"}	t	2026-05-09 12:19:54.855+00
5a0dafa1-6ff7-417e-8ccf-1346123c1051	9ac548b0-f037-43df-8acb-604a316b8594	booking_request	New Request	You have a new request from sam than. Status: Pending Cleaner Acceptance.	{"booking_id": "9ef925f5-7a31-4bcc-9fd4-735793ac5775"}	t	2026-05-09 18:08:52.65+00
4267b8ab-0a09-43b0-9550-891829cd608a	9ac548b0-f037-43df-8acb-604a316b8594	booking_request_declined	Booking request declined	This booking request was declined.	{"booking_id": "9ef925f5-7a31-4bcc-9fd4-735793ac5775"}	t	2026-05-10 09:41:24.829+00
a45fa6f6-2c29-4024-8ebc-5920683d47f8	9ac548b0-f037-43df-8acb-604a316b8594	booking_request	New Request	You have a new request from sam than. Status: Pending Cleaner Acceptance.	{"booking_id": "4f42275c-c9ba-41c9-b96b-2be5f5a2fae3"}	t	2026-05-10 11:16:18.101+00
cfcccc2b-4705-49b1-8d02-f3f8de2d7fd3	9ac548b0-f037-43df-8acb-604a316b8594	booking_cancelled	Booking Cancelled	A booking has been cancelled	{"booking_id": "4f42275c-c9ba-41c9-b96b-2be5f5a2fae3"}	t	2026-05-10 11:29:06.893+00
dfd71b29-a152-44a8-b0e7-69f82dce4fbb	9ac548b0-f037-43df-8acb-604a316b8594	booking_request	New Request	You have a new request from sam than. Status: Pending Cleaner Acceptance.	{"booking_id": "1ed1c41c-9822-4a1b-9567-91bd87bc4857"}	t	2026-05-10 12:54:26.307+00
74380101-c321-4372-9f0a-0fcc78533d63	9ac548b0-f037-43df-8acb-604a316b8594	booking_counter_proposal	Client sent a counter-offer	Accept or decline this counter-offer before the request expires.	{"booking_id": "1ed1c41c-9822-4a1b-9567-91bd87bc4857"}	t	2026-05-10 15:08:10.025+00
5eaeb34f-19a9-419f-89c2-2ba2642472ed	cbf49760-284d-4f83-a422-48e7292aa0fd	booking_request	New Request	You have a new request from Mehul Sethia. Status: Pending Cleaner Acceptance.	{"booking_id": "71dc5d9a-cf42-4009-b95c-eb7645c9b210"}	f	2026-05-12 07:33:41.831+00
68287658-9911-4e61-8a59-464d94e0ab49	1450f0c8-5ab7-4f33-bbaa-c9d571f83966	booking_created_pending	Booking request created	Your booking request was created and sent to the cleaner.	{"booking_id": "71dc5d9a-cf42-4009-b95c-eb7645c9b210"}	f	2026-05-12 07:33:42.297+00
724cdd19-b5d3-4e87-a7aa-dcac7b8bbdb0	cbf49760-284d-4f83-a422-48e7292aa0fd	booking_request	New Request	You have a new request from Mehul Sethia. Status: Pending Cleaner Acceptance.	{"booking_id": "ac4f3cc6-2cdb-4133-a6e4-cb97c840ae58"}	f	2026-05-12 07:39:07.493+00
d670ee47-235d-4d50-910d-fda31db824e7	1450f0c8-5ab7-4f33-bbaa-c9d571f83966	booking_created_pending	Booking request created	Your booking request was created and sent to the cleaner.	{"booking_id": "ac4f3cc6-2cdb-4133-a6e4-cb97c840ae58"}	f	2026-05-12 07:39:07.961+00
cb80409c-f72e-4c10-be84-b32934aa1ae9	1450f0c8-5ab7-4f33-bbaa-c9d571f83966	booking_accepted	Booking accepted	Cleaner accepted your booking request.	{"booking_id": "ac4f3cc6-2cdb-4133-a6e4-cb97c840ae58"}	f	2026-05-12 07:40:26.562+00
d0bff0ce-5bea-4e6d-8578-f3ac374562b3	1450f0c8-5ab7-4f33-bbaa-c9d571f83966	booking_accepted	Booking accepted	Cleaner accepted your booking request.	{"booking_id": "71dc5d9a-cf42-4009-b95c-eb7645c9b210"}	f	2026-05-12 07:40:29.465+00
5a771ef3-0b71-4fe3-9782-26ecf3c70296	1450f0c8-5ab7-4f33-bbaa-c9d571f83966	booking_time_agreed	Reschedule accepted	Booking time updated. Client re-authorization is now required.	{"booking_id": "71dc5d9a-cf42-4009-b95c-eb7645c9b210"}	f	2026-05-12 07:45:04.076+00
27746ede-aed8-4439-8fe9-7f920b7ded71	cbf49760-284d-4f83-a422-48e7292aa0fd	booking_proposed_new_time	Start time amendment requested	Respond within 60 minutes. Counter-offers are not allowed for this amendment.	{"booking_id": "ac4f3cc6-2cdb-4133-a6e4-cb97c840ae58"}	f	2026-05-12 07:47:29.539+00
84e6ad10-53b9-43a4-82d6-62ab9d032c2b	cbf49760-284d-4f83-a422-48e7292aa0fd	booking_request	New Request	You have a new request from Mehul Sethia. Status: Pending Cleaner Acceptance.	{"booking_id": "26d5b54b-c1ee-4850-b0f1-1cdf94edfb75"}	f	2026-05-12 08:00:27.595+00
37ad56cf-d361-421e-9d35-edf6d18d4c1c	1450f0c8-5ab7-4f33-bbaa-c9d571f83966	booking_created_pending	Booking request created	Your booking request was created and sent to the cleaner.	{"booking_id": "26d5b54b-c1ee-4850-b0f1-1cdf94edfb75"}	f	2026-05-12 08:00:28.073+00
abfc741e-9c30-4a7a-aaba-5c311f5fd283	cbf49760-284d-4f83-a422-48e7292aa0fd	booking_request	New Request	You have a new request from Mehul Sethia. Status: Pending Cleaner Acceptance.	{"booking_id": "a14341f7-270d-488d-be63-486bc56def48"}	f	2026-05-12 08:02:56.458+00
a4357dc1-a84f-4843-a48b-fe4948eec91e	1450f0c8-5ab7-4f33-bbaa-c9d571f83966	booking_created_pending	Booking request created	Your booking request was created and sent to the cleaner.	{"booking_id": "a14341f7-270d-488d-be63-486bc56def48"}	f	2026-05-12 08:02:57.02+00
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, booking_id, stripe_payment_intent_id, stripe_charge_id, stripe_transfer_id, stripe_refund_id, amount, platform_fee, cleaner_payout, currency, status, refund_amount, refund_reason, authorized_at, captured_at, transferred_at, payout_scheduled_at, refunded_at, failed_at, created_at, updated_at) FROM stdin;
c1d516cc-d493-41ce-8f9a-d34b8b4a783e	172b9697-e1c6-436c-9af8-0e180af0fdd1	pi_3TV8GDACnTJ04f341s54koXI	\N	\N	\N	35.20	3.20	32.00	eur	failed	\N	\N	\N	\N	\N	\N	\N	2026-05-09 11:27:19.649+00	2026-05-09 10:37:29.174+00	2026-05-09 11:27:19.695476+00
c5c022e6-c2b7-48d3-9b8d-58cadc53c342	01bbdc4a-e972-4ed8-ad46-b3fcc1e3ba44	pi_3TV8zeACnTJ04f341UNPoUun	\N	\N	\N	35.20	3.20	32.00	eur	failed	\N	\N	2026-05-09 12:20:00.753+00	\N	\N	\N	\N	2026-05-09 13:51:40.561+00	2026-05-09 11:24:26.112+00	2026-05-09 13:51:40.608574+00
ef319caa-274f-4c1a-830d-cf7c568c12d4	9ef925f5-7a31-4bcc-9fd4-735793ac5775	pi_3TVFHWACnTJ04f340sKEwZrI	\N	\N	\N	35.20	3.20	32.00	eur	failed	\N	\N	2026-05-09 18:08:58.69+00	\N	\N	\N	\N	2026-05-10 09:41:24.36+00	2026-05-09 18:07:18.41+00	2026-05-10 09:41:24.407254+00
f55e7bb9-44ac-439b-acfe-f39a8660d700	4f42275c-c9ba-41c9-b96b-2be5f5a2fae3	pi_3TVVKMACnTJ04f341XnjC31f	\N	\N	\N	35.20	3.20	32.00	eur	failed	\N	\N	2026-05-10 11:16:24.089+00	\N	\N	\N	\N	2026-05-10 11:29:04.446+00	2026-05-10 11:15:18.606+00	2026-05-10 11:29:04.493321+00
b471dc24-ad61-478f-8801-aa3107ac018f	1ed1c41c-9822-4a1b-9567-91bd87bc4857	pi_3TVWrXACnTJ04f341mllKEpj	\N	\N	\N	35.20	3.20	32.00	eur	authorized	\N	\N	2026-05-10 12:54:33.081+00	\N	\N	\N	\N	\N	2026-05-10 12:53:39.117+00	2026-05-10 12:54:33.128494+00
35aa1b79-089a-48f4-8616-9d765f210857	a58f2111-275b-43e7-aca8-5cca9e6d1f4b	pi_3TVZhVACnTJ04f340yqVIfQr	\N	\N	\N	82.50	7.50	75.00	eur	authorized	\N	\N	2026-05-10 15:55:46.074+00	\N	\N	\N	\N	\N	2026-05-10 15:55:29.378+00	2026-05-10 15:55:46.120625+00
6c24810d-a007-45cc-b5ac-bb4d47314621	ac4f3cc6-2cdb-4133-a6e4-cb97c840ae58	pi_3TWAtQACnTJ04f341SRZ8NIC	\N	\N	\N	27.50	2.50	25.00	eur	authorized	\N	\N	2026-05-12 07:39:03.544+00	\N	\N	\N	\N	\N	2026-05-12 07:38:16.319+00	2026-05-12 07:39:03.706135+00
7f71fdbb-be86-4357-acc2-7f9da642c2f0	71dc5d9a-cf42-4009-b95c-eb7645c9b210	pi_3TWAoBACnTJ04f341er5HhAv	\N	\N	\N	27.50	2.50	25.00	eur	failed	\N	\N	2026-05-12 07:33:37.939+00	\N	\N	\N	\N	2026-05-12 07:45:01.389+00	2026-05-12 07:32:51.168+00	2026-05-12 07:45:01.434843+00
e70591c1-55b3-4dfc-a1a1-cf49b9e5e274	26d5b54b-c1ee-4850-b0f1-1cdf94edfb75	pi_3TWBEBACnTJ04f340BxP5zt1	\N	\N	\N	27.50	2.50	25.00	eur	authorized	\N	\N	2026-05-12 08:00:23.745+00	\N	\N	\N	\N	\N	2026-05-12 07:59:43.509+00	2026-05-12 08:00:23.792389+00
ba141559-95e4-4862-b4e8-62d09e7ad26a	a14341f7-270d-488d-be63-486bc56def48	pi_3TWBH1ACnTJ04f341KO6nuor	\N	\N	\N	27.50	2.50	25.00	eur	authorized	\N	\N	2026-05-12 08:02:52.612+00	\N	\N	\N	\N	\N	2026-05-12 08:02:39.46+00	2026-05-12 08:02:52.658984+00
\.


--
-- Data for Name: phone_verification_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.phone_verification_events (id, user_id, phone, event_type, success, created_at) FROM stdin;
b6154edb-0828-49f8-bad6-6d5107a6b969	cbf49760-284d-4f83-a422-48e7292aa0fd	+918240606847	send	t	2026-05-06 08:35:34.544+00
bca02dc4-df43-40db-b193-537967d9a5a8	cbf49760-284d-4f83-a422-48e7292aa0fd	+918240606847	verify	t	2026-05-06 08:35:48.779+00
3c9f8d70-af60-43dd-a176-f30f710e9546	1450f0c8-5ab7-4f33-bbaa-c9d571f83966	+918240606847	send	t	2026-05-06 08:44:39.431+00
d95c7896-6019-4d6f-9f2e-5507f3053d5f	1450f0c8-5ab7-4f33-bbaa-c9d571f83966	+918240606847	verify	t	2026-05-06 08:45:09.852+00
d35957fb-c774-467e-a50b-0aeacfde6aa2	49ad0a8e-fac8-4351-8a44-99bb108119d1	+35790292020202	send	f	2026-05-06 15:42:59.121+00
e7ce5173-789f-4938-9e13-5edf470d62d1	49ad0a8e-fac8-4351-8a44-99bb108119d1	+35790292020202	send	f	2026-05-06 15:44:08.933+00
1e682046-1e5e-4e92-bf23-ecd4edce8189	49ad0a8e-fac8-4351-8a44-99bb108119d1	+23409013059250	send	t	2026-05-06 15:44:35.156+00
a1a1ed23-5bbb-46b2-94f0-d37ad9d55e6e	49ad0a8e-fac8-4351-8a44-99bb108119d1	+23409013059250	verify	t	2026-05-06 15:45:06.341+00
ddf7620e-2fe8-44e5-a416-f903aedac5d5	ae72fef5-c44c-4909-804b-7ee5a2e581b9	+35794007494	send	t	2026-05-07 16:16:16.897+00
cab1e17e-da84-4a24-a4e7-e0a2b8e7c31a	ae72fef5-c44c-4909-804b-7ee5a2e581b9	+35794007494	verify	t	2026-05-07 16:18:25.476+00
\.


--
-- Data for Name: platform_config; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.platform_config (key, value, description, updated_at) FROM stdin;
booking_accept_ttl	60	Minutes a cleaner has to accept a booking request before it expires	2026-04-07 19:03:10.123672+00
booking_pay_ttl	15	Minutes a client has to complete payment after cleaner accepts	2026-04-07 19:03:10.123672+00
min_hourly_rate	15.00	Minimum hourly rate a cleaner can set (EUR)	2026-04-07 19:03:10.123672+00
min_booking_hours	1.0	Minimum job duration in hours	2026-04-07 19:03:10.123672+00
platform_fee_pct	10.00	Platform commission percentage taken from each booking	2026-04-07 19:03:10.123672+00
payout_delay_hours	24	Hours after job completion before cleaner payout is released	2026-04-07 19:03:10.123672+00
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, booking_id, cleaner_id, client_id, rating, comment, is_public, created_at, updated_at, cleaner_reply, cleaner_reply_at) FROM stdin;
\.


--
-- Data for Name: service_areas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_areas (id, cleaner_id, city, postcode_prefix, radius_km, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, name, phone, role, avatar_url, is_active, deleted_at, created_at, updated_at, phone_verified_at) FROM stdin;
7aed0a70-c140-489b-a6f3-ba070e3c926c	hello@maidhive.app	Admin	\N	admin	\N	t	\N	2026-04-11 08:42:45.833292+00	2026-04-11 12:07:31.720857+00	\N
41cc7d36-6d6d-4e3e-a236-e8c2e1bdf88b	nikhil11754@gmail.com	Nikhil kumar	\N	client	\N	t	\N	2026-04-11 13:31:18.899228+00	2026-04-11 13:31:18.899228+00	\N
d6a27467-df36-47c3-9b6f-194d8e757f81	testmail11754@gmail.com	Nikhil D.	\N	cleaner	\N	t	\N	2026-04-11 14:01:44.261711+00	2026-04-11 14:01:44.261711+00	\N
1450f0c8-5ab7-4f33-bbaa-c9d571f83966	sethiamehul14@gmail.com	Mehul Sethia	+918240606847	client	\N	t	\N	2026-05-06 07:51:06.614294+00	2026-05-07 17:10:05.21465+00	2026-05-06 08:45:10.313+00
74fdf459-1a2c-43c7-ae35-7b4714432d71	sim_thandi@hotmail.com	sim T	+35794007494	cleaner	https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/profile-images/74fdf459-1a2c-43c7-ae35-7b4714432d71/1777404382037-a595111b-ac9d-458e-b86b-84fa5173a149.jpg	t	\N	2026-04-28 19:23:47.434187+00	2026-04-28 19:26:23.218289+00	\N
883f2268-a03e-40fc-8230-c864e39b9045	nikhil.2327cs1108@kiet.com	Test details	\N	cleaner	https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/profile-images/883f2268-a03e-40fc-8230-c864e39b9045/1776847662202-ab710b45-f580-4fe9-9386-0a108f71bf58.png	t	\N	2026-04-22 08:47:05.298205+00	2026-04-22 08:47:43.166846+00	\N
50728cb4-af02-4104-857b-47cd20399695	techspace11754@gmail.com	Nikhil  Dhaliya	\N	client	\N	t	\N	2026-04-24 12:08:58.669368+00	2026-04-24 12:08:58.669368+00	\N
cbf49760-284d-4f83-a422-48e7292aa0fd	mehulpersonal14@gmail.com	Mehul Sethia	+918240606847	cleaner	https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/profile-images/cbf49760-284d-4f83-a422-48e7292aa0fd/1778056491334-4c6cd145-7029-49d7-84b8-6082ee57c39f.jpg	t	\N	2026-05-06 08:33:58.712894+00	2026-05-09 14:52:41.484692+00	2026-05-06 08:35:49.242+00
0ebee37d-3a91-4c41-be89-a3b379f045cb	ideatosystem@gmail.com	test cleaner	\N	cleaner	https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/profile-images/0ebee37d-3a91-4c41-be89-a3b379f045cb/1777294427067-899a2c05-4f15-4398-8483-d9ff326e19c4.png	t	\N	2026-04-27 12:53:18.485975+00	2026-04-27 12:53:47.715528+00	\N
49ad0a8e-fac8-4351-8a44-99bb108119d1	abiodunolamilekan19992004@gmail.com	Abiodun Olamilekan	+23409013059250	client	https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/profile-images/49ad0a8e-fac8-4351-8a44-99bb108119d1/1778082093795-c3cd9809-91e7-4bc5-8520-c9bbd9a077db.png	t	\N	2026-05-06 12:55:38.397423+00	2026-05-06 15:45:06.851356+00	2026-05-06 15:45:06.804+00
9ac548b0-f037-43df-8acb-604a316b8594	arsenalfc_sim@hotmail.co.uk	sim t	+35794007494	cleaner	https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/profile-images/9ac548b0-f037-43df-8acb-604a316b8594/1777405096600-791e5c07-fa43-4956-95ad-cd40a5176eca.jpg	t	\N	2026-04-28 19:36:43.436292+00	2026-05-11 20:00:48.449644+00	\N
ae72fef5-c44c-4909-804b-7ee5a2e581b9	simthandi5@gmail.com	sam than	+35794007494	client	https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/profile-images/ae72fef5-c44c-4909-804b-7ee5a2e581b9/1777650748797-9e9a6d57-788a-4f27-bf97-3880a3014b64.png	t	\N	2026-04-29 10:53:23.05871+00	2026-05-12 17:20:47.083009+00	2026-05-07 16:18:25.944+00
\.


--
-- Name: availability_schedules availability_schedules_cleaner_id_day_of_week_start_time_end_ti; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_schedules
    ADD CONSTRAINT availability_schedules_cleaner_id_day_of_week_start_time_end_ti UNIQUE (cleaner_id, day_of_week, start_time, end_time);


--
-- Name: availability_schedules availability_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_schedules
    ADD CONSTRAINT availability_schedules_pkey PRIMARY KEY (id);


--
-- Name: blocked_times blocked_times_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocked_times
    ADD CONSTRAINT blocked_times_pkey PRIMARY KEY (id);


--
-- Name: booking_flow_drafts booking_flow_drafts_booking_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_flow_drafts
    ADD CONSTRAINT booking_flow_drafts_booking_id_key UNIQUE (booking_id);


--
-- Name: booking_flow_drafts booking_flow_drafts_client_cleaner_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_flow_drafts
    ADD CONSTRAINT booking_flow_drafts_client_cleaner_key UNIQUE (client_id, cleaner_id);


--
-- Name: booking_flow_drafts booking_flow_drafts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_flow_drafts
    ADD CONSTRAINT booking_flow_drafts_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: cleaner_strikes cleaner_strikes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cleaner_strikes
    ADD CONSTRAINT cleaner_strikes_pkey PRIMARY KEY (id);


--
-- Name: cleaners cleaners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cleaners
    ADD CONSTRAINT cleaners_pkey PRIMARY KEY (id);


--
-- Name: cleaners cleaners_stripe_account_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cleaners
    ADD CONSTRAINT cleaners_stripe_account_id_key UNIQUE (stripe_account_id);


--
-- Name: cleaners cleaners_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cleaners
    ADD CONSTRAINT cleaners_user_id_key UNIQUE (user_id);


--
-- Name: client_addresses client_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_addresses
    ADD CONSTRAINT client_addresses_pkey PRIMARY KEY (id);


--
-- Name: client_favorites client_favorites_client_id_cleaner_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_favorites
    ADD CONSTRAINT client_favorites_client_id_cleaner_id_key UNIQUE (client_id, cleaner_id);


--
-- Name: client_favorites client_favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_favorites
    ADD CONSTRAINT client_favorites_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: clients clients_stripe_customer_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_stripe_customer_id_key UNIQUE (stripe_customer_id);


--
-- Name: clients clients_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_user_id_key UNIQUE (user_id);


--
-- Name: disputes disputes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_pkey PRIMARY KEY (id);


--
-- Name: google_calendar_tokens google_calendar_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.google_calendar_tokens
    ADD CONSTRAINT google_calendar_tokens_pkey PRIMARY KEY (id);


--
-- Name: google_calendar_tokens google_calendar_tokens_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.google_calendar_tokens
    ADD CONSTRAINT google_calendar_tokens_user_id_key UNIQUE (user_id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: bookings no_overlapping_bookings; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT no_overlapping_bookings EXCLUDE USING gist (cleaner_id WITH =, tstzrange(scheduled_start, scheduled_end, '[)'::text) WITH &&) WHERE ((status <> ALL (ARRAY['cancelled'::text, 'expired'::text])));


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: payments payments_booking_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_booking_id_key UNIQUE (booking_id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payments payments_stripe_charge_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_stripe_charge_id_key UNIQUE (stripe_charge_id);


--
-- Name: payments payments_stripe_payment_intent_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_stripe_payment_intent_id_key UNIQUE (stripe_payment_intent_id);


--
-- Name: payments payments_stripe_transfer_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_stripe_transfer_id_key UNIQUE (stripe_transfer_id);


--
-- Name: phone_verification_events phone_verification_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.phone_verification_events
    ADD CONSTRAINT phone_verification_events_pkey PRIMARY KEY (id);


--
-- Name: platform_config platform_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_config
    ADD CONSTRAINT platform_config_pkey PRIMARY KEY (key);


--
-- Name: reviews reviews_booking_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_booking_id_key UNIQUE (booking_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: service_areas service_areas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_areas
    ADD CONSTRAINT service_areas_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: booking_flow_drafts_cleaner_updated_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX booking_flow_drafts_cleaner_updated_idx ON public.booking_flow_drafts USING btree (cleaner_id, updated_at DESC);


--
-- Name: booking_flow_drafts_client_updated_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX booking_flow_drafts_client_updated_idx ON public.booking_flow_drafts USING btree (client_id, updated_at DESC);


--
-- Name: idx_avail_cleaner_day; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_avail_cleaner_day ON public.availability_schedules USING btree (cleaner_id, day_of_week);


--
-- Name: idx_blocked_cleaner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blocked_cleaner ON public.blocked_times USING btree (cleaner_id);


--
-- Name: idx_blocked_range; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blocked_range ON public.blocked_times USING gist (cleaner_id, tstzrange(start_datetime, end_datetime));


--
-- Name: idx_bookings_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_active ON public.bookings USING btree (cleaner_id, scheduled_start) WHERE (status <> ALL (ARRAY['cancelled'::text, 'expired'::text]));


--
-- Name: idx_bookings_cleaner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_cleaner ON public.bookings USING btree (cleaner_id);


--
-- Name: idx_bookings_cleaner_start; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_cleaner_start ON public.bookings USING btree (cleaner_id, scheduled_start);


--
-- Name: idx_bookings_client; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_client ON public.bookings USING btree (client_id);


--
-- Name: idx_bookings_proposal_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_proposal_expires_at ON public.bookings USING btree (proposal_expires_at);


--
-- Name: idx_bookings_start; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_start ON public.bookings USING btree (scheduled_start);


--
-- Name: idx_bookings_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_status ON public.bookings USING btree (status);


--
-- Name: idx_bookings_status_accept_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_status_accept_by ON public.bookings USING btree (status, accept_by);


--
-- Name: idx_bookings_status_pay_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_status_pay_by ON public.bookings USING btree (status, pay_by);


--
-- Name: idx_cleaners_rating; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cleaners_rating ON public.cleaners USING btree (average_rating DESC NULLS LAST);


--
-- Name: idx_cleaners_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cleaners_status ON public.cleaners USING btree (status);


--
-- Name: idx_cleaners_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cleaners_user_id ON public.cleaners USING btree (user_id);


--
-- Name: idx_client_addresses_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_client_addresses_client_id ON public.client_addresses USING btree (client_id);


--
-- Name: idx_client_addresses_is_default; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_client_addresses_is_default ON public.client_addresses USING btree (client_id, is_default);


--
-- Name: idx_client_favorites_cleaner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_client_favorites_cleaner_id ON public.client_favorites USING btree (cleaner_id);


--
-- Name: idx_client_favorites_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_client_favorites_client_id ON public.client_favorites USING btree (client_id);


--
-- Name: idx_clients_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clients_user_id ON public.clients USING btree (user_id);


--
-- Name: idx_disputes_booking; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_disputes_booking ON public.disputes USING btree (booking_id);


--
-- Name: idx_disputes_raised_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_disputes_raised_by ON public.disputes USING btree (raised_by);


--
-- Name: idx_disputes_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_disputes_status ON public.disputes USING btree (status);


--
-- Name: idx_messages_booking; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_booking ON public.messages USING btree (booking_id);


--
-- Name: idx_messages_sender; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_sender ON public.messages USING btree (sender_id);


--
-- Name: idx_messages_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_unread ON public.messages USING btree (booking_id, is_read) WHERE (is_read = false);


--
-- Name: idx_notifs_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifs_unread ON public.notifications USING btree (user_id, is_read) WHERE (is_read = false);


--
-- Name: idx_notifs_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifs_user ON public.notifications USING btree (user_id);


--
-- Name: idx_payments_booking; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_booking ON public.payments USING btree (booking_id);


--
-- Name: idx_payments_payout_scheduled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_payout_scheduled ON public.payments USING btree (payout_scheduled_at) WHERE (status = 'captured'::text);


--
-- Name: idx_payments_pi; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_pi ON public.payments USING btree (stripe_payment_intent_id);


--
-- Name: idx_payments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_status ON public.payments USING btree (status);


--
-- Name: idx_phone_verification_events_phone_event_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_phone_verification_events_phone_event_created ON public.phone_verification_events USING btree (phone, event_type, created_at);


--
-- Name: idx_phone_verification_events_user_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_phone_verification_events_user_created ON public.phone_verification_events USING btree (user_id, created_at);


--
-- Name: idx_reviews_cleaner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_cleaner ON public.reviews USING btree (cleaner_id);


--
-- Name: idx_reviews_client; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_client ON public.reviews USING btree (client_id);


--
-- Name: idx_service_areas_city; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_areas_city ON public.service_areas USING btree (city);


--
-- Name: idx_service_areas_cleaner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_areas_cleaner ON public.service_areas USING btree (cleaner_id);


--
-- Name: idx_strikes_cleaner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_strikes_cleaner ON public.cleaner_strikes USING btree (cleaner_id);


--
-- Name: idx_users_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_deleted_at ON public.users USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: uq_client_addresses_single_default; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_client_addresses_single_default ON public.client_addresses USING btree (client_id) WHERE is_default;


--
-- Name: availability_schedules trg_avail_schedule_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_avail_schedule_updated_at BEFORE UPDATE ON public.availability_schedules FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: booking_flow_drafts trg_booking_flow_drafts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_booking_flow_drafts_updated_at BEFORE UPDATE ON public.booking_flow_drafts FOR EACH ROW EXECUTE FUNCTION public.set_booking_flow_drafts_updated_at();


--
-- Name: bookings trg_bookings_enforce_max_advance_window; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_bookings_enforce_max_advance_window BEFORE INSERT OR UPDATE OF scheduled_start ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.enforce_booking_max_advance_window();


--
-- Name: bookings trg_bookings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: cleaners trg_cleaners_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_cleaners_updated_at BEFORE UPDATE ON public.cleaners FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: client_addresses trg_client_addresses_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_client_addresses_updated_at BEFORE UPDATE ON public.client_addresses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: clients trg_clients_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: disputes trg_disputes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_disputes_updated_at BEFORE UPDATE ON public.disputes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: reviews trg_enforce_review_reply_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_enforce_review_reply_immutable BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.enforce_review_reply_immutable();


--
-- Name: google_calendar_tokens trg_gcal_tokens_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_gcal_tokens_updated_at BEFORE UPDATE ON public.google_calendar_tokens FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: payments trg_payments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: reviews trg_reviews_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: reviews trg_update_cleaner_rating; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_update_cleaner_rating AFTER INSERT OR UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_cleaner_rating();


--
-- Name: users trg_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: availability_schedules availability_schedules_cleaner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_schedules
    ADD CONSTRAINT availability_schedules_cleaner_id_fkey FOREIGN KEY (cleaner_id) REFERENCES public.cleaners(id) ON DELETE CASCADE;


--
-- Name: blocked_times blocked_times_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocked_times
    ADD CONSTRAINT blocked_times_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE SET NULL;


--
-- Name: blocked_times blocked_times_cleaner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocked_times
    ADD CONSTRAINT blocked_times_cleaner_id_fkey FOREIGN KEY (cleaner_id) REFERENCES public.cleaners(id) ON DELETE CASCADE;


--
-- Name: booking_flow_drafts booking_flow_drafts_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_flow_drafts
    ADD CONSTRAINT booking_flow_drafts_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: booking_flow_drafts booking_flow_drafts_cleaner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_flow_drafts
    ADD CONSTRAINT booking_flow_drafts_cleaner_id_fkey FOREIGN KEY (cleaner_id) REFERENCES public.cleaners(id) ON DELETE CASCADE;


--
-- Name: booking_flow_drafts booking_flow_drafts_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_flow_drafts
    ADD CONSTRAINT booking_flow_drafts_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_cancelled_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_cancelled_by_fkey FOREIGN KEY (cancelled_by) REFERENCES public.users(id);


--
-- Name: bookings bookings_cleaner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_cleaner_id_fkey FOREIGN KEY (cleaner_id) REFERENCES public.cleaners(id);


--
-- Name: bookings bookings_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: cleaner_strikes cleaner_strikes_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cleaner_strikes
    ADD CONSTRAINT cleaner_strikes_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE SET NULL;


--
-- Name: cleaner_strikes cleaner_strikes_cleaner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cleaner_strikes
    ADD CONSTRAINT cleaner_strikes_cleaner_id_fkey FOREIGN KEY (cleaner_id) REFERENCES public.cleaners(id) ON DELETE CASCADE;


--
-- Name: cleaner_strikes cleaner_strikes_issued_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cleaner_strikes
    ADD CONSTRAINT cleaner_strikes_issued_by_fkey FOREIGN KEY (issued_by) REFERENCES public.users(id);


--
-- Name: cleaners cleaners_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cleaners
    ADD CONSTRAINT cleaners_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: cleaners cleaners_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cleaners
    ADD CONSTRAINT cleaners_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: client_addresses client_addresses_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_addresses
    ADD CONSTRAINT client_addresses_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: client_favorites client_favorites_cleaner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_favorites
    ADD CONSTRAINT client_favorites_cleaner_id_fkey FOREIGN KEY (cleaner_id) REFERENCES public.cleaners(id) ON DELETE CASCADE;


--
-- Name: client_favorites client_favorites_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_favorites
    ADD CONSTRAINT client_favorites_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: clients clients_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: disputes disputes_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: disputes disputes_raised_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_raised_by_fkey FOREIGN KEY (raised_by) REFERENCES public.users(id);


--
-- Name: disputes disputes_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(id);


--
-- Name: google_calendar_tokens google_calendar_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.google_calendar_tokens
    ADD CONSTRAINT google_calendar_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payments payments_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: phone_verification_events phone_verification_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.phone_verification_events
    ADD CONSTRAINT phone_verification_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: reviews reviews_cleaner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_cleaner_id_fkey FOREIGN KEY (cleaner_id) REFERENCES public.cleaners(id);


--
-- Name: reviews reviews_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: service_areas service_areas_cleaner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_areas
    ADD CONSTRAINT service_areas_cleaner_id_fkey FOREIGN KEY (cleaner_id) REFERENCES public.cleaners(id) ON DELETE CASCADE;


--
-- Name: users users_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: availability_schedules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.availability_schedules ENABLE ROW LEVEL SECURITY;

--
-- Name: blocked_times; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blocked_times ENABLE ROW LEVEL SECURITY;

--
-- Name: booking_flow_drafts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.booking_flow_drafts ENABLE ROW LEVEL SECURITY;

--
-- Name: bookings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

--
-- Name: bookings bookings_select_parties; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY bookings_select_parties ON public.bookings FOR SELECT USING (((client_id IN ( SELECT clients.id
   FROM public.clients
  WHERE (clients.user_id = auth.uid()))) OR (cleaner_id IN ( SELECT cleaners.id
   FROM public.cleaners
  WHERE (cleaners.user_id = auth.uid())))));


--
-- Name: cleaner_strikes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cleaner_strikes ENABLE ROW LEVEL SECURITY;

--
-- Name: cleaners; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cleaners ENABLE ROW LEVEL SECURITY;

--
-- Name: cleaners cleaners_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cleaners_select_own ON public.cleaners FOR SELECT USING (((user_id = auth.uid()) OR (status = 'approved'::text)));


--
-- Name: cleaners cleaners_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cleaners_update_own ON public.cleaners FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: client_addresses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_addresses ENABLE ROW LEVEL SECURITY;

--
-- Name: client_favorites; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_favorites ENABLE ROW LEVEL SECURITY;

--
-- Name: clients; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

--
-- Name: clients clients_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY clients_select_own ON public.clients FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: clients clients_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY clients_update_own ON public.clients FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: disputes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

--
-- Name: google_calendar_tokens gcal_tokens_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY gcal_tokens_own ON public.google_calendar_tokens USING ((user_id = auth.uid()));


--
-- Name: google_calendar_tokens; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.google_calendar_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: messages messages_insert_parties; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY messages_insert_parties ON public.messages FOR INSERT WITH CHECK (((sender_id = auth.uid()) AND (booking_id IN ( SELECT bookings.id
   FROM public.bookings
  WHERE ((bookings.client_id IN ( SELECT clients.id
           FROM public.clients
          WHERE (clients.user_id = auth.uid()))) OR (bookings.cleaner_id IN ( SELECT cleaners.id
           FROM public.cleaners
          WHERE (cleaners.user_id = auth.uid()))))))));


--
-- Name: messages messages_select_parties; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY messages_select_parties ON public.messages FOR SELECT USING ((booking_id IN ( SELECT bookings.id
   FROM public.bookings
  WHERE ((bookings.client_id IN ( SELECT clients.id
           FROM public.clients
          WHERE (clients.user_id = auth.uid()))) OR (bookings.cleaner_id IN ( SELECT cleaners.id
           FROM public.cleaners
          WHERE (cleaners.user_id = auth.uid())))))));


--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications notifications_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY notifications_own ON public.notifications FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: notifications notifications_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY notifications_select_own ON public.notifications FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: notifications notifications_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY notifications_update_own ON public.notifications FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- Name: payments payments_select_client; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY payments_select_client ON public.payments FOR SELECT USING ((booking_id IN ( SELECT b.id
   FROM (public.bookings b
     JOIN public.clients c ON ((c.id = b.client_id)))
  WHERE (c.user_id = auth.uid()))));


--
-- Name: phone_verification_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.phone_verification_events ENABLE ROW LEVEL SECURITY;

--
-- Name: platform_config; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;

--
-- Name: reviews; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: reviews reviews_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY reviews_select_own ON public.reviews FOR SELECT USING ((client_id IN ( SELECT clients.id
   FROM public.clients
  WHERE (clients.user_id = auth.uid()))));


--
-- Name: reviews reviews_select_public; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY reviews_select_public ON public.reviews FOR SELECT USING ((is_public = true));


--
-- Name: service_areas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.service_areas ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: users users_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_select_own ON public.users FOR SELECT USING ((auth.uid() = id));


--
-- Name: users users_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_update_own ON public.users FOR UPDATE USING ((auth.uid() = id));


--
-- PostgreSQL database dump complete
--

\unrestrict PMoYzjulnkYgbIRntfh5b2FpHoJLCEBv1hfGgyLSuWkaqleB1tZq2G0w4YJoDsd

