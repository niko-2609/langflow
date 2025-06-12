import prisma from '@/lib/prisma'

export async function workFlowList(userId: string) {
    return prisma.flow.findMany({
        where: {
          userId,
        },
        orderBy: {
          updatedAt: 'desc',
        },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          lastRunAt: true,
          successRate: true,
          executions: true,
          failures: true,
        },
      })
}


// TO BE USED LATER 

// import { formatDistanceToNow } from 'date-fns';
// const lastRun = formatDistanceToNow(workflow.lastRunAt, { addSuffix: true });



export async function flowSuccessRate() {
    let executions = await prisma.workflowExecution.findMany({
        where: {
          flowId: 'flowId',
        },
        select: {
          status: true,
        },
      });
      
      const total = executions.length;
      const success = executions.filter(e => e.status === 'SUCCESS').length;
      return (success / total) * 100;

}