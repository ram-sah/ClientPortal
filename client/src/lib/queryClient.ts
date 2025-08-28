import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    console.error(`API Error: ${res.status} ${res.statusText}`);
    console.error(`Response: ${text}`);
    console.error(`URL: ${res.url}`);
    throw new Error(`${res.status}: ${text}`);
  }
}

import { getCurrentAuthToken } from '../contexts/auth-context';

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.log(`🌐 Frontend: Making ${method} request to ${url}`);
  console.log('📤 Frontend: Request data:', data);
  
  // Get current auth token and add to headers
  const token = getCurrentAuthToken();
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    console.log('🔐 Frontend: Adding auth token to request:', token.substring(0, 20) + '...', 'for URL:', url);
  } else {
    console.log('❌ Frontend: No auth token available for request to:', url);
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  console.log(`📥 Frontend: Response status: ${res.status} ${res.statusText}`);
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    
    // Get current auth token and add to headers
    const token = getCurrentAuthToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      console.log('🔐 Query: Adding auth token to request:', token.substring(0, 20) + '...', 'for URL:', url);
    } else {
      console.log('❌ Query: No auth token available for request to:', url);
    }
    
    const res = await fetch(url, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
