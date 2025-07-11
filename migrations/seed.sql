INSERT INTO Users (name) VALUES ('Brian');
INSERT INTO Users (name) VALUES ('Alice');

INSERT INTO Tickets (assigneeId, submitterId, status, priority, question, dueDate, tags, attachments, history)
VALUES
  (1, 2, 'waiting', 'medium', 'How do I reset my password?', '2024-06-01T12:00:00Z', '["password","login"]', '[]', '[{"action":"created","by":2,"date":"2024-05-01T12:00:00Z"}]'),
  (1, 2, 'open', 'low', 'How to configure email settings?', '2024-07-01T12:00:00Z', '["configuration"]', '[]', '[{"action":"created","by":2,"date":"2024-05-10T12:00:00Z"}]'),
  (2, 1, 'closed', 'high', 'Why is the network slow?', '2024-05-15T12:00:00Z', '["network"]', '[]', '[{"action":"created","by":1,"date":"2024-05-11T12:00:00Z"},{"action":"status","from":"open","to":"closed","by":2,"date":"2024-05-12T12:00:00Z"}]');

INSERT INTO Assets (name, assignedTo, tags, history)
VALUES
  ('Laptop', 1, '[]', '[]'),
  ('Headset', 2, '[]', '[]');
