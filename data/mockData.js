module.exports = {
  users: [
    { id: 1, name: 'Brian' },
    { id: 2, name: 'Alice' }
  ],
  tickets: [
    {
      id: 2353,
      assigneeId: 1,
      submitterId: 2,
      status: 'waiting',
      priority: 'medium',
      question: 'How do I reset my password?',
      dueDate: '2024-06-01T12:00:00Z',
      tags: ['password', 'login'],
      comments: [],
      attachments: [
        { id: 1, name: 'screenshot.png', url: 'http://example.com/screenshot.png', uploaded: '2024-05-01T12:00:00Z' }
      ]
    },
    {
      id: 2354,
      assigneeId: 1,
      submitterId: 2,
      status: 'open',
      priority: 'low',
      question: 'How to configure email settings?',
      dueDate: '2024-07-01T12:00:00Z',
      tags: ['configuration'],
      comments: [],
      attachments: []
    }
  ]
  ,
  assets: [
    { id: 1, name: 'Laptop', assignedTo: 1 },
    { id: 2, name: 'Headset', assignedTo: 2 }
  ]
};
