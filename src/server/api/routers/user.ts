import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });
    if (!user) throw new Error("User not found");
    return user;
  }),
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        image: z.string().url().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.update({
        where: { id: ctx.session.userId },
        data: {
          name: input.name,
          image: input.image ?? undefined,
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      });
      return user;
    }),
}); 