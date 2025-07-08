import prisma from "@/lib/prisma";

export async function getTotalWorkflows(userId: string) {
    return prisma.flow.count({ where: { userId } });
  }
  
  export async function getSuccessfulExecutions(userId: string) {
    return prisma.workflowExecution.count({
      where: { flow: { userId }, status: 'SUCCESS' },
    });
  }
  
  export async function getFailedExecutions(userId: string) {
    return prisma.workflowExecution.count({
      where: { flow: { userId }, status: 'FAILURE' },
    });
  }
  
  export async function getTotalExecutions(userId: string) {
    return prisma.workflowExecution.count({
      where: { flow: { userId } },
    });
  }