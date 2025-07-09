import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const flowId = params.id;

    const flow = await prisma.flow.findFirst({
      where: {
        id: flowId,
        userId: clerkId
      },
      include: {
        executionsLog: {
          orderBy: {
            executedAt: 'desc'
          },
          take: 10 // Get last 10 executions
        }
      }
    });

    if (!flow) {
      return NextResponse.json({ error: "Flow not found" }, { status: 404 });
    }

    return NextResponse.json(flow);

  } catch (error) {
    console.error("Error fetching flow:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const flowId = params.id;
    const { name, description, data, isPublic, lastRunTime } = await request.json();

    // Check if flow exists and belongs to user
    const existingFlow = await prisma.flow.findFirst({
      where: {
        id: flowId,
        userId: clerkId
      }
    });

    if (!existingFlow) {
      return NextResponse.json({ error: "Flow not found" }, { status: 404 });
    }

    // Update the flow
    const updatedFlow = await prisma.flow.update({
      where: { id: flowId },
      data: {
        name,
        description,
        data,
        isPublic: isPublic ?? existingFlow.isPublic,
        updatedAt: new Date(),
        lastRunAt: lastRunTime
        // Remove executions: {} as it's an Int field and should not be set to an empty object
        // The executions field is automatically incremented by the workflow execution APIs
      }
    });

    return NextResponse.json(updatedFlow);

  } catch (error) {
    console.error("Error updating flow:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}