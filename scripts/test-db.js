// Simple script to test database connection
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Test connection by getting user count
    const userCount = await prisma.user.count();
    console.log(`Database connection successful! User count: ${userCount}`);
    
    // List all tables
    console.log('\nDatabase schema:');
    
    // Check each table individually to avoid errors if one fails
    try {
      const userCount = await prisma.user.count();
      console.log(`- User: ${userCount} records`);
    } catch (e) {
      console.log(`- User: Error accessing table`);
    }
    
    try {
      const taskCount = await prisma.task.count();
      console.log(`- Task: ${taskCount} records`);
    } catch (e) {
      console.log(`- Task: Error accessing table`);
    }
    
    try {
      const groupTaskCount = await prisma.groupTask.count();
      console.log(`- GroupTask: ${groupTaskCount} records`);
    } catch (e) {
      console.log(`- GroupTask: Error accessing table`);
    }
    
    try {
      const assigneeCount = await prisma.groupTaskAssignee.count();
      console.log(`- GroupTaskAssignee: ${assigneeCount} records`);
    } catch (e) {
      console.log(`- GroupTaskAssignee: Error accessing table`);
    }
    
    try {
      const commentCount = await prisma.comment.count();
      console.log(`- Comment: ${commentCount} records`);
    } catch (e) {
      console.log(`- Comment: Error accessing table`);
    }
    
    try {
      const friendshipCount = await prisma.friendship.count();
      console.log(`- Friendship: ${friendshipCount} records`);
    } catch (e) {
      console.log(`- Friendship: Error accessing table`);
    }
    
    console.log('\nSQLite database is working correctly!');
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();