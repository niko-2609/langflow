import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { flowId, status, inputData, outputData, error, durationMs } = await req.json();

    // Validate required fields
    if (!flowId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if the flow exists and belongs to the user
    const flow = await prisma.flow.findFirst({
      where: { id: flowId, userId: clerkId }
    });

    if (!flow) {
      return NextResponse.json({ error: "Flow not found" }, { status: 404 });
    }

    // Create workflow execution record
    const execution = await prisma.workflowExecution.create({
      data: {
        flowId,
        userId: clerkId,
        status: status === 'SUCCESS' ? 'SUCCESS' : 'FAILURE',
        inputData,
        outputData,
        error,
        durationMs
      }
    });

    // Update flow statistics
    const updateData: any = {
      lastRunAt: new Date(),
      executions: { increment: 1 }
    };

    if (status === 'FAILURE') {
      updateData.failures = { increment: 1 };
    }

    await prisma.flow.update({
      where: { id: flowId },
      data: updateData
    });

    // Recalculate success rate
    const totalExecutions = await prisma.workflowExecution.count({
      where: { flowId }
    });

    const successfulExecutions = await prisma.workflowExecution.count({
      where: { flowId, status: 'SUCCESS' }
    });

    const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 100;

    await prisma.flow.update({
      where: { id: flowId },
      data: {
        successRate: successRate
      }
    });

    return NextResponse.json(execution, { status: 201 });

  } catch (error) {
    console.error("Error recording workflow execution:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}