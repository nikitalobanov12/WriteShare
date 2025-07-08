import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { userCache, cacheOrFetch, generateCacheKey } from "~/lib/cache";
import { CACHE_TTL } from "~/server/redis";

export const workspaceRouter = createTRPCRouter({
  getWorkspaces: protectedProcedure.query(async ({ ctx }) => {
    const cacheKey = generateCacheKey("USER", ctx.session.userId, "workspaces");

    return await cacheOrFetch(
      cacheKey,
      async () => {
        const memberships = await ctx.db.workspaceMembership.findMany({
          where: { userId: ctx.session.userId },
          include: { workspace: true },
        });
        return memberships.map((m) => m.workspace);
      },
      CACHE_TTL.LONG,
    );
  }),

  createWorkspace: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const workspace = await ctx.db.workspace.create({
        data: {
          name: input.name,
          createdBy: { connect: { id: ctx.session.userId } },
          memberships: {
            create: { user: { connect: { id: ctx.session.userId } } },
          },
        },
      });

      // Invalidate user's cached workspaces when a new workspace is created
      await userCache.delete(ctx.session.userId, "workspaces");

      return workspace;
    }),

  inviteUser: protectedProcedure
    .input(
      z.object({ workspaceId: z.number().int(), email: z.string().email() }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });
      if (!user) throw new Error("User not found");
      const existingMembership = await ctx.db.workspaceMembership.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: input.workspaceId,
            userId: user.id,
          },
        },
      });
      if (existingMembership)
        throw new Error("User is already a member of this workspace");
      const existingInvite = await ctx.db.workspaceInvite.findFirst({
        where: {
          workspaceId: input.workspaceId,
          invitedUserId: user.id,
          status: "pending",
        },
      });
      if (existingInvite)
        throw new Error("User has already been invited to this workspace");
      const invite = await ctx.db.workspaceInvite.create({
        data: {
          workspace: { connect: { id: input.workspaceId } },
          invitedUser: { connect: { id: user.id } },
          inviter: { connect: { id: ctx.session.userId } },
        },
      });
      return invite;
    }),

  getInvites: protectedProcedure.query(async ({ ctx }) => {
    // Get all pending invites for the current user
    return ctx.db.workspaceInvite.findMany({
      where: {
        invitedUserId: ctx.session.userId,
        status: "pending",
      },
      include: {
        workspace: true,
        inviter: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  acceptInvite: protectedProcedure
    .input(z.object({ inviteId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      // Find the invite and ensure it belongs to the current user
      const invite = await ctx.db.workspaceInvite.findUnique({
        where: { id: input.inviteId },
      });
      if (!invite || invite.invitedUserId !== ctx.session.userId) {
        throw new Error("Invite not found");
      }
      if (invite.status !== "pending") {
        throw new Error("Invite is not pending");
      }
      // Add membership
      await ctx.db.workspaceMembership.create({
        data: {
          workspaceId: invite.workspaceId,
          userId: ctx.session.userId,
        },
      });
      // Mark invite as accepted
      await ctx.db.workspaceInvite.update({
        where: { id: input.inviteId },
        data: { status: "accepted" },
      });
      return { success: true };
    }),
});
