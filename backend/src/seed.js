import bcrypt from 'bcrypt';
import db from './config/database.js';

async function seed() {
  console.log('🌱 Starting database seed...');
  try {
    // 1. Clear existing test data
    await db.query('DELETE FROM messages');
    await db.query('DELETE FROM conversations');
    await db.query('DELETE FROM users');

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('password123', saltRounds);

    // 2. Create customer
    const clientRes = await db.query(
      `INSERT INTO users (fullname, email, passwordhash, role, isonline, createdat)
       VALUES ($1, $2, $3, $4, false, NOW())
       RETURNING id, fullname, email, role`,
      ['Sarah Connor', 'client@souqexpress.com', passwordHash, 'client']
    );
    const client = clientRes.rows[0];
    console.log(`✅ Created Client user: ${client.email} (ID: ${client.id})`);

    // 3. Create support agent
    const agentRes = await db.query(
      `INSERT INTO users (fullname, email, passwordhash, role, isonline, createdat)
       VALUES ($1, $2, $3, $4, false, NOW())
       RETURNING id, fullname, email, role`,
      ['Alex Support', 'agent@souqexpress.com', passwordHash, 'agent']
    );
    const agent = agentRes.rows[0];
    console.log(`✅ Created Agent user: ${agent.email} (ID: ${agent.id})`);

    // 4. Create sample conversation (Pending)
    const conv1 = await db.query(
      `INSERT INTO conversations (subject, status, clientid, agentid, createdat)
       VALUES ($1, 'pending', $2, NULL, NOW() - INTERVAL '10 minutes')
       RETURNING id, subject, status`,
      ['Delivery Tracking Issue - Order #4092', client.id]
    );
    console.log(`✅ Created Pending conversation: #${conv1.rows[0].id}`);

    // Initial message
    await db.query(
      `INSERT INTO messages (conversationid, senderid, content, isread, sentat)
       VALUES ($1, $2, $3, false, NOW() - INTERVAL '10 minutes')`,
      [conv1.rows[0].id, client.id, 'Hello, my package status has been stuck on "In Transit" for 4 days. Can you please check?']
    );

    // 5. Create sample conversation (In Progress)
    const conv2 = await db.query(
      `INSERT INTO conversations (subject, status, clientid, agentid, createdat)
       VALUES ($1, 'in_progress', $2, $3, NOW() - INTERVAL '1 hour')
       RETURNING id, subject, status`,
      ['Return & Refund Inquiry', client.id, agent.id]
    );
    console.log(`✅ Created In-Progress conversation: #${conv2.rows[0].id}`);

    await db.query(
      `INSERT INTO messages (conversationid, senderid, content, isread, sentat)
       VALUES ($1, $2, $3, true, NOW() - INTERVAL '1 hour')`,
      [conv2.rows[0].id, client.id, 'I received the wrong item size and would like to initiate an exchange.']
    );

    await db.query(
      `INSERT INTO messages (conversationid, senderid, content, isread, sentat)
       VALUES ($1, $2, $3, true, NOW() - INTERVAL '45 minutes')`,
      [conv2.rows[0].id, agent.id, 'Hi Sarah! I can assist you with that right away. Could you please share a photo of the item barcode?']
    );

    console.log('\n🎉 Seed finished successfully!');
    console.log('----------------------------------------------------');
    console.log('Customer Account: client@souqexpress.com / password123');
    console.log('Support Agent:    agent@souqexpress.com  / password123');
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
