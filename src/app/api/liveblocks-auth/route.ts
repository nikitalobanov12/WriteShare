import { Liveblocks } from "@liveblocks/node";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "~/server/db";

const secret = process.env.LIVEBLOCKS_SECRET_KEY;

if (!secret) {
  throw new Error("LIVEBLOCKS_SECRET_KEY is not set");
}

const liveblocks = new Liveblocks({
  secret,
});

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { room } = (await request.json()) as {
    room: string;
  };

  const pageId = room.replace("page-", "");

  const userCanAccess = await canUserAccessRoom(session.user.id, pageId);

  if (!userCanAccess) {
    return new Response("Access denied", { status: 403 });
  }

  const liveblocksSession = liveblocks.prepareSession(session.user.id, {
    userInfo: {
      name: session.user.name ?? "Anonymous",
      color: generateRandomColor(),
      avatar: session.user.image ?? undefined,
    },
  });

  liveblocksSession.allow(room, liveblocksSession.FULL_ACCESS);

  const { status, body } = await liveblocksSession.authorize();
  return new Response(body, { status });
}

async function canUserAccessRoom(
  userId: string,
  pageId: string,
): Promise<boolean> {
  try {
    const page = await db.page.findFirst({
      where: {
        id: pageId,
      },
      include: {
        workspace: {
          include: {
            memberships: {
              where: {
                userId: userId,
              },
            },
          },
        },
      },
    });

    return !!(page && page.workspace.memberships.length > 0);
  } catch (error) {
    console.error("Error checking page access:", error);
    return false;
  }
}

function generateRandomColor(): string {
  const colors = [
    "#DC2626",
    "#EA580C",
    "#D97706",
    "#CA8A04",
    "#65A30D",
    "#16A34A",
    "#059669",
    "#0891B2",
    "#0284C7",
    "#2563EB",
    "#7C3AED",
    "#C026D3",
    "#DC2626",
    "#BE185D",
  ] as const;
  return colors[Math.floor(Math.random() * colors.length)]!;
}
