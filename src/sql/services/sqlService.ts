import { useState, useCallback, useEffect } from 'react';
import { logger } from '../../shared/utils/logger';

interface ErrorResponse {
  error?: string;
  message?: string;
}

export interface SqlQueryResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSqlQuery<T>(
  toriiUrl: string | undefined,
  query: string | null | undefined,
  logging: boolean = false
): SqlQueryResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!toriiUrl) {
      setError('Torii URL is not configured');
      setLoading(false);
      return;
    }

    // Return early with empty data if query is null or undefined
    if (!query) {
      setData([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (logging) {
        logger.debug('[useSqlQuery] Executing query with toriiUrl:', toriiUrl);
      }
      const result = await executeSqlQuery<T>(toriiUrl, query, logging);
      setData(result.data);
      setError(result.error);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      if (logging) {
        logger.error('SQL query error:', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [toriiUrl, query, logging]);

  // Fetch data initially
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

export async function executeSqlQuery<T>(
  toriiUrl: string,
  query: string | null | undefined,
  logging: boolean = false
): Promise<{ data: T[]; error: string | null }> {
  if (!toriiUrl) {
    return { data: [], error: 'Torii URL is not configured' };
  }

  if (!query) {
    return { data: [], error: null };
  }

  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(`${toriiUrl}/sql?query=${encodedQuery}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseData = await response.json();

    if (!response.ok) {
      const errorData = responseData as ErrorResponse;
      const errorMessage = errorData.error || errorData.message || 'Failed to execute query';
      if (logging) {
        logger.error('SQL query error:', errorMessage);
      }
      return { data: [], error: errorMessage };
    }

    const result = responseData as T[];
    if (logging) {
      logger.debug('SQL query result:', result);
    }
    return { data: result, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    if (logging) {
      logger.error('SQL query error:', errorMessage);
    }
    return { data: [], error: errorMessage };
  }
}
