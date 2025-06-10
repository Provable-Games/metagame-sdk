import { useState, useEffect, useCallback } from 'react';
import { MetagameClient } from '../../client';
import { SchemaType } from '@dojoengine/sdk';

export interface UseSqlExecuteOptions {
  logging?: boolean;
}

export interface UseSqlExecuteResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Define an interface for error responses
interface ErrorResponse {
  error?: string;
  message?: string;
}

/**
 * Hook to execute SQL queries
 */
export function useSqlExecute<S extends SchemaType, T = any>(
  client: MetagameClient<S>,
  query: string | null,
  options: UseSqlExecuteOptions = {}
): UseSqlExecuteResult<T> {
  const { logging = false } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T[]>([]);

  const fetchData = useCallback(async () => {
    if (query === null) {
      setLoading(false);
      setError(null);
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { toriiUrl } = client.getConfig();

      if (!toriiUrl) {
        throw new Error('Torii URL is not configured');
      }

      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(`${toriiUrl}/sql?query=${encodedQuery}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Cast the error response to our error interface
        const errorData = responseData as ErrorResponse;
        throw new Error(errorData.error || errorData.message || 'Failed to execute query');
      }

      // Cast the success response to our expected type
      const result = responseData as T[];
      setData(result);

      if (logging) {
        console.log('SQL query result:', result);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);

      if (logging) {
        console.error('SQL query error:', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [client, query, logging]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
