import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { getUserPosts } from "~/lib/dal";
import { cacheOrFetch, invalidateCache, generateCacheKey } from "~/lib/cache";
import { CACHE_TTL } from "~/server/redis";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.create({
        data: {
          name: input.name,
          createdBy: { connect: { id: ctx.session.userId } },
        },
      });

      // Invalidate user's cached posts when a new post is created
      await invalidateCache.user(ctx.session.userId);

      return post;
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const cacheKey = generateCacheKey(
      "USER",
      ctx.session.userId,
      "latest-post",
    );

    return await cacheOrFetch(
      cacheKey,
      async () => {
        const post = await ctx.db.post.findFirst({
          orderBy: { createdAt: "desc" },
          where: { createdBy: { id: ctx.session.userId } },
        });
        return post ?? null;
      },
      CACHE_TTL.MEDIUM,
    );
  }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const cacheKey = generateCacheKey("USER", ctx.session.userId, "all-posts");

    return await cacheOrFetch(
      cacheKey,
      async () => {
        // Use DAL function for proper auth and data fetching
        return await getUserPosts();
      },
      CACHE_TTL.MEDIUM,
    );
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
