--
-- PostgreSQL database dump
--

\restrict zTDplEoF77CeukyrciNuo1Jg6UOu34pZLtM5fBLh2aq1eGSGcjniRacdBd8ItdE

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
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users VALUES ('7aed0a70-c140-489b-a6f3-ba070e3c926c', 'hello@maidhive.app', 'Admin', NULL, 'admin', NULL, true, NULL, '2026-04-11 08:42:45.833292+00', '2026-04-11 12:07:31.720857+00', NULL);
INSERT INTO public.users VALUES ('41cc7d36-6d6d-4e3e-a236-e8c2e1bdf88b', 'nikhil11754@gmail.com', 'Nikhil kumar', NULL, 'client', NULL, true, NULL, '2026-04-11 13:31:18.899228+00', '2026-04-11 13:31:18.899228+00', NULL);
INSERT INTO public.users VALUES ('d6a27467-df36-47c3-9b6f-194d8e757f81', 'testmail11754@gmail.com', 'Nikhil D.', NULL, 'cleaner', NULL, true, NULL, '2026-04-11 14:01:44.261711+00', '2026-04-11 14:01:44.261711+00', NULL);
INSERT INTO public.users VALUES ('1450f0c8-5ab7-4f33-bbaa-c9d571f83966', 'sethiamehul14@gmail.com', 'Mehul Sethia', '+918240606847', 'client', NULL, true, NULL, '2026-05-06 07:51:06.614294+00', '2026-05-07 17:10:05.21465+00', '2026-05-06 08:45:10.313+00');
INSERT INTO public.users VALUES ('74fdf459-1a2c-43c7-ae35-7b4714432d71', 'sim_thandi@hotmail.com', 'sim T', '+35794007494', 'cleaner', 'https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/profile-images/74fdf459-1a2c-43c7-ae35-7b4714432d71/1777404382037-a595111b-ac9d-458e-b86b-84fa5173a149.jpg', true, NULL, '2026-04-28 19:23:47.434187+00', '2026-04-28 19:26:23.218289+00', NULL);
INSERT INTO public.users VALUES ('883f2268-a03e-40fc-8230-c864e39b9045', 'nikhil.2327cs1108@kiet.com', 'Test details', NULL, 'cleaner', 'https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/profile-images/883f2268-a03e-40fc-8230-c864e39b9045/1776847662202-ab710b45-f580-4fe9-9386-0a108f71bf58.png', true, NULL, '2026-04-22 08:47:05.298205+00', '2026-04-22 08:47:43.166846+00', NULL);
INSERT INTO public.users VALUES ('50728cb4-af02-4104-857b-47cd20399695', 'techspace11754@gmail.com', 'Nikhil  Dhaliya', NULL, 'client', NULL, true, NULL, '2026-04-24 12:08:58.669368+00', '2026-04-24 12:08:58.669368+00', NULL);
INSERT INTO public.users VALUES ('cbf49760-284d-4f83-a422-48e7292aa0fd', 'mehulpersonal14@gmail.com', 'Mehul Sethia', '+918240606847', 'cleaner', 'https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/profile-images/cbf49760-284d-4f83-a422-48e7292aa0fd/1778056491334-4c6cd145-7029-49d7-84b8-6082ee57c39f.jpg', true, NULL, '2026-05-06 08:33:58.712894+00', '2026-05-09 14:52:41.484692+00', '2026-05-06 08:35:49.242+00');
INSERT INTO public.users VALUES ('0ebee37d-3a91-4c41-be89-a3b379f045cb', 'ideatosystem@gmail.com', 'test cleaner', NULL, 'cleaner', 'https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/profile-images/0ebee37d-3a91-4c41-be89-a3b379f045cb/1777294427067-899a2c05-4f15-4398-8483-d9ff326e19c4.png', true, NULL, '2026-04-27 12:53:18.485975+00', '2026-04-27 12:53:47.715528+00', NULL);
INSERT INTO public.users VALUES ('49ad0a8e-fac8-4351-8a44-99bb108119d1', 'abiodunolamilekan19992004@gmail.com', 'Abiodun Olamilekan', '+23409013059250', 'client', 'https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/profile-images/49ad0a8e-fac8-4351-8a44-99bb108119d1/1778082093795-c3cd9809-91e7-4bc5-8520-c9bbd9a077db.png', true, NULL, '2026-05-06 12:55:38.397423+00', '2026-05-06 15:45:06.851356+00', '2026-05-06 15:45:06.804+00');
INSERT INTO public.users VALUES ('9ac548b0-f037-43df-8acb-604a316b8594', 'arsenalfc_sim@hotmail.co.uk', 'sim t', '+35794007494', 'cleaner', 'https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/profile-images/9ac548b0-f037-43df-8acb-604a316b8594/1777405096600-791e5c07-fa43-4956-95ad-cd40a5176eca.jpg', true, NULL, '2026-04-28 19:36:43.436292+00', '2026-05-11 20:00:48.449644+00', NULL);
INSERT INTO public.users VALUES ('ae72fef5-c44c-4909-804b-7ee5a2e581b9', 'simthandi5@gmail.com', 'sam than', '+35794007494', 'client', 'https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/profile-images/ae72fef5-c44c-4909-804b-7ee5a2e581b9/1777650748797-9e9a6d57-788a-4f27-bf97-3880a3014b64.png', true, NULL, '2026-04-29 10:53:23.05871+00', '2026-05-12 17:20:47.083009+00', '2026-05-07 16:18:25.944+00');


--
-- Data for Name: cleaners; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.cleaners VALUES ('38f2f0eb-fa7a-44db-8e8d-fd6d7d7fa649', '74fdf459-1a2c-43c7-ae35-7b4714432d71', NULL, 3, 15.00, 'rejected', 'Profile incomplete. Thanks for applying to MaidHive.

Your profile is currently incomplete, so we’re unable to approve it yet.

Please make sure all required sections are fully completed, including your profile details, availability, and setup information.

Once updated, you’re welcome to resubmit for review.

We look forward to reviewing your updated profile.', NULL, NULL, false, false, false, NULL, 0, NULL, '2026-04-28 19:23:49.68+00', '2026-05-12 21:34:57.603026+00', 'https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/profile-images/74fdf459-1a2c-43c7-ae35-7b4714432d71/1777404382037-a595111b-ac9d-458e-b86b-84fa5173a149.jpg', '{}', NULL, NULL, NULL, NULL, false, false, false, 1, false, false, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, false, false, NULL);
INSERT INTO public.cleaners VALUES ('a46a3bdb-8f0c-47dc-a31c-7cd5d05e8265', 'd6a27467-df36-47c3-9b6f-194d8e757f81', 'None.', 0, 20.00, 'approved', NULL, '2026-04-11 14:29:50.494+00', '7aed0a70-c140-489b-a6f3-ba070e3c926c', true, false, true, 'acct_1TL2JmPPlg0oV6ZB', 0, NULL, '2026-04-11 14:01:47.856+00', '2026-05-12 21:34:57.603026+00', 'Screenshot from 2026-04-11 21-38-45.png', '{Ironing,Windows}', 'own_car', NULL, 'passport', 'i767b6b7tg76tg76g', true, true, true, 4, false, false, '2026-04-11 16:55:30.385+00', NULL, NULL, NULL, NULL, false, NULL, NULL, false, false, NULL);
INSERT INTO public.cleaners VALUES ('647d4819-1c9e-4ba0-bc91-5896ff1533cf', 'cbf49760-284d-4f83-a422-48e7292aa0fd', 'Cleaner Pro Max!', 3, 25.00, 'approved', NULL, '2026-05-06 16:02:16.897+00', '7aed0a70-c140-489b-a6f3-ba070e3c926c', true, false, true, 'acct_1TU7uePC9nb14j9z', 0, NULL, '2026-05-06 08:34:15.273+00', '2026-05-12 21:34:57.603026+00', 'https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/profile-images/cbf49760-284d-4f83-a422-48e7292aa0fd/1778056491334-4c6cd145-7029-49d7-84b8-6082ee57c39f.jpg', '{"Regular home cleaning","One-off cleaning","Move in/out","Deep cleaning"}', 'requires_pickup', 'pickup_v2:{"label":"Main buS stop","address":"City Centre","city":"Larnaca","country":"Cyprus","postcode":"1234","meetNotes":"Main bus stop"}', 'passport', 'MEHUL_PASSPORT_SIZE_PICTURE_LATEST.jpg', false, true, true, 5, false, false, '2026-05-06 08:38:59.878+00', 'https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/cleaner-kyc/cbf49760-284d-4f83-a422-48e7292aa0fd/1778056565308-dc91b1aa-7c40-4fcf-baef-2508d6cff2a6.jpg', 'client_supplies', true, true, true, 100, '2026-05-06 08:38:58.376+00', true, true, 100);
INSERT INTO public.cleaners VALUES ('7e7b9330-0b99-4d63-b3c3-64d81cb9c815', '0ebee37d-3a91-4c41-be89-a3b379f045cb', 'Test account by Nikhil.', 0, 20.00, 'approved', NULL, '2026-04-27 13:23:17.241+00', '7aed0a70-c140-489b-a6f3-ba070e3c926c', true, false, true, 'acct_1TQp90ACrsEs7jE6', 0, NULL, '2026-04-27 12:53:20.805+00', '2026-05-12 21:34:57.603026+00', 'https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/profile-images/0ebee37d-3a91-4c41-be89-a3b379f045cb/1777294427067-899a2c05-4f15-4398-8483-d9ff326e19c4.png', '{"Regular home cleaning",Ironing}', 'own_car', NULL, 'passport', 'Screenshot from 2026-04-27 18-42-04.png', false, true, true, 5, false, false, '2026-04-27 13:04:16.485+00', 'https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/cleaner-kyc/0ebee37d-3a91-4c41-be89-a3b379f045cb/1777295529933-a4eb5a20-7393-4571-8d85-f0c3caec8b67.png', 'own_supplies', true, true, true, 100, '2026-04-27 13:04:14.993+00', false, false, 100);
INSERT INTO public.cleaners VALUES ('c5333555-5873-4df8-ae80-2ab7c9362026', '883f2268-a03e-40fc-8230-c864e39b9045', 'Hi, I am a professional cleaner.', 0, 19.00, 'approved', NULL, '2026-04-25 15:49:32.051+00', '7aed0a70-c140-489b-a6f3-ba070e3c926c', true, false, true, 'acct_1TOwT7Asf0eLbTpz', 0, NULL, '2026-04-22 08:47:09.699+00', '2026-05-12 21:34:57.603026+00', 'https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/profile-images/883f2268-a03e-40fc-8230-c864e39b9045/1776847662202-ab710b45-f580-4fe9-9386-0a108f71bf58.png', '{Ironing,Windows}', 'own_car', NULL, 'passport', 'logo..png', true, true, true, 4, false, false, '2026-04-22 08:52:30.896+00', NULL, NULL, NULL, NULL, false, NULL, NULL, false, false, NULL);
INSERT INTO public.cleaners VALUES ('6b2286a2-3a19-4edb-9b1f-a7b69970c5f1', '9ac548b0-f037-43df-8acb-604a316b8594', 'good cleaning service provider ', 3, 16.00, 'approved', NULL, '2026-05-01 11:31:21.405+00', '7aed0a70-c140-489b-a6f3-ba070e3c926c', true, false, true, 'acct_1TRztsPFSUhJockd', 0, NULL, '2026-04-28 19:36:45.954+00', '2026-05-12 21:34:57.603026+00', 'https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/profile-images/9ac548b0-f037-43df-8acb-604a316b8594/1777405096600-791e5c07-fa43-4956-95ad-cd40a5176eca.jpg', '{"Regular home cleaning","One-off cleaning","Laundry / folding clothes",Windows}', 'requires_pickup', 'pickup_v2:{"label":"Finikoudes bus stop","address":"finikoudes beach","city":"Larnaca","country":"Cyprus","postcode":"6023","meetNotes":"meet at the main bus stop finikoudes beach"}', 'drivers_licence', 'Image 28-04-2026 at 23.03.png', false, true, true, 5, false, false, '2026-04-28 21:16:55.644+00', 'https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/cleaner-kyc/9ac548b0-f037-43df-8acb-604a316b8594/1777407695803-78769286-2834-4a1e-8a4d-fe6316a17310.png', 'client_supplies', false, true, true, 100, '2026-04-28 21:19:08.393+00', true, true, 100);


--
-- Data for Name: availability_schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.availability_schedules VALUES ('5a379ee8-4300-427e-b567-f2963763b3b4', '6b2286a2-3a19-4edb-9b1f-a7b69970c5f1', 1, '09:00:00', '17:00:00', 30, true, '2026-05-01 14:24:25.223+00', '2026-05-01 14:24:25.223+00');
INSERT INTO public.availability_schedules VALUES ('136e08d4-5704-4d1b-98aa-695ba1769415', '6b2286a2-3a19-4edb-9b1f-a7b69970c5f1', 2, '09:00:00', '17:00:00', 30, true, '2026-05-01 14:24:25.223+00', '2026-05-01 14:24:25.223+00');
INSERT INTO public.availability_schedules VALUES ('849e53b3-fd0f-4687-a947-216364540ef0', '6b2286a2-3a19-4edb-9b1f-a7b69970c5f1', 3, '09:00:00', '17:00:00', 30, true, '2026-05-01 14:24:25.223+00', '2026-05-01 14:24:25.223+00');
INSERT INTO public.availability_schedules VALUES ('4c588186-2543-488f-8cfe-aa1a848b51c7', '6b2286a2-3a19-4edb-9b1f-a7b69970c5f1', 4, '09:00:00', '11:30:00', 30, true, '2026-05-01 14:24:25.223+00', '2026-05-01 14:24:25.223+00');
INSERT INTO public.availability_schedules VALUES ('08016314-729b-4bbc-9358-2df573d077bb', '6b2286a2-3a19-4edb-9b1f-a7b69970c5f1', 4, '16:00:00', '18:00:00', 30, true, '2026-05-01 14:24:25.223+00', '2026-05-01 14:24:25.223+00');
INSERT INTO public.availability_schedules VALUES ('caf9b40f-095c-4992-9eea-6859717fe04c', '6b2286a2-3a19-4edb-9b1f-a7b69970c5f1', 4, '19:30:00', '21:30:00', 30, true, '2026-05-01 14:24:25.223+00', '2026-05-01 14:24:25.223+00');
INSERT INTO public.availability_schedules VALUES ('5166ca1a-6909-4c73-be6f-3cb376a4be74', '6b2286a2-3a19-4edb-9b1f-a7b69970c5f1', 4, '22:30:00', '23:30:00', 30, true, '2026-05-01 14:24:25.223+00', '2026-05-01 14:24:25.223+00');
INSERT INTO public.availability_schedules VALUES ('57dd44c4-86e9-44b4-9f70-9a8506eefd58', 'a46a3bdb-8f0c-47dc-a31c-7cd5d05e8265', 1, '09:00:00', '17:00:00', 30, true, '2026-04-11 16:49:52.529+00', '2026-04-11 16:49:52.529+00');
INSERT INTO public.availability_schedules VALUES ('1985b81e-1e41-4f6f-865c-7845281f0267', 'a46a3bdb-8f0c-47dc-a31c-7cd5d05e8265', 2, '09:00:00', '17:00:00', 30, true, '2026-04-11 16:49:53.383+00', '2026-04-11 16:49:53.383+00');
INSERT INTO public.availability_schedules VALUES ('0c76cd55-f65f-4356-83cb-fd609ea11800', 'a46a3bdb-8f0c-47dc-a31c-7cd5d05e8265', 3, '09:00:00', '17:00:00', 30, true, '2026-04-11 16:49:54.236+00', '2026-04-11 16:49:54.236+00');
INSERT INTO public.availability_schedules VALUES ('5b112c23-a58d-4fd2-9e08-a2f6ee1c539e', 'a46a3bdb-8f0c-47dc-a31c-7cd5d05e8265', 4, '09:00:00', '17:00:00', 30, true, '2026-04-11 16:49:55.09+00', '2026-04-11 16:49:55.09+00');
INSERT INTO public.availability_schedules VALUES ('387cd889-a5c7-4f57-9a55-0c4e877e6ac5', 'a46a3bdb-8f0c-47dc-a31c-7cd5d05e8265', 5, '09:00:00', '17:00:00', 30, true, '2026-04-11 16:49:55.942+00', '2026-04-11 16:49:55.942+00');
INSERT INTO public.availability_schedules VALUES ('21f43dd2-ae28-4a56-814a-157ee0cb79d4', 'a46a3bdb-8f0c-47dc-a31c-7cd5d05e8265', 6, '09:00:00', '17:00:00', 30, true, '2026-04-11 16:49:56.796+00', '2026-04-11 16:49:56.796+00');
INSERT INTO public.availability_schedules VALUES ('062dbd21-d63f-466e-b49c-61a1c79276ad', '7e7b9330-0b99-4d63-b3c3-64d81cb9c815', 1, '09:00:00', '17:00:00', 30, true, '2026-04-27 13:02:41.525+00', '2026-04-27 13:02:41.525+00');
INSERT INTO public.availability_schedules VALUES ('015568f8-2d15-426f-b501-5dd56ce1aa0b', '7e7b9330-0b99-4d63-b3c3-64d81cb9c815', 2, '09:00:00', '17:00:00', 30, true, '2026-04-27 13:02:41.525+00', '2026-04-27 13:02:41.525+00');
INSERT INTO public.availability_schedules VALUES ('9f676c09-2b3a-4f0f-899d-2f456e9dc0a8', '7e7b9330-0b99-4d63-b3c3-64d81cb9c815', 3, '09:00:00', '17:00:00', 30, true, '2026-04-27 13:02:41.525+00', '2026-04-27 13:02:41.525+00');
INSERT INTO public.availability_schedules VALUES ('d20dbcab-f18a-4dd4-86a3-ab36c090a5d3', '7e7b9330-0b99-4d63-b3c3-64d81cb9c815', 4, '09:00:00', '17:00:00', 30, true, '2026-04-27 13:02:41.525+00', '2026-04-27 13:02:41.525+00');
INSERT INTO public.availability_schedules VALUES ('aa4f27c1-3cdd-49ef-a84a-8bd8c7f7eac4', '7e7b9330-0b99-4d63-b3c3-64d81cb9c815', 5, '09:00:00', '17:00:00', 30, true, '2026-04-27 13:02:41.525+00', '2026-04-27 13:02:41.525+00');
INSERT INTO public.availability_schedules VALUES ('52280ac2-6855-43cc-b886-e1c4eaad0f28', '6b2286a2-3a19-4edb-9b1f-a7b69970c5f1', 5, '09:00:00', '17:00:00', 30, true, '2026-05-01 14:24:25.223+00', '2026-05-01 14:24:25.223+00');
INSERT INTO public.availability_schedules VALUES ('583ac035-5d68-4a51-bfb1-cc23aae5f6e4', '647d4819-1c9e-4ba0-bc91-5896ff1533cf', 1, '09:00:00', '17:00:00', 30, true, '2026-05-09 06:04:28.824+00', '2026-05-09 06:04:28.824+00');
INSERT INTO public.availability_schedules VALUES ('3e0b8ece-44d6-4838-a0a3-fef238f22482', '647d4819-1c9e-4ba0-bc91-5896ff1533cf', 2, '09:00:00', '17:00:00', 30, true, '2026-05-09 06:04:28.824+00', '2026-05-09 06:04:28.824+00');
INSERT INTO public.availability_schedules VALUES ('4c7a484b-99da-4ca3-b903-794cb4036c03', '647d4819-1c9e-4ba0-bc91-5896ff1533cf', 3, '09:00:00', '17:00:00', 30, true, '2026-05-09 06:04:28.824+00', '2026-05-09 06:04:28.824+00');
INSERT INTO public.availability_schedules VALUES ('c6652ccc-81d7-4c93-b920-485b6ad318b6', '647d4819-1c9e-4ba0-bc91-5896ff1533cf', 4, '09:00:00', '17:00:00', 30, true, '2026-05-09 06:04:28.824+00', '2026-05-09 06:04:28.824+00');
INSERT INTO public.availability_schedules VALUES ('10118fb0-6ca3-4381-a3d4-86629dea2fbc', 'c5333555-5873-4df8-ae80-2ab7c9362026', 1, '09:00:00', '17:00:00', 30, true, '2026-04-22 08:48:55.786+00', '2026-04-22 08:48:55.786+00');
INSERT INTO public.availability_schedules VALUES ('a56b130f-23f5-4df3-b79f-b061983cdd62', 'c5333555-5873-4df8-ae80-2ab7c9362026', 2, '09:00:00', '17:00:00', 30, true, '2026-04-22 08:48:55.786+00', '2026-04-22 08:48:55.786+00');
INSERT INTO public.availability_schedules VALUES ('1be32645-dc70-4f6c-9a4a-136d07eda10a', 'c5333555-5873-4df8-ae80-2ab7c9362026', 3, '09:00:00', '17:00:00', 30, true, '2026-04-22 08:48:55.786+00', '2026-04-22 08:48:55.786+00');
INSERT INTO public.availability_schedules VALUES ('254d23dd-02b2-428f-aa0a-590772f92ba7', 'c5333555-5873-4df8-ae80-2ab7c9362026', 4, '09:00:00', '17:00:00', 30, true, '2026-04-22 08:48:55.786+00', '2026-04-22 08:48:55.786+00');
INSERT INTO public.availability_schedules VALUES ('9163b7ec-94d1-44d8-ba2b-d361c9db9b38', 'c5333555-5873-4df8-ae80-2ab7c9362026', 5, '09:00:00', '17:00:00', 30, true, '2026-04-22 08:48:55.786+00', '2026-04-22 08:48:55.786+00');
INSERT INTO public.availability_schedules VALUES ('9c7a652d-3f02-4693-a732-d38fb56ecc36', '647d4819-1c9e-4ba0-bc91-5896ff1533cf', 5, '09:00:00', '17:00:00', 30, true, '2026-05-09 06:04:28.824+00', '2026-05-09 06:04:28.824+00');
INSERT INTO public.availability_schedules VALUES ('25840e9c-8829-4b60-9149-95a9595e678f', '647d4819-1c9e-4ba0-bc91-5896ff1533cf', 6, '09:00:00', '17:00:00', 30, true, '2026-05-09 06:04:28.824+00', '2026-05-09 06:04:28.824+00');
INSERT INTO public.availability_schedules VALUES ('6afc0681-37d1-42e5-81cb-d719921ea49d', '647d4819-1c9e-4ba0-bc91-5896ff1533cf', 7, '09:00:00', '17:00:00', 30, true, '2026-05-09 06:04:28.824+00', '2026-05-09 06:04:28.824+00');


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.clients VALUES ('7387dbf4-2534-4be7-b7d8-a7a2642d6d68', '49ad0a8e-fac8-4351-8a44-99bb108119d1', 'cus_UT3iFNmrTWB7ry', 'Nicosia', 'Larnaca', '1010', 'CY', '2026-05-06 13:01:17.36+00', '2026-05-06 15:43:13.953883+00', NULL, NULL, NULL);
INSERT INTO public.clients VALUES ('eed755c6-786e-4f15-9297-feccb834d2eb', '50728cb4-af02-4104-857b-47cd20399695', NULL, NULL, NULL, NULL, 'IE', '2026-04-24 12:09:01.274+00', '2026-04-24 12:09:01.274+00', NULL, NULL, NULL);
INSERT INTO public.clients VALUES ('53593905-b9f7-45b1-9b6a-125b37ac608e', '41cc7d36-6d6d-4e3e-a236-e8c2e1bdf88b', 'cus_UPeoQtdcGh4Ipl', NULL, NULL, NULL, 'IE', '2026-04-11 13:31:23.949+00', '2026-04-27 13:47:16.272347+00', NULL, NULL, NULL);
INSERT INTO public.clients VALUES ('3152b032-77c2-4049-acbf-608d2eafdd9a', '1450f0c8-5ab7-4f33-bbaa-c9d571f83966', 'cus_UT4E8pFphCI8lm', 'Zuck Street', 'Larnaca', '1234', 'CY', '2026-05-06 07:51:32.859+00', '2026-05-06 16:15:08.719432+00', NULL, NULL, NULL);
INSERT INTO public.clients VALUES ('bd280669-146e-4335-bcfb-317febb94a72', 'ae72fef5-c44c-4909-804b-7ee5a2e581b9', 'cus_UQScdbz4YTkhys', '7 Kilkis Street', 'Larnaca', '6015', 'CY', '2026-04-29 10:53:29.449+00', '2026-05-07 16:16:14.044027+00', 'Image 01-05-2026 at 18.21.png', 'https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/client-ids/ae72fef5-c44c-4909-804b-7ee5a2e581b9/1777650772803-5782cf0c-c3e5-4cad-9882-4e7585dfd0bc.png', '2026-05-01 15:52:54.367+00');


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.bookings VALUES ('172b9697-e1c6-436c-9af8-0e180af0fdd1', 'bd280669-146e-4335-bcfb-317febb94a72', '6b2286a2-3a19-4edb-9b1f-a7b69970c5f1', 'cancelled', 'standard', 'Job type: One-off clean
Bedrooms: 2
Bathrooms: 1
Property condition: Normal
Cleaning supplies: Cleaner should bring supplies
Cleaner transport: Requires pickup/drop-off
Pickup location snapshot: Finikoudes bus stop, Larnaca
What needs to be cleaned: whole apartment including windows
Job photos (2): https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/booking-photos/bookings/ae72fef5-c44c-4909-804b-7ee5a2e581b9/1778323035365-1e0f2171-f5cf-424e-ae91-1dcc1d3688a8.png, https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/booking-photos/bookings/ae72fef5-c44c-4909-804b-7ee5a2e581b9/1778323038223-eafa2553-b351-48a1-bdc9-9639fced3bcb.png', 'Antoni Papadopoulou 1', 'Larnaca', '6053', 'CY', '2026-05-12 09:00:00+00', '2026-05-12 11:00:00+00', 2.00, 16.00, 32.00, 10.00, 3.20, 32.00, 35.20, 'Cancelled by client while in draft payment-required state', 'ae72fef5-c44c-4909-804b-7ee5a2e581b9', '2026-05-09 11:27:20.113+00', NULL, NULL, NULL, NULL, '2026-05-10 10:37:21.824+00', NULL, NULL, NULL, '2026-05-09 10:37:22.294+00', '2026-05-09 11:27:20.253543+00', NULL, NULL, NULL, 0, 0, 'ground floor', 'ring the doorbell when you arrive', NULL, NULL, 0, 0, '2026-05-12 09:00:00+00', false, NULL);
INSERT INTO public.bookings VALUES ('01bbdc4a-e972-4ed8-ad46-b3fcc1e3ba44', 'bd280669-146e-4335-bcfb-317febb94a72', '6b2286a2-3a19-4edb-9b1f-a7b69970c5f1', 'expired', 'standard', 'Job type: Regular clean
Bedrooms: 2
Bathrooms: 1
Property condition: Needs extra attention
Cleaning supplies: I will provide cleaning supplies
Cleaner transport: Requires pickup/drop-off
Pickup location snapshot: Finikoudes bus stop, Larnaca
What needs to be cleaned: bathroom, kitchen, bedrooms, floor and surfaces and windows
Job photos (2): https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/booking-photos/bookings/ae72fef5-c44c-4909-804b-7ee5a2e581b9/1778325850068-e95df61a-a61e-4f32-8ecc-85c106c25e44.png, https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/booking-photos/bookings/ae72fef5-c44c-4909-804b-7ee5a2e581b9/1778325855628-4112234a-18da-4d11-a5e9-59ce6420506f.png', '7 Kilkis Street', 'Larnaca', '6015', 'CY', '2026-05-14 13:00:00+00', '2026-05-14 15:00:00+00', 2.00, 16.00, 32.00, 10.00, 3.20, 32.00, 35.20, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-10 12:20:02.803+00', NULL, NULL, NULL, '2026-05-09 11:24:19.451+00', '2026-05-09 13:51:38.119512+00', NULL, NULL, NULL, 0, 0, 'ground floor', 'call me when you arrive.', NULL, NULL, 0, 0, '2026-05-14 13:00:00+00', false, NULL);
INSERT INTO public.bookings VALUES ('9ef925f5-7a31-4bcc-9fd4-735793ac5775', 'bd280669-146e-4335-bcfb-317febb94a72', '6b2286a2-3a19-4edb-9b1f-a7b69970c5f1', 'declined', 'standard', 'Job type: One-off clean
Bedrooms: 1
Bathrooms: 1
Property condition: Normal
Cleaning supplies: I will provide cleaning supplies
Cleaner transport: Requires pickup/drop-off
Pickup location snapshot: Finikoudes bus stop, finikoudes beach, Larnaca, 6023
What needs to be cleaned: whole apartment including windows and balcony.
Job photos (2): https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/booking-photos/bookings/ae72fef5-c44c-4909-804b-7ee5a2e581b9/1778350024424-67f7a445-25f8-4a03-843a-570addd9f841.png, https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/booking-photos/bookings/ae72fef5-c44c-4909-804b-7ee5a2e581b9/1778350027274-ead4a101-372f-477e-9feb-8813e02c9321.png', 'Antoni Papadopoulou 1', 'Larnaca', '6053', 'CY', '2026-05-15 06:30:00+00', '2026-05-15 08:30:00+00', 2.00, 16.00, 32.00, 10.00, 3.20, 32.00, 35.20, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-10 18:08:58.69+00', NULL, NULL, NULL, '2026-05-09 18:07:11.74+00', '2026-05-10 09:41:21.891192+00', NULL, NULL, NULL, 0, 0, 'ground floor', 'ring the doorbell when you arrive', NULL, NULL, 0, 0, '2026-05-15 06:30:00+00', false, NULL);
INSERT INTO public.bookings VALUES ('4f42275c-c9ba-41c9-b96b-2be5f5a2fae3', 'bd280669-146e-4335-bcfb-317febb94a72', '6b2286a2-3a19-4edb-9b1f-a7b69970c5f1', 'cancelled', 'standard', 'Job type: Regular clean
Bedrooms: 2
Bathrooms: 1
Property condition: Light / well maintained
Cleaning supplies: I will provide cleaning supplies
Cleaner transport: Requires pickup/drop-off
Pickup location snapshot: Finikoudes bus stop, finikoudes beach, Larnaca, 6023
What needs to be cleaned: balcony, windows, bathroom, bedrooms, surfaces and floors need mopping.
Job photos (2): https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/booking-photos/bookings/ae72fef5-c44c-4909-804b-7ee5a2e581b9/1778411697280-ab1572a0-60cf-40fd-b934-eb19d721cf80.png, https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/booking-photos/bookings/ae72fef5-c44c-4909-804b-7ee5a2e581b9/1778411701528-fce48a10-4c5d-47a2-9e48-a07f0435a741.png', 'Antoni Papadopoulou 1', 'Larnaca', '6053', 'CY', '2026-05-25 06:00:00+00', '2026-05-25 08:00:00+00', 2.00, 16.00, 32.00, 10.00, 3.20, 32.00, 35.20, 'Cancelled by client while pending cleaner acceptance', 'ae72fef5-c44c-4909-804b-7ee5a2e581b9', '2026-05-10 11:29:04.924+00', NULL, NULL, NULL, NULL, '2026-05-11 11:16:24.089+00', NULL, NULL, NULL, '2026-05-10 11:15:05.642+00', '2026-05-10 11:29:04.972455+00', NULL, NULL, NULL, 0, 0, 'ground floor', 'ring the doorbell when you arrive', NULL, NULL, 0, 0, '2026-05-25 06:00:00+00', false, NULL);
INSERT INTO public.bookings VALUES ('a58f2111-275b-43e7-aca8-5cca9e6d1f4b', '3152b032-77c2-4049-acbf-608d2eafdd9a', '647d4819-1c9e-4ba0-bc91-5896ff1533cf', 'pending', 'standard', 'Job type: Regular clean
Bedrooms: 2
Bathrooms: 2
Property condition: Light / well maintained
Cleaning supplies: I will provide cleaning supplies
Cleaner transport: Requires pickup/drop-off
Pickup location snapshot: Main buS stop, City Centre, Larnaca, 1234
What needs to be cleaned: Clean everything', 'Zuck Street', 'Larnaca', '1234', 'CY', '2026-05-15 06:00:00+00', '2026-05-15 09:00:00+00', 3.00, 25.00, 75.00, 10.00, 7.50, 75.00, 82.50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 15:55:46.074+00', NULL, NULL, NULL, '2026-05-10 15:55:16.053+00', '2026-05-10 15:56:33.415533+00', '2026-05-15 09:30:00+00', '2026-05-15 12:30:00+00', 'cleaner', 1, 0, '771/A', 'Call me when you''re at the door!', 'pre_confirmation', '2026-05-11 15:55:46.074+00', 0, 0, '2026-05-15 06:00:00+00', false, NULL);
INSERT INTO public.bookings VALUES ('1ed1c41c-9822-4a1b-9567-91bd87bc4857', 'bd280669-146e-4335-bcfb-317febb94a72', '6b2286a2-3a19-4edb-9b1f-a7b69970c5f1', 'confirmed', 'standard', 'Job type: One-off clean
Bedrooms: 2
Bathrooms: 1
Property condition: Normal
Cleaning supplies: I will provide cleaning supplies
Cleaner transport: Requires pickup/drop-off
Pickup location snapshot: Finikoudes bus stop, finikoudes beach, Larnaca, 6023
What needs to be cleaned: balcony, windows, bathroom, bedrooms, surfaces wiping and also the floors need mopping
Job photos (3): https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/booking-photos/bookings/ae72fef5-c44c-4909-804b-7ee5a2e581b9/1778417592406-bed87e44-e36c-42db-a909-a69f0baf0424.png, https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/booking-photos/bookings/ae72fef5-c44c-4909-804b-7ee5a2e581b9/1778417596364-5393ba66-7886-4da6-a89a-3e8ac4de126d.png, https://phbbzgszfbnvvksklzss.supabase.co/storage/v1/object/public/booking-photos/bookings/ae72fef5-c44c-4909-804b-7ee5a2e581b9/1778417601521-5fcc5746-caca-47f2-98c4-e774dd0ffcc2.png', 'Antoni Papadopoulou 1', 'Larnaca', '6053', 'CY', '2026-06-02 06:00:00+00', '2026-06-02 08:00:00+00', 2.00, 16.00, 32.00, 10.00, 3.20, 32.00, 35.20, NULL, NULL, NULL, '2026-05-10 18:40:34.511+00', '2026-05-10 18:40:34.511+00', NULL, NULL, '2026-05-11 12:54:33.081+00', NULL, NULL, NULL, '2026-05-10 12:53:26.74+00', '2026-05-10 18:40:34.559626+00', NULL, NULL, NULL, 0, 0, 'ground floor', 'ring the doorbell when you arrive', NULL, NULL, 0, 0, '2026-06-01 06:00:00+00', false, NULL);
INSERT INTO public.bookings VALUES ('71dc5d9a-cf42-4009-b95c-eb7645c9b210', '3152b032-77c2-4049-acbf-608d2eafdd9a', '647d4819-1c9e-4ba0-bc91-5896ff1533cf', 'accepted', 'standard', 'Job type: Regular clean
Bedrooms: 1
Bathrooms: 1
Property condition: Light / well maintained
Cleaning supplies: I will provide cleaning supplies
Cleaner transport: Requires pickup/drop-off
Pickup location snapshot: Main buS stop, City Centre, Larnaca, 1234
What needs to be cleaned: Clean everything', 'Zuck Street', 'Larnaca', '1234', 'CY', '2026-05-30 10:00:00+00', '2026-05-30 11:00:00+00', 1.00, 25.00, 25.00, 10.00, 2.50, 25.00, 27.50, NULL, NULL, NULL, '2026-05-12 07:40:27.708+00', NULL, NULL, NULL, '2026-05-13 07:33:37.939+00', '2026-05-28 10:00:00+00', NULL, NULL, '2026-05-12 07:32:38.169+00', '2026-05-12 07:45:01.899895+00', NULL, NULL, NULL, 0, 0, '771/A', 'Call me when you''re at the door!', NULL, NULL, 1, 1, '2026-05-20 06:00:00+00', true, NULL);
INSERT INTO public.bookings VALUES ('ac4f3cc6-2cdb-4133-a6e4-cb97c840ae58', '3152b032-77c2-4049-acbf-608d2eafdd9a', '647d4819-1c9e-4ba0-bc91-5896ff1533cf', 'confirmed', 'standard', 'Job type: One-off clean
Bedrooms: 4
Bathrooms: 3
Property condition: Needs extra attention
Cleaning supplies: I will provide cleaning supplies
Cleaner transport: Requires pickup/drop-off
Pickup location snapshot: Main buS stop, City Centre, Larnaca, 1234
What needs to be cleaned: Clean everything', 'Zuck Street', 'Larnaca', '1234', 'CY', '2026-05-12 13:00:00+00', '2026-05-12 14:00:00+00', 1.00, 25.00, 25.00, 10.00, 2.50, 25.00, 27.50, NULL, NULL, NULL, '2026-05-12 07:40:24.757+00', '2026-05-12 07:40:24.757+00', NULL, NULL, '2026-05-12 13:00:00+00', NULL, NULL, NULL, '2026-05-12 07:38:03.452+00', '2026-05-12 07:47:27.79564+00', '2026-05-12 11:00:00+00', '2026-05-12 12:00:00+00', 'client', 0, 0, '771/A', 'Call me when you''re at the door!', 'amend_start', '2026-05-12 08:47:27.747+00', 0, 0, '2026-05-12 13:00:00+00', false, NULL);
INSERT INTO public.bookings VALUES ('26d5b54b-c1ee-4850-b0f1-1cdf94edfb75', '3152b032-77c2-4049-acbf-608d2eafdd9a', '647d4819-1c9e-4ba0-bc91-5896ff1533cf', 'pending', 'standard', 'Job type: Regular clean
Bedrooms: 1
Bathrooms: 2
Property condition: Light / well maintained
Cleaning supplies: I will provide cleaning supplies
Cleaner transport: Requires pickup/drop-off
Pickup location snapshot: Main buS stop, City Centre, Larnaca, 1234
What needs to be cleaned: Clean everything', 'Zuck Street', 'Larnaca', '1234', 'CY', '2026-05-13 07:00:00+00', '2026-05-13 08:00:00+00', 1.00, 25.00, 25.00, 10.00, 2.50, 25.00, 27.50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-13 07:00:00+00', NULL, NULL, NULL, '2026-05-12 07:59:30.517+00', '2026-05-12 08:00:25.863601+00', NULL, NULL, NULL, 0, 0, '771/A', 'Call me when you''re at the door!', NULL, NULL, 0, 0, '2026-05-13 07:00:00+00', false, NULL);
INSERT INTO public.bookings VALUES ('a14341f7-270d-488d-be63-486bc56def48', '3152b032-77c2-4049-acbf-608d2eafdd9a', '647d4819-1c9e-4ba0-bc91-5896ff1533cf', 'pending', 'deep_clean', 'Job type: Deep clean
Bedrooms: 1
Bathrooms: 2
Property condition: Very dirty / heavy clean
Cleaning supplies: I will provide cleaning supplies
Cleaner transport: Requires pickup/drop-off
Pickup location snapshot: Main buS stop, City Centre, Larnaca, 1234
What needs to be cleaned: Clean everything', 'Zuck Street', 'Larnaca', '1234', 'CY', '2026-05-25 09:00:00+00', '2026-05-25 10:00:00+00', 1.00, 25.00, 25.00, 10.00, 2.50, 25.00, 27.50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-13 08:02:52.612+00', NULL, NULL, NULL, '2026-05-12 08:02:27.085+00', '2026-05-12 08:02:54.720565+00', NULL, NULL, NULL, 0, 0, '771/A', 'Call me when you''re at the door!', NULL, NULL, 0, 0, '2026-05-25 09:00:00+00', false, NULL);


--
-- Data for Name: blocked_times; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.blocked_times VALUES ('51d4bcdc-df9b-4ac3-a288-4c471182d1b9', '6b2286a2-3a19-4edb-9b1f-a7b69970c5f1', '2026-05-11 00:00:00+00', '2026-05-11 23:59:59.999+00', NULL, NULL, '2026-05-09 10:12:56.343+00');


--
-- Data for Name: booking_flow_drafts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.booking_flow_drafts VALUES ('8d6f4e43-dffc-401a-ace0-afaf69109773', 'bd280669-146e-4335-bcfb-317febb94a72', '6b2286a2-3a19-4edb-9b1f-a7b69970c5f1', NULL, 1, 2.00, '2026-06-02', NULL, '{"date": "2026-06-02", "step": 1, "version": 1, "duration": 2, "revision": 4, "bookingId": "", "updatedAt": "2026-05-11T17:11:56.493Z", "selectedSlot": ""}', '2026-05-11 17:11:26.96+00', '2026-05-11 17:11:59.474337+00');


--
-- Data for Name: cleaner_strikes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: client_addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.client_addresses VALUES ('f69aedbc-9ead-42a6-b80a-d2c71f37fb77', '7387dbf4-2534-4be7-b7d8-a7a2642d6d68', 'Nicosia', 'Nicosia', 'Larnaca', '1010', 'CY', NULL, '', NULL, NULL, true, '2026-05-06 13:08:14.848688+00', '2026-05-06 13:08:14.848688+00');
INSERT INTO public.client_addresses VALUES ('0caa91cc-a4d3-4dc6-a97e-b0f1cd3d0568', '3152b032-77c2-4049-acbf-608d2eafdd9a', 'Home', 'Zuck Street', 'Larnaca', '1234', 'CY', '771/A', 'Call me when you''re at the door!', NULL, NULL, true, '2026-05-06 16:11:44.302746+00', '2026-05-06 16:11:44.302746+00');
INSERT INTO public.client_addresses VALUES ('1afbb45a-49f3-45fa-9b0d-c02cba32fd6d', 'bd280669-146e-4335-bcfb-317febb94a72', 'apartment 2', '7 Kilkis Street', 'Larnaca', '6015', 'CY', NULL, '', NULL, NULL, true, '2026-05-05 16:22:48.90668+00', '2026-05-06 17:23:10.83072+00');
INSERT INTO public.client_addresses VALUES ('93653f7c-1b72-438d-9ac1-6e4dcc0fce2f', 'bd280669-146e-4335-bcfb-317febb94a72', NULL, 'Antoni Papadopoulou 1', 'Larnaca', '6053', 'CY', 'ground floor', 'ring the doorbell when you arrive', NULL, NULL, false, '2026-05-07 16:19:07.778579+00', '2026-05-07 16:19:07.778579+00');


--
-- Data for Name: client_favorites; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.client_favorites VALUES ('37fb0995-3582-4841-b9d5-4347a016f406', '3152b032-77c2-4049-acbf-608d2eafdd9a', '647d4819-1c9e-4ba0-bc91-5896ff1533cf', '2026-05-06 16:12:07.853+00');
INSERT INTO public.client_favorites VALUES ('8b6015c9-693b-47e6-b2f8-17dc3c8c4275', 'bd280669-146e-4335-bcfb-317febb94a72', '6b2286a2-3a19-4edb-9b1f-a7b69970c5f1', '2026-05-08 08:34:12.746+00');


--
-- Data for Name: disputes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: google_calendar_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.messages VALUES ('7ad1f552-6ce3-4fab-9a31-b59a4f90336a', '1ed1c41c-9822-4a1b-9567-91bd87bc4857', '9ac548b0-f037-43df-8acb-604a316b8594', 'hi', true, '2026-05-10 19:06:50.411+00');
INSERT INTO public.messages VALUES ('06f0e20e-dbff-4bcc-9b4d-fe14e252e948', '1ed1c41c-9822-4a1b-9567-91bd87bc4857', 'ae72fef5-c44c-4909-804b-7ee5a2e581b9', 'hello I am the client', true, '2026-05-11 17:09:58.448+00');


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.notifications VALUES ('b6e58a15-7ae2-421d-b4da-49f1a7ffbc92', 'ae72fef5-c44c-4909-804b-7ee5a2e581b9', 'booking_created_pending', 'Booking request created', 'Your booking request was created and sent to the cleaner.', '{"booking_id": "01bbdc4a-e972-4ed8-ad46-b3fcc1e3ba44"}', true, '2026-05-09 12:19:55.329+00');
INSERT INTO public.notifications VALUES ('61194b8d-f6f3-4fe4-8e2a-08ac26e99e6d', 'ae72fef5-c44c-4909-804b-7ee5a2e581b9', 'booking_request_expired', 'Booking request declined', 'Cleaner declined this booking request.', '{"booking_id": "01bbdc4a-e972-4ed8-ad46-b3fcc1e3ba44"}', true, '2026-05-09 13:51:41.033+00');
INSERT INTO public.notifications VALUES ('a60fa75c-7aa6-4045-9b40-3afa04bd022c', 'ae72fef5-c44c-4909-804b-7ee5a2e581b9', 'booking_created_pending', 'Booking request created', 'Your booking request was created and sent to the cleaner.', '{"booking_id": "9ef925f5-7a31-4bcc-9fd4-735793ac5775"}', true, '2026-05-09 18:08:53.13+00');
INSERT INTO public.notifications VALUES ('b34c9dc5-71a1-445f-9a30-c9c18b65955a', 'ae72fef5-c44c-4909-804b-7ee5a2e581b9', 'booking_proposed_new_time', 'Cleaner proposed a new time', 'Review and accept, decline, or counter once before the request expires.', '{"booking_id": "9ef925f5-7a31-4bcc-9fd4-735793ac5775"}', true, '2026-05-09 18:26:43.862+00');
INSERT INTO public.notifications VALUES ('a947789b-198f-476a-93af-ec3cb2888529', 'ae72fef5-c44c-4909-804b-7ee5a2e581b9', 'booking_created_pending', 'Booking request created', 'Your booking request was created and sent to the cleaner.', '{"booking_id": "4f42275c-c9ba-41c9-b96b-2be5f5a2fae3"}', true, '2026-05-10 11:16:18.57+00');
INSERT INTO public.notifications VALUES ('82160a34-0f62-4aa6-aa94-70a7f61d694a', 'ae72fef5-c44c-4909-804b-7ee5a2e581b9', 'booking_created_pending', 'Booking request created', 'Your booking request was created and sent to the cleaner.', '{"booking_id": "1ed1c41c-9822-4a1b-9567-91bd87bc4857"}', false, '2026-05-10 12:54:26.779+00');
INSERT INTO public.notifications VALUES ('7aece012-d6aa-45dd-a675-ab589fb7d9ad', 'cbf49760-284d-4f83-a422-48e7292aa0fd', 'booking_proposed_new_time', 'Client proposed a reschedule', 'Accept or decline before the 24-hour cutoff; otherwise original booking remains active.', '{"booking_id": "71dc5d9a-cf42-4009-b95c-eb7645c9b210"}', false, '2026-05-12 07:44:04.949+00');
INSERT INTO public.notifications VALUES ('53b676f4-aba3-4146-8c72-e6312e7be345', '1450f0c8-5ab7-4f33-bbaa-c9d571f83966', 'booking_payment_required', 'Card re-authorization required', 'Please re-authorize your card before 48 hours prior to the rescheduled start time.', '{"booking_id": "71dc5d9a-cf42-4009-b95c-eb7645c9b210"}', false, '2026-05-12 07:45:03.609+00');
INSERT INTO public.notifications VALUES ('5db3c1ef-fdb6-46cb-a8e5-5e645b4d8e0d', 'ae72fef5-c44c-4909-804b-7ee5a2e581b9', 'booking_proposed_new_time', 'Cleaner proposed a new time', 'Review and accept, decline, or counter once before the request expires.', '{"booking_id": "1ed1c41c-9822-4a1b-9567-91bd87bc4857"}', false, '2026-05-10 12:59:51.868+00');
INSERT INTO public.notifications VALUES ('d5ddec76-9722-4b2e-b16d-370442c536ad', 'cbf49760-284d-4f83-a422-48e7292aa0fd', 'booking_request', 'New Request', 'You have a new request from Mehul Sethia. Status: Pending Cleaner Acceptance.', '{"booking_id": "a58f2111-275b-43e7-aca8-5cca9e6d1f4b"}', false, '2026-05-10 15:55:49.868+00');
INSERT INTO public.notifications VALUES ('078187e5-b6a9-4a13-8553-472a6929db39', '1450f0c8-5ab7-4f33-bbaa-c9d571f83966', 'booking_created_pending', 'Booking request created', 'Your booking request was created and sent to the cleaner.', '{"booking_id": "a58f2111-275b-43e7-aca8-5cca9e6d1f4b"}', false, '2026-05-10 15:55:50.333+00');
INSERT INTO public.notifications VALUES ('c0782edb-72e5-456f-b9ba-8c2d1b0721fa', '1450f0c8-5ab7-4f33-bbaa-c9d571f83966', 'booking_proposed_new_time', 'Cleaner proposed a new time', 'Review and accept, decline, or counter once before the request expires.', '{"booking_id": "a58f2111-275b-43e7-aca8-5cca9e6d1f4b"}', false, '2026-05-10 15:56:35.135+00');
INSERT INTO public.notifications VALUES ('3f11edd4-ee48-4822-b719-7c232cab1750', 'ae72fef5-c44c-4909-804b-7ee5a2e581b9', 'booking_time_agreed', 'Booking time confirmed', 'The proposed booking time has been accepted and confirmed.', '{"booking_id": "1ed1c41c-9822-4a1b-9567-91bd87bc4857"}', false, '2026-05-10 18:40:36.336+00');
INSERT INTO public.notifications VALUES ('17fadc93-00f0-497d-838e-35e707813be2', '9ac548b0-f037-43df-8acb-604a316b8594', 'booking_cancelled', 'Booking Cancelled', 'A booking has been cancelled', '{"booking_id": "172b9697-e1c6-436c-9af8-0e180af0fdd1"}', true, '2026-05-09 11:27:22.156+00');
INSERT INTO public.notifications VALUES ('0417ffeb-b5b4-4c2b-ae06-f3e041a3619d', '9ac548b0-f037-43df-8acb-604a316b8594', 'booking_request', 'New Request', 'You have a new request from sam than. Status: Pending Cleaner Acceptance.', '{"booking_id": "01bbdc4a-e972-4ed8-ad46-b3fcc1e3ba44"}', true, '2026-05-09 12:19:54.855+00');
INSERT INTO public.notifications VALUES ('5a0dafa1-6ff7-417e-8ccf-1346123c1051', '9ac548b0-f037-43df-8acb-604a316b8594', 'booking_request', 'New Request', 'You have a new request from sam than. Status: Pending Cleaner Acceptance.', '{"booking_id": "9ef925f5-7a31-4bcc-9fd4-735793ac5775"}', true, '2026-05-09 18:08:52.65+00');
INSERT INTO public.notifications VALUES ('4267b8ab-0a09-43b0-9550-891829cd608a', '9ac548b0-f037-43df-8acb-604a316b8594', 'booking_request_declined', 'Booking request declined', 'This booking request was declined.', '{"booking_id": "9ef925f5-7a31-4bcc-9fd4-735793ac5775"}', true, '2026-05-10 09:41:24.829+00');
INSERT INTO public.notifications VALUES ('a45fa6f6-2c29-4024-8ebc-5920683d47f8', '9ac548b0-f037-43df-8acb-604a316b8594', 'booking_request', 'New Request', 'You have a new request from sam than. Status: Pending Cleaner Acceptance.', '{"booking_id": "4f42275c-c9ba-41c9-b96b-2be5f5a2fae3"}', true, '2026-05-10 11:16:18.101+00');
INSERT INTO public.notifications VALUES ('cfcccc2b-4705-49b1-8d02-f3f8de2d7fd3', '9ac548b0-f037-43df-8acb-604a316b8594', 'booking_cancelled', 'Booking Cancelled', 'A booking has been cancelled', '{"booking_id": "4f42275c-c9ba-41c9-b96b-2be5f5a2fae3"}', true, '2026-05-10 11:29:06.893+00');
INSERT INTO public.notifications VALUES ('dfd71b29-a152-44a8-b0e7-69f82dce4fbb', '9ac548b0-f037-43df-8acb-604a316b8594', 'booking_request', 'New Request', 'You have a new request from sam than. Status: Pending Cleaner Acceptance.', '{"booking_id": "1ed1c41c-9822-4a1b-9567-91bd87bc4857"}', true, '2026-05-10 12:54:26.307+00');
INSERT INTO public.notifications VALUES ('74380101-c321-4372-9f0a-0fcc78533d63', '9ac548b0-f037-43df-8acb-604a316b8594', 'booking_counter_proposal', 'Client sent a counter-offer', 'Accept or decline this counter-offer before the request expires.', '{"booking_id": "1ed1c41c-9822-4a1b-9567-91bd87bc4857"}', true, '2026-05-10 15:08:10.025+00');
INSERT INTO public.notifications VALUES ('5eaeb34f-19a9-419f-89c2-2ba2642472ed', 'cbf49760-284d-4f83-a422-48e7292aa0fd', 'booking_request', 'New Request', 'You have a new request from Mehul Sethia. Status: Pending Cleaner Acceptance.', '{"booking_id": "71dc5d9a-cf42-4009-b95c-eb7645c9b210"}', false, '2026-05-12 07:33:41.831+00');
INSERT INTO public.notifications VALUES ('68287658-9911-4e61-8a59-464d94e0ab49', '1450f0c8-5ab7-4f33-bbaa-c9d571f83966', 'booking_created_pending', 'Booking request created', 'Your booking request was created and sent to the cleaner.', '{"booking_id": "71dc5d9a-cf42-4009-b95c-eb7645c9b210"}', false, '2026-05-12 07:33:42.297+00');
INSERT INTO public.notifications VALUES ('724cdd19-b5d3-4e87-a7aa-dcac7b8bbdb0', 'cbf49760-284d-4f83-a422-48e7292aa0fd', 'booking_request', 'New Request', 'You have a new request from Mehul Sethia. Status: Pending Cleaner Acceptance.', '{"booking_id": "ac4f3cc6-2cdb-4133-a6e4-cb97c840ae58"}', false, '2026-05-12 07:39:07.493+00');
INSERT INTO public.notifications VALUES ('d670ee47-235d-4d50-910d-fda31db824e7', '1450f0c8-5ab7-4f33-bbaa-c9d571f83966', 'booking_created_pending', 'Booking request created', 'Your booking request was created and sent to the cleaner.', '{"booking_id": "ac4f3cc6-2cdb-4133-a6e4-cb97c840ae58"}', false, '2026-05-12 07:39:07.961+00');
INSERT INTO public.notifications VALUES ('cb80409c-f72e-4c10-be84-b32934aa1ae9', '1450f0c8-5ab7-4f33-bbaa-c9d571f83966', 'booking_accepted', 'Booking accepted', 'Cleaner accepted your booking request.', '{"booking_id": "ac4f3cc6-2cdb-4133-a6e4-cb97c840ae58"}', false, '2026-05-12 07:40:26.562+00');
INSERT INTO public.notifications VALUES ('d0bff0ce-5bea-4e6d-8578-f3ac374562b3', '1450f0c8-5ab7-4f33-bbaa-c9d571f83966', 'booking_accepted', 'Booking accepted', 'Cleaner accepted your booking request.', '{"booking_id": "71dc5d9a-cf42-4009-b95c-eb7645c9b210"}', false, '2026-05-12 07:40:29.465+00');
INSERT INTO public.notifications VALUES ('5a771ef3-0b71-4fe3-9782-26ecf3c70296', '1450f0c8-5ab7-4f33-bbaa-c9d571f83966', 'booking_time_agreed', 'Reschedule accepted', 'Booking time updated. Client re-authorization is now required.', '{"booking_id": "71dc5d9a-cf42-4009-b95c-eb7645c9b210"}', false, '2026-05-12 07:45:04.076+00');
INSERT INTO public.notifications VALUES ('27746ede-aed8-4439-8fe9-7f920b7ded71', 'cbf49760-284d-4f83-a422-48e7292aa0fd', 'booking_proposed_new_time', 'Start time amendment requested', 'Respond within 60 minutes. Counter-offers are not allowed for this amendment.', '{"booking_id": "ac4f3cc6-2cdb-4133-a6e4-cb97c840ae58"}', false, '2026-05-12 07:47:29.539+00');
INSERT INTO public.notifications VALUES ('84e6ad10-53b9-43a4-82d6-62ab9d032c2b', 'cbf49760-284d-4f83-a422-48e7292aa0fd', 'booking_request', 'New Request', 'You have a new request from Mehul Sethia. Status: Pending Cleaner Acceptance.', '{"booking_id": "26d5b54b-c1ee-4850-b0f1-1cdf94edfb75"}', false, '2026-05-12 08:00:27.595+00');
INSERT INTO public.notifications VALUES ('37ad56cf-d361-421e-9d35-edf6d18d4c1c', '1450f0c8-5ab7-4f33-bbaa-c9d571f83966', 'booking_created_pending', 'Booking request created', 'Your booking request was created and sent to the cleaner.', '{"booking_id": "26d5b54b-c1ee-4850-b0f1-1cdf94edfb75"}', false, '2026-05-12 08:00:28.073+00');
INSERT INTO public.notifications VALUES ('abfc741e-9c30-4a7a-aaba-5c311f5fd283', 'cbf49760-284d-4f83-a422-48e7292aa0fd', 'booking_request', 'New Request', 'You have a new request from Mehul Sethia. Status: Pending Cleaner Acceptance.', '{"booking_id": "a14341f7-270d-488d-be63-486bc56def48"}', false, '2026-05-12 08:02:56.458+00');
INSERT INTO public.notifications VALUES ('a4357dc1-a84f-4843-a48b-fe4948eec91e', '1450f0c8-5ab7-4f33-bbaa-c9d571f83966', 'booking_created_pending', 'Booking request created', 'Your booking request was created and sent to the cleaner.', '{"booking_id": "a14341f7-270d-488d-be63-486bc56def48"}', false, '2026-05-12 08:02:57.02+00');


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.payments VALUES ('c1d516cc-d493-41ce-8f9a-d34b8b4a783e', '172b9697-e1c6-436c-9af8-0e180af0fdd1', 'pi_3TV8GDACnTJ04f341s54koXI', NULL, NULL, NULL, 35.20, 3.20, 32.00, 'eur', 'failed', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-09 11:27:19.649+00', '2026-05-09 10:37:29.174+00', '2026-05-09 11:27:19.695476+00');
INSERT INTO public.payments VALUES ('c5c022e6-c2b7-48d3-9b8d-58cadc53c342', '01bbdc4a-e972-4ed8-ad46-b3fcc1e3ba44', 'pi_3TV8zeACnTJ04f341UNPoUun', NULL, NULL, NULL, 35.20, 3.20, 32.00, 'eur', 'failed', NULL, NULL, '2026-05-09 12:20:00.753+00', NULL, NULL, NULL, NULL, '2026-05-09 13:51:40.561+00', '2026-05-09 11:24:26.112+00', '2026-05-09 13:51:40.608574+00');
INSERT INTO public.payments VALUES ('ef319caa-274f-4c1a-830d-cf7c568c12d4', '9ef925f5-7a31-4bcc-9fd4-735793ac5775', 'pi_3TVFHWACnTJ04f340sKEwZrI', NULL, NULL, NULL, 35.20, 3.20, 32.00, 'eur', 'failed', NULL, NULL, '2026-05-09 18:08:58.69+00', NULL, NULL, NULL, NULL, '2026-05-10 09:41:24.36+00', '2026-05-09 18:07:18.41+00', '2026-05-10 09:41:24.407254+00');
INSERT INTO public.payments VALUES ('f55e7bb9-44ac-439b-acfe-f39a8660d700', '4f42275c-c9ba-41c9-b96b-2be5f5a2fae3', 'pi_3TVVKMACnTJ04f341XnjC31f', NULL, NULL, NULL, 35.20, 3.20, 32.00, 'eur', 'failed', NULL, NULL, '2026-05-10 11:16:24.089+00', NULL, NULL, NULL, NULL, '2026-05-10 11:29:04.446+00', '2026-05-10 11:15:18.606+00', '2026-05-10 11:29:04.493321+00');
INSERT INTO public.payments VALUES ('b471dc24-ad61-478f-8801-aa3107ac018f', '1ed1c41c-9822-4a1b-9567-91bd87bc4857', 'pi_3TVWrXACnTJ04f341mllKEpj', NULL, NULL, NULL, 35.20, 3.20, 32.00, 'eur', 'authorized', NULL, NULL, '2026-05-10 12:54:33.081+00', NULL, NULL, NULL, NULL, NULL, '2026-05-10 12:53:39.117+00', '2026-05-10 12:54:33.128494+00');
INSERT INTO public.payments VALUES ('35aa1b79-089a-48f4-8616-9d765f210857', 'a58f2111-275b-43e7-aca8-5cca9e6d1f4b', 'pi_3TVZhVACnTJ04f340yqVIfQr', NULL, NULL, NULL, 82.50, 7.50, 75.00, 'eur', 'authorized', NULL, NULL, '2026-05-10 15:55:46.074+00', NULL, NULL, NULL, NULL, NULL, '2026-05-10 15:55:29.378+00', '2026-05-10 15:55:46.120625+00');
INSERT INTO public.payments VALUES ('6c24810d-a007-45cc-b5ac-bb4d47314621', 'ac4f3cc6-2cdb-4133-a6e4-cb97c840ae58', 'pi_3TWAtQACnTJ04f341SRZ8NIC', NULL, NULL, NULL, 27.50, 2.50, 25.00, 'eur', 'authorized', NULL, NULL, '2026-05-12 07:39:03.544+00', NULL, NULL, NULL, NULL, NULL, '2026-05-12 07:38:16.319+00', '2026-05-12 07:39:03.706135+00');
INSERT INTO public.payments VALUES ('7f71fdbb-be86-4357-acc2-7f9da642c2f0', '71dc5d9a-cf42-4009-b95c-eb7645c9b210', 'pi_3TWAoBACnTJ04f341er5HhAv', NULL, NULL, NULL, 27.50, 2.50, 25.00, 'eur', 'failed', NULL, NULL, '2026-05-12 07:33:37.939+00', NULL, NULL, NULL, NULL, '2026-05-12 07:45:01.389+00', '2026-05-12 07:32:51.168+00', '2026-05-12 07:45:01.434843+00');
INSERT INTO public.payments VALUES ('e70591c1-55b3-4dfc-a1a1-cf49b9e5e274', '26d5b54b-c1ee-4850-b0f1-1cdf94edfb75', 'pi_3TWBEBACnTJ04f340BxP5zt1', NULL, NULL, NULL, 27.50, 2.50, 25.00, 'eur', 'authorized', NULL, NULL, '2026-05-12 08:00:23.745+00', NULL, NULL, NULL, NULL, NULL, '2026-05-12 07:59:43.509+00', '2026-05-12 08:00:23.792389+00');
INSERT INTO public.payments VALUES ('ba141559-95e4-4862-b4e8-62d09e7ad26a', 'a14341f7-270d-488d-be63-486bc56def48', 'pi_3TWBH1ACnTJ04f341KO6nuor', NULL, NULL, NULL, 27.50, 2.50, 25.00, 'eur', 'authorized', NULL, NULL, '2026-05-12 08:02:52.612+00', NULL, NULL, NULL, NULL, NULL, '2026-05-12 08:02:39.46+00', '2026-05-12 08:02:52.658984+00');


--
-- Data for Name: phone_verification_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.phone_verification_events VALUES ('b6154edb-0828-49f8-bad6-6d5107a6b969', 'cbf49760-284d-4f83-a422-48e7292aa0fd', '+918240606847', 'send', true, '2026-05-06 08:35:34.544+00');
INSERT INTO public.phone_verification_events VALUES ('bca02dc4-df43-40db-b193-537967d9a5a8', 'cbf49760-284d-4f83-a422-48e7292aa0fd', '+918240606847', 'verify', true, '2026-05-06 08:35:48.779+00');
INSERT INTO public.phone_verification_events VALUES ('3c9f8d70-af60-43dd-a176-f30f710e9546', '1450f0c8-5ab7-4f33-bbaa-c9d571f83966', '+918240606847', 'send', true, '2026-05-06 08:44:39.431+00');
INSERT INTO public.phone_verification_events VALUES ('d95c7896-6019-4d6f-9f2e-5507f3053d5f', '1450f0c8-5ab7-4f33-bbaa-c9d571f83966', '+918240606847', 'verify', true, '2026-05-06 08:45:09.852+00');
INSERT INTO public.phone_verification_events VALUES ('d35957fb-c774-467e-a50b-0aeacfde6aa2', '49ad0a8e-fac8-4351-8a44-99bb108119d1', '+35790292020202', 'send', false, '2026-05-06 15:42:59.121+00');
INSERT INTO public.phone_verification_events VALUES ('e7ce5173-789f-4938-9e13-5edf470d62d1', '49ad0a8e-fac8-4351-8a44-99bb108119d1', '+35790292020202', 'send', false, '2026-05-06 15:44:08.933+00');
INSERT INTO public.phone_verification_events VALUES ('1e682046-1e5e-4e92-bf23-ecd4edce8189', '49ad0a8e-fac8-4351-8a44-99bb108119d1', '+23409013059250', 'send', true, '2026-05-06 15:44:35.156+00');
INSERT INTO public.phone_verification_events VALUES ('a1a1ed23-5bbb-46b2-94f0-d37ad9d55e6e', '49ad0a8e-fac8-4351-8a44-99bb108119d1', '+23409013059250', 'verify', true, '2026-05-06 15:45:06.341+00');
INSERT INTO public.phone_verification_events VALUES ('ddf7620e-2fe8-44e5-a416-f903aedac5d5', 'ae72fef5-c44c-4909-804b-7ee5a2e581b9', '+35794007494', 'send', true, '2026-05-07 16:16:16.897+00');
INSERT INTO public.phone_verification_events VALUES ('cab1e17e-da84-4a24-a4e7-e0a2b8e7c31a', 'ae72fef5-c44c-4909-804b-7ee5a2e581b9', '+35794007494', 'verify', true, '2026-05-07 16:18:25.476+00');


--
-- Data for Name: platform_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.platform_config VALUES ('booking_accept_ttl', '60', 'Minutes a cleaner has to accept a booking request before it expires', '2026-04-07 19:03:10.123672+00');
INSERT INTO public.platform_config VALUES ('booking_pay_ttl', '15', 'Minutes a client has to complete payment after cleaner accepts', '2026-04-07 19:03:10.123672+00');
INSERT INTO public.platform_config VALUES ('min_hourly_rate', '15.00', 'Minimum hourly rate a cleaner can set (EUR)', '2026-04-07 19:03:10.123672+00');
INSERT INTO public.platform_config VALUES ('min_booking_hours', '1.0', 'Minimum job duration in hours', '2026-04-07 19:03:10.123672+00');
INSERT INTO public.platform_config VALUES ('platform_fee_pct', '10.00', 'Platform commission percentage taken from each booking', '2026-04-07 19:03:10.123672+00');
INSERT INTO public.platform_config VALUES ('payout_delay_hours', '24', 'Hours after job completion before cleaner payout is released', '2026-04-07 19:03:10.123672+00');


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: service_areas; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- PostgreSQL database dump complete
--

\unrestrict zTDplEoF77CeukyrciNuo1Jg6UOu34pZLtM5fBLh2aq1eGSGcjniRacdBd8ItdE

