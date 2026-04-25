import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // data is considered fresh for 1 minute
      staleTime: 1000 * 60,
      // retry once on failure, not three times (default)
      retry: 1,
      // do not refetch when window regains focus in an internal tool
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
