module.exports = {
  users: [
    {
      id: 1,
      name: "Brian",
      salt: "c611add510604607",
      passwordHash:
        "eb0412b9cbffea6e0c04371d0916ed33279aa2841ffcc5fb89fed640493db5ac",
    },
    {
      id: 2,
      name: "Alice",
      salt: "70a0082def25687f",
      passwordHash:
        "138b21788bfc2745656abf0616264ee6b3773c0001c1ce5ee070c821ae99dcf5",
    },
  ],
  tickets: [
    {
      id: 2353,
      assigneeId: 1,
      submitterId: 2,
      status: "waiting",
      priority: "medium",
      question: "How do I reset my password?",
      dueDate: "2024-06-01T12:00:00Z",
      tags: ["password", "login"],
      comments: [],
      attachments: [
        {
          id: 1,
          name: "screenshot.png",
          url: "http://example.com/screenshot.png",
          uploaded: "2024-05-01T12:00:00Z",
        },
      ],
      history: [{ action: "created", by: 2, date: "2024-05-01T12:00:00Z" }],
    },
    {
      id: 2354,
      assigneeId: 1,
      submitterId: 2,
      status: "open",
      priority: "low",
      question: "How to configure email settings?",
      dueDate: "2024-07-01T12:00:00Z",
      tags: ["configuration"],
      comments: [],
      attachments: [],
      history: [{ action: "created", by: 2, date: "2024-05-10T12:00:00Z" }],
    },
    {
      id: 2355,
      assigneeId: 2,
      submitterId: 1,
      status: "closed",
      priority: "high",
      question: "Why is the network slow?",
      dueDate: "2024-05-15T12:00:00Z",
      tags: ["network"],
      comments: [],
      attachments: [],
      history: [
        { action: "created", by: 1, date: "2024-05-11T12:00:00Z" },
        {
          action: "status",
          from: "open",
          to: "closed",
          by: 2,
          date: "2024-05-12T12:00:00Z",
        },
      ],
    },
  ],
  assets: [
    { id: 1, name: "Laptop", assignedTo: 1, history: [], tags: [] },
    { id: 2, name: "Headset", assignedTo: 2, history: [], tags: [] },
  ],
};
