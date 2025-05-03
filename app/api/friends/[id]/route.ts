import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PATCH /api/friends/[id] - Accept or reject a friend request
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

    // Check if the friendship exists
    const friendship = await prisma.friendship.findUnique({
      where: { id: params.id },
    });

    if (!friendship) {
      return NextResponse.json({ error: "Friendship not found" }, { status: 404 });
    }

    // Check if the user is the receiver of the friend request
    if (friendship.receiverId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { status } = await req.json();

    if (!status || (status !== "accepted" && status !== "rejected")) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Update the friendship status
    const updatedFriendship = await prisma.friendship.update({
      where: { id: params.id },
      data: { status },
      include: {
        initiator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: updatedFriendship.initiator.id,
      name: updatedFriendship.initiator.name,
      email: updatedFriendship.initiator.email,
      friendshipId: updatedFriendship.id,
      status: updatedFriendship.status,
    });
  } catch (error) {
    console.error("Error updating friendship:", error);
    return NextResponse.json(
      { error: "Failed to update friendship" },
      { status: 500 }
    );
  }
}

// DELETE /api/friends/[id] - Remove a friend
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

    // Check if the friendship exists
    const friendship = await prisma.friendship.findUnique({
      where: { id: params.id },
    });

    if (!friendship) {
      return NextResponse.json({ error: "Friendship not found" }, { status: 404 });
    }

    // Check if the user is part of the friendship
    if (friendship.initiatorId !== user.id && friendship.receiverId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the friendship
    await prisma.friendship.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing friend:", error);
    return NextResponse.json(
      { error: "Failed to remove friend" },
      { status: 500 }
    );
  }
}