import { useQuery } from '@tanstack/react-query'

export function useAvailableNodes() {
    return useQuery({
        queryKey: ['available-nodes'],
        queryFn: async () => {
            const res = await fetch('/api/nodes');
            if (!res.ok) throw new Error('Failed to fetch nodes')
            return res.json()
        }
    })
}