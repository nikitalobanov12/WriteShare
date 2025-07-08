import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  workspaceCache,
  cacheOrFetch,
  invalidateCache,
  generateCacheKey,
} from "~/lib/cache";
import { CACHE_TTL } from "~/server/redis";

export const pageRouter = createTRPCRouter({
  getWorkspacePages: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ ctx, input }) => {
      // First verify user has access to this workspace
      const membership = await ctx.db.workspaceMembership.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: input.workspaceId,
            userId: ctx.session.userId,
          },
        },
      });

      if (!membership) {
        throw new Error("You don't have access to this workspace");
      }

      const cacheKey = generateCacheKey(
        "WORKSPACE",
        input.workspaceId,
        "pages",
      );

      return await cacheOrFetch(
        cacheKey,
        async () => {
          // Get all pages in the workspace, ordered by creation date
          const pages = await ctx.db.page.findMany({
            where: {
              workspaceId: input.workspaceId,
              isArchived: false,
            },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
              children: {
                where: {
                  isArchived: false,
                },
                orderBy: {
                  createdAt: "asc",
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          });

          return pages;
        },
        CACHE_TTL.MEDIUM,
      );
    }),

  getPage: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const cacheKey = generateCacheKey("PAGE", input.id, "details");

      return await cacheOrFetch(
        cacheKey,
        async () => {
          const page = await ctx.db.page.findUnique({
            where: { id: input.id },
            select: {
              id: true,
              title: true,
              emoji: true,
              content: true,
              crdtState: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
              workspace: {
                select: {
                  id: true,
                  memberships: {
                    where: { userId: ctx.session.userId },
                    select: { userId: true },
                  },
                },
              },
            },
          });

          if (!page?.workspace?.memberships?.length) {
            throw new Error("Page not found or you don't have access");
          }

          return page;
        },
        CACHE_TTL.MEDIUM,
      );
    }),

  createPage: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        workspaceId: z.number(),
        parentId: z.string().optional(),
        emoji: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user has access to this workspace
      const membership = await ctx.db.workspaceMembership.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: input.workspaceId,
            userId: ctx.session.userId,
          },
        },
      });

      if (!membership) {
        throw new Error("You don't have access to this workspace");
      }

      // If parentId is provided, verify the parent page exists and belongs to the same workspace
      if (input.parentId) {
        const parentPage = await ctx.db.page.findUnique({
          where: { id: input.parentId },
        });

        if (!parentPage || parentPage.workspaceId !== input.workspaceId) {
          throw new Error("Invalid parent page");
        }
      }

      const page = await ctx.db.page.create({
        data: {
          title: input.title,
          emoji: input.emoji,
          workspaceId: input.workspaceId,
          authorId: ctx.session.userId,
          parentId: input.parentId,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      // Invalidate workspace pages cache when a new page is created
      await workspaceCache.delete(input.workspaceId.toString(), "pages");

      return page;
    }),

  updatePage: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        content: z.string().optional(),
        emoji: z.string().optional(),
        coverImage: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Verify the page exists and user has access
      const page = await ctx.db.page.findUnique({
        where: { id },
        include: {
          workspace: {
            include: {
              memberships: {
                where: { userId: ctx.session.userId },
              },
            },
          },
        },
      });

      if (!page || page.workspace.memberships.length === 0) {
        throw new Error("Page not found or you don't have access");
      }

      const updatedPage = await ctx.db.page.update({
        where: { id },
        data: updateData,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      // Invalidate page cache when updated
      await invalidateCache.page(id, page.workspaceId.toString());

      return updatedPage;
    }),

  updatePageCrdt: protectedProcedure
    .input(z.object({ id: z.string(), crdtState: z.string() })) // base64 string
    .mutation(async ({ ctx, input }) => {
      // Verify the page exists and user has access
      const page = await ctx.db.page.findUnique({
        where: { id: input.id },
        include: {
          workspace: {
            include: {
              memberships: {
                where: { userId: ctx.session.userId },
              },
            },
          },
        },
      });
      if (!page || page.workspace.memberships.length === 0) {
        throw new Error("Page not found or you don't have access");
      }
      // Decode base64 to Buffer
      const crdtBuffer = Buffer.from(input.crdtState, "base64");
      const updatedPage = await ctx.db.page.update({
        where: { id: input.id },
        data: { crdtState: crdtBuffer },
      });
      await invalidateCache.page(input.id, page.workspaceId.toString());
      return updatedPage;
    }),

  deletePage: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify the page exists and user has access
      const page = await ctx.db.page.findUnique({
        where: { id: input.id },
        include: {
          workspace: {
            include: {
              memberships: {
                where: { userId: ctx.session.userId },
              },
            },
          },
        },
      });

      if (!page || page.workspace.memberships.length === 0) {
        throw new Error("Page not found or you don't have access");
      }

      // Archive the page instead of hard delete to maintain referential integrity
      const archivedPage = await ctx.db.page.update({
        where: { id: input.id },
        data: { isArchived: true },
      });

      return archivedPage;
    }),
});
