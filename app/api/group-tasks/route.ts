import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient, Prisma } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET /api/group-tasks - Get all group tasks for the current user (owned or assigned)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Authentication check
    
    if (!session?.user?.email) {
      // No user email in session
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user in database
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    // Check if user exists

    if (!user) {
      // Create user if they don't exist
      const newUser = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || null,
        },
      });
      
      return NextResponse.json({
        ownedTasks: [],
        assignedTasks: [],
      });
    }

    // Get tasks where user is owner
    const ownedTasks = await prisma.groupTask.findMany({
      where: { ownerId: user.id },
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
      },
      orderBy: { createdAt: "desc" },
    });

    // Get tasks where user is an assignee
    const assignedTasks = await prisma.groupTask.findMany({
      where: {
        assignees: {
          some: {
            userId: user.id,
          },
        },
        ownerId: { not: user.id }, // Exclude tasks where user is also the owner
      },
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
      orderBy: { createdAt: "desc" },
    });

    // Combine and return both sets of tasks
    return NextResponse.json({
      ownedTasks,
      assignedTasks,
    });
  } catch (error) {
    console.error("Error fetching group tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch group tasks" },
      { status: 500 }
    );
  }
}

// POST /api/group-tasks - Create a new group task
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Authentication check
    
    if (!session?.user?.email) {
      // No user email in session
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user in database
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    // Check if user exists

    if (!user) {
      console.log("User not found, creating new user");
      // Create user if they don't exist
      const newUser = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || null,
        },
      });
      
      console.log("New user created:", newUser);
      
      // Parse request body
      const body = await req.json();
      console.log("Request body:", body);
      
      const { title, category, categoryColor, subtasks, dueDate, assigneeIds } = body;

      if (!title) {
        return NextResponse.json(
          { error: "Title is required" },
          { status: 400 }
        );
      }

      // Create the group task with a transaction to ensure all related records are created
      const groupTask = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Create the group task
        const task = await tx.groupTask.create({
          data: {
            title,
            category,
            categoryColor,
            // Process subtasks for SQLite storage
            subtasks: (() => {
              try {
                if (typeof subtasks === 'string') {
                  // Validate and normalize JSON string
                  return JSON.stringify(JSON.parse(subtasks));
                }
                return JSON.stringify(subtasks || []);
              } catch (e) {
                console.error('Error processing group task subtasks:', e);
                return '[]';
              }
            })(),
            dueDate: dueDate ? new Date(dueDate) : null,
            ownerId: newUser.id,
          },
        });

        // Add assignees if provided
        if (assigneeIds && assigneeIds.length > 0) {
          const assigneeData = assigneeIds.map((userId: string) => ({
            userId,
            groupTaskId: task.id,
          }));

          await tx.groupTaskAssignee.createMany({
            data: assigneeData,
          });
        }

        // Return the created task with assignees
        return tx.groupTask.findUnique({
          where: { id: task.id },
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

      return NextResponse.json(groupTask, { status: 201 });
    }

    // Parse request body
    const body = await req.json();
    // Process request body
    
    const { title, category, categoryColor, subtasks, dueDate, assigneeIds } = body;

    if (!title) {
      console.error("Title is required");
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Create the group task with a transaction to ensure all related records are created
    const groupTask = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create the group task
      const task = await tx.groupTask.create({
        data: {
          title,
          category,
          categoryColor,
          // Process subtasks for SQLite storage
          subtasks: (() => {
            try {
              if (typeof subtasks === 'string') {
                // Validate and normalize JSON string
                return JSON.stringify(JSON.parse(subtasks));
              }
              return JSON.stringify(subtasks || []);
            } catch (e) {
              console.error('Error processing group task subtasks:', e);
              return '[]';
            }
          })(),
          dueDate: dueDate ? new Date(dueDate) : null,
          ownerId: user.id,
        },
      });

      // Add assignees if provided
      if (assigneeIds && assigneeIds.length > 0) {
        const assigneeData = assigneeIds.map((userId: string) => ({
          userId,
          groupTaskId: task.id,
        }));

        await tx.groupTaskAssignee.createMany({
          data: assigneeData,
        });
      }

      // Return the created task with assignees
      return tx.groupTask.findUnique({
        where: { id: task.id },
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

    return NextResponse.json(groupTask, { status: 201 });
  } catch (error: any) {
    console.error("Error creating group task:", error);
    // Log more details about the error
    if (error.code) {
      console.error("Error code:", error.code);
    }
    if (error.meta) {
      console.error("Error metadata:", error.meta);
    }
    if (error.stack) {
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { error: "Failed to create group task", details: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}