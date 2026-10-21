import { auth } from "@clerk/nextjs/server";
import { deleteArticle } from "@/db/queries";

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/news/[id]">,
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) {
    return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  try {
    const deleted = await deleteArticle(userId, id);
    if (!deleted) {
      return Response.json({ error: "기사를 찾을 수 없어요." }, { status: 404 });
    }
    return Response.json({ deleted: true });
  } catch {
    // 원인 로그는 deleteArticle에서 남긴다.
    return Response.json(
      { error: "삭제하지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
