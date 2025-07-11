CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL
);

CREATE TABLE Tickets (
    id INT IDENTITY(1,1) PRIMARY KEY,
    assigneeId INT REFERENCES Users(id),
    submitterId INT REFERENCES Users(id),
    status NVARCHAR(20),
    priority NVARCHAR(20),
    question NVARCHAR(255),
    dueDate DATETIME,
    tags NVARCHAR(MAX),
    attachments NVARCHAR(MAX),
    history NVARCHAR(MAX)
);

CREATE TABLE Assets (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    assignedTo INT REFERENCES Users(id),
    tags NVARCHAR(MAX),
    history NVARCHAR(MAX)
);
