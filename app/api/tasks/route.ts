import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/tasks - Get all personal tasks for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    // Fetch tasks for user

    const tasks = await prisma.task.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
    });

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Resolve the authenticated user in the database. This avoids
    // foreign-key violations caused by stale / invalid IDs coming from
    // the session object.
    let dbUser = null as null | { id: string };

    if (session.user.id) {
      dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    }

    if (!dbUser && session.user.email) {
      dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    }

    // On very first OAuth sign-in the adapter may not have finished
    // writing the user yet. Create a minimal record if we still cannot
    // find one.
    if (!dbUser && session.user.email) {
      dbUser = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || null,
          image: session.user.image || null,
        },
      });
    }

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = dbUser.id;
    const requestBody = await req.json();
    // Process request body
    
    const { title, category, categoryColor, subtasks, dueDate } = requestBody;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Handle subtasks - it's already a JSON string from the client
    // No need to normalize or transform it further as Prisma expects a JSON value
    // Process subtasks

    // Make sure subtasks is handled correctly for SQLite's JSON storage
    // SQLite doesn't natively support JSON, so we need to make sure it's a valid string
    // that won't cause issues with the database
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
      // Error processing subtasks
      // Default to empty array if there's an error
      subtasksToStore = '[]';
    }
    
    // Prepare subtasks for storage
    
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
      const task = await prisma.task.create({
        data: taskData,
      });
      // Task created successfully
      console.log('Task created successfully:', JSON.stringify(task));
      return NextResponse.json(task, { status: 201 });
    } catch (createError: any) {
      // Handle database error
      console.error('Database error creating task:', createError);
      throw new Error(`Database error: ${createError.message}`);
    }
  } catch (error: any) {
    // Handle error
    // Log more details about the error
    if (error.code) {
      // Log error code
    }
    if (error.meta) {
      // Log error metadata
    }
    if (error.stack) {
      // Log error stack
    }
    
    return NextResponse.json(
      { error: "Failed to create task", details: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}