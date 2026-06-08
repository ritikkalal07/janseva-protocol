-- Seed demo submissions and chat logs for local/dev testing

INSERT INTO public.submissions (category, description, country, state, is_anonymous, ai_status, ai_response, blockchain_tx_hash)
VALUES
  ('RTI Filing', 'I filed an RTI request with the municipal office but received no acknowledgement. I need help escalating this and finding the proper PIO contact.', 'IN', 'Karnataka', true, 'reviewed', 'Contact the Public Information Officer (PIO) for the municipal office and provide proof of submission. If there is no response within 30 days, file an appeal to the State Information Commission.', '0xabc123demo1'),
  ('Welfare Benefit', 'My ration card application shows as rejected. I was told to re-submit but the portal gives no reason. How can I get a written rejection and appeal?', 'IN', 'Telangana', false, 'reviewed', 'Request a written rejection from the local office, gather supporting documents, and submit an appeal with documentary evidence.', '0xabc123demo2'),
  ('Corruption Report', 'An official demanded a bribe to process my pension. I fear retaliation. How do I report this safely?', 'IN', 'West Bengal', true, 'pending', NULL, NULL),
  ('Legal Help', 'My landlord is illegally evicting me without notice. I need free legal assistance and the best local clinics to contact.', 'IN', 'Delhi', false, 'reviewed', 'Collect lease and identity documents, contact nearby legal aid clinics or civil legal services for immediate help, and seek an injunction if eviction is imminent.', '0xabc123demo3'),
  ('Ration Card', 'I moved districts and my ration card is not recognized. How to transfer or reissue?', 'IN', 'Maharashtra', false, 'processed', 'Apply for a transfer through the state ration portal with updated address proof. Keep receipts and follow up with the local office.', '0xabc123demo4');

INSERT INTO public.chat_logs (query, response, category, language, country, was_escalated)
VALUES
  ('How do I file an RTI application?', 'Prepare a short RTI request naming the public body, the PIO, and the exact information you want. Submit by hand or online and keep proof of submission.', 'RTI Filing', 'en', 'IN', false),
  ('My welfare benefit was rejected unfairly. What next?', 'Ask for a written reason for rejection, collect supporting documents, and file an appeal per the scheme guidelines.', 'Welfare Benefit', 'en', 'IN', true),
  ('Who can I contact about corruption in the local office?', 'Contact the anti-corruption helpline, preserve evidence, and consider an anonymous complaint if safety is a concern.', 'Corruption Report', 'en', 'IN', true),
  ('Where to find free legal aid near me?', 'Search for state legal services authorities and pro bono clinics; many districts have legal aid cells at the district court.', 'Legal Help', 'en', 'IN', false);

-- End of demo seed data
