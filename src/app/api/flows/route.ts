import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { recordWorkflowExecution } from "./stream/route";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return new Response("Unauthorized", { status: 401 });

  const { name, description, data, isPublic, lastRunTime } = await req.json();

  // Get the user from your database
  const user = await prisma.user.findUnique({
    where: { id: clerkId },
  });


  console.log("USer Id", clerkId)
  console.log("User", user)
  if (!user) return new Response("User not found", { status: 404 });



  if (!true) {
    return new Response("User is not a member of the organization", { status: 403 });
  }

  // Create the flow
  const flow = await prisma.flow.create({
    data: {
      name,
      description,
      data,
      userId: user.id,
      isPublic: isPublic ?? false,
      lastRunAt: lastRunTime ?? null,
    },
  });

  recordWorkflowExecution(flow.id, flow.id, 'SUCCESS', {}, {}, '', clerkId);

  return new Response(JSON.stringify(flow), { status: 201 });
}