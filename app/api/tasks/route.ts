import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/tasks - Get all personal tasks for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.error("Session missing or user ID missing in session:", JSON.stringify(session));
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    console.log("Fetching tasks for user ID:", userId);

    // Attempt to resolve user in the database first
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!user) {
      console.error("User not found in database with ID:", userId);
      if (session.user.email) {
        // Try to find by email as fallback
        const userByEmail = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true }
        });
        
        if (userByEmail) {
          console.log("User found by email instead of ID");
          // Use this ID instead
          const tasks = await prisma.task.findMany({
            where: { userId: userByEmail.id },
            orderBy: { createdAt: "desc" },
          });
          return NextResponse.json(tasks);
        }
      }
      return NextResponse.json([]);
    }

    // Fetch tasks for user
    const tasks = await prisma.task.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
    });

    console.log(`Found ${tasks.length} tasks for user ${userId}`);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new personal task
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Ensure we have an authenticated user in the session
    if (!session?.user) {
      console.error("No user in session:", JSON.stringify(session));
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Creating task for session user:", {
      id: session.user.id, 
      email: session.user.email
    });

    // Resolve the authenticated user in the database. This avoids
    // foreign-key violations caused by stale / invalid IDs coming from
    // the session object.
    let dbUser = null as null | { id: string };

    if (session.user.id) {
      dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
      console.log("User lookup by ID result:", !!dbUser);
    }

    if (!dbUser && session.user.email) {
      dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
      console.log("User lookup by email result:", !!dbUser);
    }

    // On very first OAuth sign-in the adapter may not have finished
    // writing the user yet. Create a minimal record if we still cannot
    // find one.
    if (!dbUser && session.user.email) {
      console.log("Creating new user record for email:", session.user.email);
      dbUser = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || null,
          image: session.user.image || null,
        },
      });
      console.log("New user created with ID:", dbUser.id);
    }

    if (!dbUser) {
      console.error("Failed to resolve or create user");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = dbUser.id;
    console.log("Resolved user ID for task creation:", userId);
    
    const requestBody = await req.json();
    // Process request body
    
    const { title, category, categoryColor, subtasks, dueDate } = requestBody;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Handle subtasks - ensure it's properly formatted for SQLite JSON storage
    let subtasksToStore;
    try {
      // Ensure subtasks is a valid JSON string - parse and re-stringify to normalize
      if (typeof subtasks === 'string') {
        // Parse to validate it's proper JSON, then stringify back
        const parsed = JSON.parse(subtasks);
        subtasksToStore = JSON.stringify(parsed);
      } else {
        // If it's not a string (e.g., it's already an object), stringify it
        subtasksToStore = JSON.stringify(subtasks || []);
      }
    } catch (e) {
      console.error("Error processing subtasks:", e);
      // Default to empty array if there's an error
      subtasksToStore = '[]';
    }
    
    // Prepare task data with the resolved user ID
    const taskData = {
      title,
      category,
      categoryColor,
      subtasks: subtasksToStore,
      dueDate: dueDate ? new Date(dueDate) : null,
      userId: userId,
    };
    
    // Create task with prepared data
    try {
      console.log('Creating task with data:', JSON.stringify(taskData));
      
      // Use a transaction to ensure data consistency
      const task = await prisma.$transaction(async (tx) => {
        // Double-check user exists in transaction
        const userCheck = await tx.user.findUnique({
          where: { id: userId },
          select: { id: true }
        });
        
        if (!userCheck) {
          throw new Error(`User with ID ${userId} not found in transaction check`);
        }
        
        return tx.task.create({
          data: taskData,
        });
      });
      
      // Task created successfully
      console.log('Task created successfully:', JSON.stringify(task));
      
      // Verify task was actually saved
      const savedTask = await prisma.task.findUnique({
        where: { id: task.id }
      });
      
      if (savedTask) {
        console.log('Verified task was saved with ID:', task.id);
      } else {
        console.error('Task verification failed - not found after save');
      }
      
      return NextResponse.json(task, { status: 201 });
    } catch (createError: any) {
      // Handle database error
      console.error('Database error creating task:', createError);
      throw new Error(`Database error: ${createError.message}`);
    }
  } catch (error: any) {
    // Enhanced error logging
    console.error("Task creation failed:", {
      message: error.message,
      code: error.code || 'unknown',
      meta: error.meta || {},
      stack: error.stack || ''
    });
    
    return NextResponse.json(
      { error: "Failed to create task", details: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}