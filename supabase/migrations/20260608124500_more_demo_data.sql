-- More comprehensive demo data for submissions and chat_logs
-- Includes multilingual chat logs, varied ai_status, escalations, and blockchain tx

INSERT INTO public.submissions (category, description, country, state, is_anonymous, ai_status, ai_response, blockchain_tx_hash, created_at)
VALUES
  ('RTI Filing', 'I requested a copy of the sanitary inspection reports for my locality and never heard back. I need help drafting a clear RTI to get specific test results.', 'IN', 'Karnataka', true, 'reviewed', 'Draft an RTI naming the municipal health department and asking specifically for inspection reports from Jan 2023 to Dec 2023. Include a scanned ID and preferred contact.', '0xdeadbeef1', now() - INTERVAL '10 days'),
  ('Welfare Benefit', 'Pension payments stopped abruptly this month with no notice. Bank rejects enquiries. I need a contact or process for grievance.', 'IN', 'Tamil Nadu', false, 'escalated', NULL, NULL, now() - INTERVAL '8 days'),
  ('Corruption Report', 'An official took my form and promised approval if I pay a fee. I am worried about identity exposure.', 'NG', 'Lagos', true, 'pending', NULL, NULL, now() - INTERVAL '15 days'),
  ('Legal Help', 'Police issued a notice but did not file an FIR; I need counsel on rights and next steps.', 'PK', 'Sindh', false, 'processed', 'Collect witness statements and visit the local legal aid office; request FIR in writing.', '0xdeadbeef2', now() - INTERVAL '20 days'),
  ('Ration Card', 'My family recently moved provinces and our subsidy is missing from the new portal.', 'IN', 'Maharashtra', false, 'answered', 'Apply for transfer and upload proof of address and previous ration card. Keep acknowledgement.', '0xdeadbeef3', now() - INTERVAL '3 days'),
  ('Birth Registration', 'My newborn did not get a birth certificate after hospital discharge; how to register?', 'BD', 'Dhaka', false, 'reviewed', 'Visit the municipal office with hospital discharge papers and ID; apply under late registration if necessary.', NULL, now() - INTERVAL '12 days'),
  ('ID Card', 'I lost my voter ID and need to reissue quickly before elections.', 'IN', 'Uttar Pradesh', false, 'pending', NULL, NULL, now() - INTERVAL '2 days'),
  ('Public Works', 'Road repair stalled for months after complaint; contractor not responding.', 'KE', 'Nairobi', true, 'escalated', NULL, '0xdeadbeef4', now() - INTERVAL '7 days'),
  ('Housing', 'My eviction notice lacks due process; landlord is bypassing rules.', 'ZA', 'Gauteng', false, 'processed', 'Collect notices and lease, approach the housing tribunal for urgent relief.', NULL, now() - INTERVAL '1 days'),
  ('Health Services', 'Clinic denied services citing missing document; urgent pregnancy care needed.', 'IN', 'Assam', false, 'escalated', NULL, NULL, now() - INTERVAL '4 days');

INSERT INTO public.chat_logs (query, response, category, language, country, was_escalated, created_at)
VALUES
  ('How to file RTI for sanitation tests?', 'Use the RTI portal or send to PIO with exact sample IDs and dates. Ask for lab chain-of-custody documents.', 'RTI Filing', 'en', 'IN', false, now() - INTERVAL '9 days'),
  ('¿Cómo puedo presentar una queja sobre el servicio médico?', 'Contacte al oficial de salud local y solicite por escrito el registro de queja; si no responde, presente la queja al nivel estatal.', 'Health Services', 'es-ES', 'ES', false, now() - INTERVAL '6 days'),
  ('我如何申请新的配给卡？', '请在省级门户更新地址并提交所需证件。等待确认号码并保存收据。', 'Ration Card', 'zh-CN', 'CN', false, now() - INTERVAL '5 days'),
  ('Where to report bribery anonymously?', 'Use anti-corruption hotline or online portal. Preserve any receipts and avoid sharing unnecessary personal information.', 'Corruption Report', 'en', 'IN', true, now() - INTERVAL '14 days'),
  ('Legal eviction notice without process, what to do?', 'Document all interactions, contact legal aid and request interim relief from the court; do not vacate without an order.', 'Legal Help', 'en', 'IN', false, now() - INTERVAL '18 days'),
  ('How to transfer ration card to new district?', 'Apply for transfer on the state portal with proof of new address and old card details.', 'Ration Card', 'en', 'IN', false, now() - INTERVAL '4 days'),
  ('Where get free legal aid in Karachi?', 'Sindh has legal aid clinics at the district courts; contact the legal aid cell for appointment.', 'Legal Help', 'en', 'PK', false, now() - INTERVAL '19 days'),
  ('My pension stopped; who to contact?', 'Contact the pension disbursing authority and your local welfare officer; request a written status and escalate to central helpline.', 'Welfare Benefit', 'en', 'IN', true, now() - INTERVAL '7 days'),
  ('How to get a birth certificate late registration?', 'Provide hospital discharge papers and ID; some jurisdictions accept late registration with affidavit.', 'Birth Registration', 'en', 'BD', false, now() - INTERVAL '11 days'),
  ('Can I report contractor corruption safely?', 'File a formal complaint with public works inspectorate and request a review; consider anonymous reporting if safety is a concern.', 'Public Works', 'en', 'KE', true, now() - INTERVAL '6 days');

-- End of expanded demo data
