import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type AdminCtx = QueryCtx | MutationCtx;

export interface SignedInUser {
  userId: Id<"users">;
  user: Doc<"users">;
}

export async function getSignedInUser(
  ctx: AdminCtx,
): Promise<SignedInUser | null> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    return null;
  }

  const user = await ctx.db.get(userId);
  if (!user) {
    return null;
  }

  return { userId, user };
}

export async function requireSignedInUser(
  ctx: AdminCtx,
): Promise<SignedInUser> {
  const signedInUser = await getSignedInUser(ctx);
  if (!signedInUser) {
    throw new Error("You must be signed in to access admin features.");
  }
  return signedInUser;
}

export async function requireAdmin(
  ctx: AdminCtx,
): Promise<SignedInUser & { adminUserId: Id<"adminUsers"> }> {
  const signedInUser = await requireSignedInUser(ctx);
  const adminRecord = await ctx.db
    .query("adminUsers")
    .withIndex("by_userId", (query) => query.eq("userId", signedInUser.userId))
    .unique();

  if (!adminRecord) {
    throw new Error("You do not have admin access.");
  }

  return {
    ...signedInUser,
    adminUserId: adminRecord._id,
  };
}
