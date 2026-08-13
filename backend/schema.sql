CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    passwordhash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'client' CHECK (role IN ('client', 'agent')),
    isonline BOOLEAN DEFAULT FALSE,
    createdat TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'closed')),
    clientid INTEGER REFERENCES users(id) ON DELETE CASCADE,
    agentid INTEGER REFERENCES users(id) ON DELETE SET NULL,
    createdat TIMESTAMP DEFAULT NOW(),
    closedat TIMESTAMP DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversationid INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    senderid INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    isread BOOLEAN DEFAULT FALSE,
    sentat TIMESTAMP DEFAULT NOW()
);
