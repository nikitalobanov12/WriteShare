import { Liveblocks } from "@liveblocks/node";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { PageAccessService } from "~/lib/page-access-service";
import { generateRandomColor } from "~/lib/utils";

const secret = process.env.LIVEBLOCKS_SECRET_KEY;
if (!secret) {
  throw new Error("LIVEBLOCKS_SECRET_KEY is not set");
}

const liveblocks = new Liveblocks({
  secret,
});
const pageAccessService = new PageAccessService();

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { room } = (await request.json()) as {
    room: string;
  };
  const pageId = room.replace("page-", "");

  const userCanAccess = await pageAccessService.canUserAccessRoom(session.user.id, pageId);
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
