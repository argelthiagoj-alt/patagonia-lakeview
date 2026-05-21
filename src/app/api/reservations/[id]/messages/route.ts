import { NextResponse } from "next/server";
import { getCurrentUser } from "@/modules/auth/session";
import { sendMessageSchema } from "@/modules/chat/schemas";
import { listMessages, sendMessage } from "@/modules/chat/service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { id } = await params;
  const result = await listMessages(me, id);
  if (!result.ok) {
    switch (result.reason) {
      case "FORBIDDEN":
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      case "SERVER":
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }
  return NextResponse.json({
    messages: result.messages,
    currentUserId: me.id,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = sendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Mensaje inválido" },
      { status: 400 }
    );
  }

  const result = await sendMessage(me, id, parsed.data.body);
  if (!result.ok) {
    switch (result.reason) {
      case "BANNED":
        return NextResponse.json({ error: "Cuenta suspendida." }, { status: 403 });
      case "FORBIDDEN":
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      case "SERVER":
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }
  return NextResponse.json({ message: result.message });
}
