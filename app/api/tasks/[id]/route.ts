import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/tasks/[id] - Get a specific task
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user in database or create minimal record if needed
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user && session.user.id) {
      // Try to find user by ID as fallback
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user.id;
    const taskId = params.id;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Ensure the user owns this task
    if (task.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks/[id] - Update a task
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user in database or create minimal record if needed
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user && session.user.id) {
      // Try to find user by ID as fallback
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user.id;
    const taskId = params.id;

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (existingTask.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { title, completed, category, categoryColor, subtasks, dueDate } = await req.json();

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: {
        title: title !== undefined ? title : undefined,
        completed: completed !== undefined ? completed : undefined,
        category: category !== undefined ? category : undefined,
        categoryColor: categoryColor !== undefined ? categoryColor : undefined,
        subtasks: subtasks !== undefined ? subtasks : undefined,
        dueDate: dueDate !== undefined ? new Date(dueDate) : undefined,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user in database or create minimal record if needed
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user && session.user.id) {
      // Try to find user by ID as fallback
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findUnique({
      where: { id: params.id },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (existingTask.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.task.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}