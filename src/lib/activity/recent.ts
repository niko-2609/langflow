import prisma from '@/lib/prisma'

export async function recentActivity(userId: string) {
    return prisma.workflowExecution.findMany({
        where: {
            flow: { userId },
        },
        orderBy: {
            executedAt: 'desc',
        },
        take: 5,
        select: {
            id: true,
            status: true,
            executedAt: true,
            flow: {
                select: {
                    name: true,
                },
            },
        },
    });
}



/** 
 * 
 * Return reponse
 * 
{
  id: 'abc123',
  status: 'success',
  executedAt: '2025-06-12T16:32:01.999Z',
  flow: { name: 'Invoice Processing' }
}
 */
