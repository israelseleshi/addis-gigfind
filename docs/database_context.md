# Addis GigFind Live Data (Admin Export)

Exported on: 4/6/2026, 9:56:32 AM

---

## Table: profiles

**Total Rows Found:** 5

| id | full_name | role | phone_number | avatar_url | bio | location_sub_city | verification_status | average_rating | reviews_count | created_at | updated_at | is_onboarding_complete | is_banned | ban_reason | location |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| dc5ba84c-62e1-4744-97d1-fa652df9e8ab | abel | client | null | null | null | null | unverified | 0 | 0 | 2026-01-25T10:48:21.777627+00:00 | 2026-01-25T10:48:21.777627+00:00 | false | false | null | null |
| a20a98a0-6e00-4fae-99a6-69e13f4846e5 | System Administrator | admin | null | null | null | null | verified | 0 | 0 | 2026-01-27T08:55:08.102216+00:00 | 2026-01-27T08:55:08.102216+00:00 | false | false | null | null |
| a14f1026-3f8d-43d6-b9ea-17dd7aff5967 | Israel Seleshi | freelancer | null | https://antdjephswvrvbyxukqu.supabase.co/storage/v1/object/public/profile_pictures/a14f1026-3f8d-43d6-b9ea-17dd7aff5967/1769748795109.jpg | null | null | verified | 0 | 0 | 2026-01-26T06:23:23.714604+00:00 | 2026-01-26T06:23:23.714604+00:00 | false | false | null | null |
| 26a290f5-35a2-4a13-952c-3f6cd23d2b01 | Israel Theodros | client | null | https://antdjephswvrvbyxukqu.supabase.co/storage/v1/object/public/profile_pictures/26a290f5-35a2-4a13-952c-3f6cd23d2b01/1773323810111.png | null | null | unverified | 0 | 0 | 2026-01-27T06:04:54.810556+00:00 | 2026-01-27T06:04:54.810556+00:00 | false | false | null | null |
| 31b6acb3-da37-47af-951c-267d2a6e86f5 | John Locke | client | null | null | null | null | unverified | 0 | 0 | 2026-03-23T17:05:21.019538+00:00 | 2026-03-23T17:05:21.019538+00:00 | false | false | null | null |

---
## Table: client_profiles

**Total Rows Found:** 0

_No data returned. Check if the table is empty._

## Table: freelancer_profiles

**Total Rows Found:** 0

_No data returned. Check if the table is empty._

## Table: gigs

**Total Rows Found:** 5

| id | client_id | title | description | category | budget | status | created_at | updated_at | payment_status | payment_id | location |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 248d7adf-2c67-4c74-bffa-5bd4cd84bd57 | 26a290f5-35a2-4a13-952c-3f6cd23d2b01 | House Painter Needed | We need a painter by tomorrow at our house at Bole Apartments. | design | 3000 | assigned | 2026-01-29T14:42:51.466496+00:00 | 2026-01-29T14:42:51.466496+00:00 | unpaid | null | null |
| be002f3e-4eb0-4b79-9c76-05a89e4ffaa7 | 26a290f5-35a2-4a13-952c-3f6cd23d2b01 | Electrician Needed | Need to fix Faulty line around piasa  | electrical | 3000 | open | 2026-03-12T13:55:03.489452+00:00 | 2026-03-12T13:55:03.489452+00:00 | unpaid | null | null |
| ec4c5e43-c592-48a0-8deb-7b4640de89fa | 26a290f5-35a2-4a13-952c-3f6cd23d2b01 | Konso Traditional Attire Photoshoot | We have been looking for a skilled photographer to capture our new line of Konso traditional clothing. The photoshoot will take place outdoors to highlight the vibrant colors and intricate designs of the garments. | design | 15000 | in_progress | 2026-01-27T07:27:08.602283+00:00 | 2026-01-27T07:27:08.602283+00:00 | unpaid | null | null |
| 42bebd4d-e444-43cd-9d42-90939b0bb5e4 | 26a290f5-35a2-4a13-952c-3f6cd23d2b01 | Tutor Needed | We need a tutor for our son. He is 4th grade student. | tutoring | 3000 | assigned | 2026-01-30T06:16:22.668939+00:00 | 2026-01-30T06:16:22.668939+00:00 | unpaid | null | null |
| 6a9fb679-0689-43f9-aebf-d9966d33a0e4 | 26a290f5-35a2-4a13-952c-3f6cd23d2b01 | 6th Grade Tutor Needed | I need tutor for my 6th grade son. | tutoring | 4500 | assigned | 2026-04-06T04:42:06.219269+00:00 | 2026-04-06T04:42:06.219269+00:00 | unpaid | null | 0101000020E61000002EFB75A73B60434052280B5F5F012240 |

---
## Table: applications

**Total Rows Found:** 5

| id | gig_id | freelancer_id | cover_note | bid_amount | status | created_at | coins_spent | payment_tx_ref |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| c3ee2537-1026-4386-ab56-88ef86fda1c1 | ec4c5e43-c592-48a0-8deb-7b4640de89fa | a14f1026-3f8d-43d6-b9ea-17dd7aff5967 | I have 4 years experience. And I need this work really. | null | accepted | 2026-01-28T06:53:08.277449+00:00 | 0 | null |
| e73b1285-fc68-4249-a41d-247deffa097e | 248d7adf-2c67-4c74-bffa-5bd4cd84bd57 | a14f1026-3f8d-43d6-b9ea-17dd7aff5967 | I am painter and I have worked for 5 years and with clients. | null | accepted | 2026-01-30T06:12:13.962404+00:00 | 0 | null |
| 419b08c9-ce2e-4357-a609-fbe6f802de21 | 42bebd4d-e444-43cd-9d42-90939b0bb5e4 | a14f1026-3f8d-43d6-b9ea-17dd7aff5967 | hello G am looking for a job man has to eat | null | accepted | 2026-03-24T13:43:32.636852+00:00 | 0 | null |
| 988d1d5c-9130-4530-9e8e-972607c2c031 | be002f3e-4eb0-4b79-9c76-05a89e4ffaa7 | a14f1026-3f8d-43d6-b9ea-17dd7aff5967 | sdgsdgds sdfgsd gfs gf | null | rejected | 2026-03-23T17:16:08.728745+00:00 | 0 | null |
| 6b0e4d40-b4f7-4b1b-b654-f557cddf66e0 | 6a9fb679-0689-43f9-aebf-d9966d33a0e4 | a14f1026-3f8d-43d6-b9ea-17dd7aff5967 | I am a top performing student at ABC School. And I need extra cash. So I want to apply for this job. | null | accepted | 2026-04-06T05:19:21.375015+00:00 | 1 | null |

---
## Table: user_wallets

**Total Rows Found:** 2

| id | user_id | coin_balance | total_coins_spent | total_earned_etb | created_at | updated_at |
| --- | --- | --- | --- | --- | --- | --- |
| 8170f477-1606-4fe5-aee4-7d565741347e | 26a290f5-35a2-4a13-952c-3f6cd23d2b01 | 5 | 0 | 0 | 2026-04-06T05:08:59.124473+00:00 | 2026-04-06T05:08:59.124473+00:00 |
| ef115533-eb57-4c1b-9221-c4c0e21a1784 | a14f1026-3f8d-43d6-b9ea-17dd7aff5967 | 29 | 1 | 0 | 2026-04-05T19:23:44.987137+00:00 | 2026-04-06T05:19:16.86567+00:00 |

---
## Table: coin_purchases

**Total Rows Found:** 3

| id | user_id | package_id | coins_purchased | amount_paid_etb | payment_tx_ref | status | created_at |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 697887a9-653b-4dd1-9e02-35e3268d3e49 | a14f1026-3f8d-43d6-b9ea-17dd7aff5967 | starter | 10 | 100 | coin-starter-a14f1026-1775416180288 | pending | 2026-04-05T19:09:41.790864+00:00 |
| 025b1381-d66f-4430-86b3-0081a0adada7 | a14f1026-3f8d-43d6-b9ea-17dd7aff5967 | pro | 25 | 200 | coin-pro-a14f1026-1775416608766 | pending | 2026-04-05T19:16:51.852829+00:00 |
| 4b6035f4-600c-4349-8d09-5eceac305d5a | a14f1026-3f8d-43d6-b9ea-17dd7aff5967 | pro | 25 | 200 | coin-pro-a14f1026-1775417001692 | completed | 2026-04-05T19:23:23.191011+00:00 |

---
## Table: payments

**Total Rows Found:** 0

_No data returned. Check if the table is empty._

## Table: reviews

**Total Rows Found:** 0

_No data returned. Check if the table is empty._

## Table: conversations

**Total Rows Found:** 1

| id | gig_id | participant_ids | created_at | updated_at |
| --- | --- | --- | --- | --- |
| 38889a55-15a3-4fe1-8666-5ea817f91ddf | ec4c5e43-c592-48a0-8deb-7b4640de89fa | a14f1026-3f8d-43d6-b9ea-17dd7aff5967,26a290f5-35a2-4a13-952c-3f6cd23d2b01 | 2026-01-29T11:48:37.72608+00:00 | 2026-01-29T11:48:37.72608+00:00 |

---
## Table: messages

**Total Rows Found:** 3

| id | gig_id | sender_id | recipient_id | content | created_at | read | conversation_id |
| --- | --- | --- | --- | --- | --- | --- | --- |
| afe8c8d8-b899-4bd1-9a2d-6892c35479fe | ec4c5e43-c592-48a0-8deb-7b4640de89fa | 26a290f5-35a2-4a13-952c-3f6cd23d2b01 | a14f1026-3f8d-43d6-b9ea-17dd7aff5967 | Hello I gave you task for photoshoot will you be able to come today at 2 AM? | 2026-03-24T18:59:46.729581+00:00 | true | 38889a55-15a3-4fe1-8666-5ea817f91ddf |
| b4d8b001-1a37-4226-9d91-7d2204d80921 | ec4c5e43-c592-48a0-8deb-7b4640de89fa | 26a290f5-35a2-4a13-952c-3f6cd23d2b01 | a14f1026-3f8d-43d6-b9ea-17dd7aff5967 | hi | 2026-03-24T19:00:05.187183+00:00 | true | 38889a55-15a3-4fe1-8666-5ea817f91ddf |
| b4bbac9f-d542-4ed3-9ec3-34a8944b01e0 | ec4c5e43-c592-48a0-8deb-7b4640de89fa | 26a290f5-35a2-4a13-952c-3f6cd23d2b01 | a14f1026-3f8d-43d6-b9ea-17dd7aff5967 | hellooooo | 2026-03-24T19:10:32.237053+00:00 | false | 38889a55-15a3-4fe1-8666-5ea817f91ddf |

---
## Table: notifications

**Total Rows Found:** 0

_No data returned. Check if the table is empty._

## Table: otp_verifications

**Total Rows Found:** 0

_No data returned. Check if the table is empty._

## Table: telegram_accounts

**Total Rows Found:** 2

| id | user_id | telegram_user_id | telegram_chat_id | telegram_username | telegram_first_name | telegram_last_name | is_active | linked_at | last_seen_at |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 43731bea-99ec-4cdf-8a66-c016c8ca50c7 | 26a290f5-35a2-4a13-952c-3f6cd23d2b01 | 330178414 | 330178414 | israeltheodros | Israel | Theodros | true | 2026-03-24T09:58:32+00:00 | 2026-03-24T10:03:43.242+00:00 |
| 97b6a7da-d4a1-444d-b8e6-6a9276e16eae | a14f1026-3f8d-43d6-b9ea-17dd7aff5967 | 2138559071 | 2138559071 | pychess00 | Абэл | null | true | 2026-03-24T09:51:17.675+00:00 | 2026-03-24T12:27:35.607+00:00 |

---
## Table: telegram_link_codes

**Total Rows Found:** 2

| id | user_id | code | expires_at | consumed_at | created_at |
| --- | --- | --- | --- | --- | --- |
| 2275244e-bfb0-4d76-862a-40a5407d1119 | a14f1026-3f8d-43d6-b9ea-17dd7aff5967 | 67B83865 | 2026-03-24T09:55:30.051+00:00 | 2026-03-24T09:51:17.829+00:00 | 2026-03-24T09:45:30.563576+00:00 |
| 44f8b627-65e7-4b27-be7e-a4983ef5f2f7 | 26a290f5-35a2-4a13-952c-3f6cd23d2b01 | 92111684 | 2026-03-24T10:08:25.047+00:00 | 2026-03-24T09:58:32.117+00:00 | 2026-03-24T09:58:25.221137+00:00 |

---
## Table: verification_documents

**Total Rows Found:** 1

| id | user_id | document_type | front_image_url | back_image_url | submitted_at | admin_notes | description | id_number | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| c1c2085b-7cf9-45b6-916a-13174bbb40f2 | a14f1026-3f8d-43d6-b9ea-17dd7aff5967 | kebele | https://antdjephswvrvbyxukqu.supabase.co/storage/v1/object/public/verification-docs/a14f1026-3f8d-43d6-b9ea-17dd7aff5967/verification/front-1769579169339 | null | 2026-01-28T05:46:10.291952+00:00 | null |  | 00499093 | verified |

---
## Table: user_verification_status

**Total Rows Found:** 5

| id | email | email_confirmed_at | email_verification_status | full_name | role | id_verification_status | verification_exempt | created_at |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| dc5ba84c-62e1-4744-97d1-fa652df9e8ab | abeltheodor12@gmail.com | 2026-01-25T10:48:41.310826+00:00 | verified | abel | client | unverified | false | 2026-01-25T10:48:21.779296+00:00 |
| a20a98a0-6e00-4fae-99a6-69e13f4846e5 | joyseleshi@gmail.com | 2026-01-27T08:56:38.564976+00:00 | verified | System Administrator | admin | verified | true | 2026-01-27T08:55:08.102583+00:00 |
| a14f1026-3f8d-43d6-b9ea-17dd7aff5967 | israelseleshi09@gmail.com | 2026-01-26T06:23:48.024465+00:00 | verified | Israel Seleshi | freelancer | verified | false | 2026-01-26T06:23:23.720623+00:00 |
| 26a290f5-35a2-4a13-952c-3f6cd23d2b01 | israeltheodros09@gmail.com | 2026-01-27T06:05:08.200934+00:00 | verified | Israel Theodros | client | unverified | false | 2026-01-27T06:04:54.811523+00:00 |
| 31b6acb3-da37-47af-951c-267d2a6e86f5 | vevelav370@paylaar.com | 2026-03-23T17:05:21.152743+00:00 | verified | John Locke | client | unverified | false | 2026-03-23T17:04:29.260709+00:00 |

---
