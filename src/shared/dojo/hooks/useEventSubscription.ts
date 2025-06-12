import { useEffect, useMemo, useState } from 'react';
import { SchemaType } from '@dojoengine/sdk';
import { MetagameClient } from '../../client';

export interface UseEventSubscriptionOptions {
  query: any;
  namespace: string;
  enabled?: boolean;
  logging?: boolean;
  transform?: (entity: any) => any; // Custom transform function
}

export interface UseEventSubscriptionResult<T> {
  entities: T[] | null;
  isSubscribed: boolean;
  error?: Error;
}

export interface SubscriptionOptions {
  query: any;
  namespace: string;
  logging?: boolean;
  transform?: (entity: any) => any;
}

export interface SubscriptionResult<T> {
  entities: T[] | null;
  unsubscribe: () => void;
}

/**
 * Base hook for subscribing to entity queries
 */
export function useEventSubscription<S extends SchemaType, T = any>(
  client: MetagameClient<S>,
  options: UseEventSubscriptionOptions
): UseEventSubscriptionResult<T> {
  const { query, namespace, enabled = true, logging = false, transform } = options;

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [entities, setEntities] = useState<T[] | null>(null);
  const [error, setError] = useState<Error | undefined>(undefined);

  const entityNamespace = namespace;

  // Memoize the query to prevent unnecessary re-subscriptions
  const memoizedQuery = useMemo(() => query, [JSON.stringify(query)]);

  // Default transform function if none provided
  const defaultTransform = (entity: any) => {
    const { entityId, models } = entity;
    return {
      entityId,
      ...models[entityNamespace],
    } as T;
  };

  // Use custom transform or default
  const transformEntity = transform || defaultTransform;

  useEffect(() => {
    let _unsubscribe: (() => void) | undefined;
    const _subscribe = async () => {
      try {
        if (logging) {
          console.log('Subscribing to query:', memoizedQuery);
        }

        const { dojoSDK } = client.getConfig();

        // Check if dojoSDK exists
        if (!dojoSDK) {
          const error = new Error(
            'dojoSDK is required for entity subscriptions. Please provide dojoSDK when initializing the MetagameClient.'
          );
          setError(error);
          console.error(error.message);
          return;
        }

        const state = client.getStore().getState();

        const [_response, subscription] = await dojoSDK.subscribeEventQuery({
          query: memoizedQuery,
          callback: (response) => {
            console.log('response:', response);
            if (response.error) {
              console.error('MetagameClient subscription error:', response.error.message);
            } else if (response.data && response.data.length > 0) {
              console.log(
                'useSdkSubscribeEntities() transformEntity:',
                response.data.map(transformEntity)
              );
              response.data.forEach((entity) => {
                state.updateEntity(transformEntity(entity));
              });
            }
          },
        });
        setEntities(_response.getItems().map(transformEntity));
        state.setEntities(_response.getItems().map(transformEntity));
        setIsSubscribed(true);
        _unsubscribe = () => subscription.cancel();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Error in entity subscription:', error.message);
      }
    };

    setIsSubscribed(false);
    setError(undefined);

    if (enabled) {
      _subscribe();
    } else {
      setEntities(null);
    }
    // unmount
    return () => {
      setIsSubscribed(false);
      _unsubscribe?.();
      _unsubscribe = undefined;
    };
  }, [client, memoizedQuery, entityNamespace, enabled, logging]);

  return {
    entities,
    isSubscribed,
    error,
  };
}

export async function subscribeToEvents<S extends SchemaType, T = any>(
  client: MetagameClient<S>,
  options: SubscriptionOptions
): Promise<SubscriptionResult<T>> {
  const { query, namespace, logging = false, transform } = options;
  const entityNamespace = namespace;

  // Check if dojoSDK exists
  const { dojoSDK } = client.getConfig();
  if (!dojoSDK) {
    throw new Error(
      'dojoSDK is required for entity subscriptions. Please provide dojoSDK when initializing the MetagameClient.'
    );
  }

  const state = client.getStore().getState();

  const defaultTransform = (entity: any) => {
    const { entityId, models } = entity;
    return {
      entityId,
      ...models[entityNamespace],
    } as T;
  };

  const transformEntity = transform || defaultTransform;

  if (logging) {
    console.log('Subscribing to query:', query);
  }

  const [response, subscription] = await dojoSDK.subscribeEventQuery({
    query,
    callback: (response) => {
      if (response.error) {
        console.error('Subscription error:', response.error.message);
      } else if (response.data && response.data.length > 0) {
        console.log('useSdkSubscribeEntities() response.data:', response.data);
        response.data.forEach((entity) => {
          state.updateEntity(entity);
        });
      }
    },
  });

  // const entities = _initialEntities.map(transformEntity);
  const initialEntities = response.getItems();
  const entities = initialEntities.map(transformEntity);
  state.setEntities(entities);

  return {
    entities,
    unsubscribe: () => subscription.cancel(),
  };
}
