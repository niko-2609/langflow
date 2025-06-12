import prisma from "@/lib/prisma";

export async function getTotalWorkflows(userId: string) {
    return prisma.flow.count({ where: { userId } });
  }
  
  export async function getActiveWorkflows(userId: string) {
    return prisma.flow.count({ where: { userId, status: 'ACTIVE' } });
  }
  
  export async function getFailedExecutions(userId: string) {
    return prisma.workflowExecution.count({
      where: { flow: { userId }, status: 'FAILURE' },
    });
  }
  
  export async function getTotalUsers() {
    return prisma.user.count();
  }