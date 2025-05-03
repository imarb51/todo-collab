import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/group-tasks/[id] - Get a specific group task
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const groupTask = await prisma.groupTask.findUnique({
      where: { id: params.id },
      include: {
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!groupTask) {
      return NextResponse.json({ error: "Group task not found" }, { status: 404 });
    }

    // Check if user is owner or assignee
    const isOwner = groupTask.ownerId === user.id;
    const isAssignee = groupTask.assignees.some(
      (assignee) => assignee.userId === user.id
    );

    if (!isOwner && !isAssignee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(groupTask);
  } catch (error) {
    console.error("Error fetching group task:", error);
    return NextResponse.json(
      { error: "Failed to fetch group task" },
      { status: 500 }
    );
  }
}

// PATCH /api/group-tasks/[id] - Update a group task
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if group task exists
    const existingTask = await prisma.groupTask.findUnique({
      where: { id: params.id },
      include: {
        assignees: true,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Group task not found" }, { status: 404 });
    }

    const isOwner = existingTask.ownerId === user.id;
    const isAssignee = existingTask.assignees.some(
      (assignee) => assignee.userId === user.id
    );

    // For status updates, assignees can update their own status
    const { title, completed, category, categoryColor, subtasks, dueDate, assigneeIds, status } = await req.json();

    // If updating assignee status
    if (status && isAssignee && !isOwner) {
      // Find the assignee record
      const assigneeRecord = await prisma.groupTaskAssignee.findFirst({
        where: {
          groupTaskId: params.id,
          userId: user.id,
        },
      });

      if (assigneeRecord) {
        await prisma.groupTaskAssignee.update({
          where: { id: assigneeRecord.id },
          data: { status },
        });

        // Check if all assignees have completed their tasks
        const allAssignees = await prisma.groupTaskAssignee.findMany({
          where: { groupTaskId: params.id },
        });

        const allCompleted = allAssignees.every(
          (assignee) => assignee.status === "completed"
        );

        // If all assignees have completed, mark the task as completed
        if (allCompleted) {
          await prisma.groupTask.update({
            where: { id: params.id },
            data: { completed: true },
          });
        }

        return NextResponse.json({ success: true });
      }
    }

    // For other updates, only the owner can make changes
    if (!isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update the group task with a transaction to handle assignee changes
    const updatedTask = await prisma.$transaction(async (tx) => {
      // Update the task
      const task = await tx.groupTask.update({
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

      // Update assignees if provided
      if (assigneeIds) {
        // Remove existing assignees
        await tx.groupTaskAssignee.deleteMany({
          where: { groupTaskId: params.id },
        });

        // Add new assignees
        if (assigneeIds.length > 0) {
          const assigneeData = assigneeIds.map((userId: string) => ({
            userId,
            groupTaskId: params.id,
          }));

          await tx.groupTaskAssignee.createMany({
            data: assigneeData,
          });
        }
      }

      // Return the updated task with assignees
      return tx.groupTask.findUnique({
        where: { id: params.id },
        include: {
          assignees: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating group task:", error);
    return NextResponse.json(
      { error: "Failed to update group task" },
      { status: 500 }
    );
  }
}

// DELETE /api/group-tasks/[id] - Delete a group task
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if group task exists and user is the owner
    const existingTask = await prisma.groupTask.findUnique({
      where: { id: params.id },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Group task not found" }, { status: 404 });
    }

    if (existingTask.ownerId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the group task (cascade will handle related records)
    await prisma.groupTask.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting group task:", error);
    return NextResponse.json(
      { error: "Failed to delete group task" },
      { status: 500 }
    );
  }
}