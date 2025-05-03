import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/group-tasks/[id]/comments - Get all comments for a group task
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

    // Check if group task exists
    const groupTask = await prisma.groupTask.findUnique({
      where: { id: params.id },
      include: {
        assignees: true,
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

    // Get comments for the group task
    const comments = await prisma.comment.findMany({
      where: { groupTaskId: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/group-tasks/[id]/comments - Add a comment to a group task
export async function POST(
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
    const groupTask = await prisma.groupTask.findUnique({
      where: { id: params.id },
      include: {
        assignees: true,
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

    const { content } = await req.json();

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content,
        groupTaskId: params.id,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}