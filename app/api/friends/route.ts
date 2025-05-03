import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET /api/friends - Get all friends for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      // Create user if they don't exist
      const newUser = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || null,
        },
      });
      
      return NextResponse.json({
        friends: [],
        pendingSent: [],
        pendingReceived: [],
      });
    }

    // Get friends where user is the initiator
    const initiatedFriendships = await prisma.friendship.findMany({
      where: {
        initiatorId: user.id,
        status: "accepted",
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Get friends where user is the receiver
    const receivedFriendships = await prisma.friendship.findMany({
      where: {
        receiverId: user.id,
        status: "accepted",
      },
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

    // Get pending friend requests sent by the user
    const pendingSent = await prisma.friendship.findMany({
      where: {
        initiatorId: user.id,
        status: "pending",
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Get pending friend requests received by the user
    const pendingReceived = await prisma.friendship.findMany({
      where: {
        receiverId: user.id,
        status: "pending",
      },
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

    // Define types for the friendship objects
    type FriendshipWithInitiator = {
      id: string;
      initiator: {
        id: string;
        name: string | null;
        email: string;
      };
      status: string;
    };

    type FriendshipWithReceiver = {
      id: string;
      receiver: {
        id: string;
        name: string | null;
        email: string;
      };
      status: string;
    };

    // Format the response
    const friends = [
      ...initiatedFriendships.map((friendship: FriendshipWithReceiver) => ({
        id: friendship.receiver.id,
        name: friendship.receiver.name,
        email: friendship.receiver.email,
        friendshipId: friendship.id,
      })),
      ...receivedFriendships.map((friendship: FriendshipWithInitiator) => ({
        id: friendship.initiator.id,
        name: friendship.initiator.name,
        email: friendship.initiator.email,
        friendshipId: friendship.id,
      })),
    ];

    return NextResponse.json({
      friends,
      pendingSent: pendingSent.map((friendship: FriendshipWithReceiver) => ({
        id: friendship.receiver.id,
        name: friendship.receiver.name,
        email: friendship.receiver.email,
        friendshipId: friendship.id,
      })),
      pendingReceived: pendingReceived.map((friendship: FriendshipWithInitiator) => ({
        id: friendship.initiator.id,
        name: friendship.initiator.name,
        email: friendship.initiator.email,
        friendshipId: friendship.id,
      })),
    });
  } catch (error) {
    console.error("Error fetching friends:", error);
    return NextResponse.json(
      { error: "Failed to fetch friends" },
      { status: 500 }
    );
  }
}

// POST /api/friends - Send a friend request
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      // Create user if they don't exist
      const newUser = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || null,
        },
      });
      
      const { email } = await req.json();

      if (!email) {
        return NextResponse.json(
          { error: "Friend email is required" },
          { status: 400 }
        );
      }

      // Check if the friend exists
      const friend = await prisma.user.findUnique({
        where: { email },
      });

      if (!friend) {
        return NextResponse.json(
          { error: "User with this email not found" },
          { status: 404 }
        );
      }

      // Check if the user is trying to add themselves
      if (friend.id === newUser.id) {
        return NextResponse.json(
          { error: "You cannot add yourself as a friend" },
          { status: 400 }
        );
      }

      // Create the friendship request
      const friendship = await prisma.friendship.create({
        data: {
          initiatorId: newUser.id,
          receiverId: friend.id,
          status: "pending",
        },
        include: {
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return NextResponse.json({
        id: friendship.receiver.id,
        name: friendship.receiver.name,
        email: friendship.receiver.email,
        friendshipId: friendship.id,
        status: friendship.status,
      }, { status: 201 });
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Friend email is required" },
        { status: 400 }
      );
    }

    // Check if the friend exists
    const friend = await prisma.user.findUnique({
      where: { email },
    });

    if (!friend) {
      return NextResponse.json(
        { error: "User with this email not found" },
        { status: 404 }
      );
    }

    // Check if the user is trying to add themselves
    if (friend.id === user.id) {
      return NextResponse.json(
        { error: "You cannot add yourself as a friend" },
        { status: 400 }
      );
    }

    // Check if a friendship already exists
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          {
            initiatorId: user.id,
            receiverId: friend.id,
          },
          {
            initiatorId: friend.id,
            receiverId: user.id,
          },
        ],
      },
    });

    if (existingFriendship) {
      return NextResponse.json(
        { error: "Friendship request already exists" },
        { status: 400 }
      );
    }

    // Create the friendship request
    const friendship = await prisma.friendship.create({
      data: {
        initiatorId: user.id,
        receiverId: friend.id,
        status: "pending",
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: friendship.receiver.id,
      name: friendship.receiver.name,
      email: friendship.receiver.email,
      friendshipId: friendship.id,
      status: friendship.status,
    }, { status: 201 });
  } catch (error) {
    console.error("Error sending friend request:", error);
    return NextResponse.json(
      { error: "Failed to send friend request" },
      { status: 500 }
    );
  }
}