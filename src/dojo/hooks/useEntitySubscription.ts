import { useEffect, useMemo, useState } from 'react';
import { SchemaType } from '@dojoengine/sdk';
import { MetagameClient } from '../../client';

export interface UseEntitySubscriptionOptions {
  query: any;
  namespace: string;
  enabled?: boolean;
  logging?: boolean;
  transform?: (entity: any) => any; // Custom transform function
}

export interface UseEntitySubscriptionResult<T> {
  entities: T[] | null;
  isSubscribed: boolean;
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
export function useEntitySubscription<S extends SchemaType, T = any>(
  client: MetagameClient<S>,
  options: UseEntitySubscriptionOptions
): UseEntitySubscriptionResult<T> {
  const { query, namespace, enabled = true, logging = false, transform } = options;

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [entities, setEntities] = useState<T[] | null>(null);

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
      if (logging) {
        console.log('Subscribing to query:', memoizedQuery);
      }

      const { dojoSDK } = client.getConfig();
      const state = client.getStore().getState();

      const [_initialEntities, subscription] = await dojoSDK.subscribeEntityQuery({
        query: memoizedQuery,
        callback: (response) => {
          if (response.error) {
            console.error('MetagameClient subscription error:', response.error.message);
          } else if (response.data && response.data.length > 0) {
            // Update the store with new entities
            response.data.forEach((entity) => {
              state.updateEntity(entity);
            });
            setEntities(response.data.map(transformEntity));
          }
        },
      });
      setIsSubscribed(true);
      _unsubscribe = () => subscription.cancel();
    };

    setIsSubscribed(false);

    if (enabled) {
      _subscribe();
    } else {
      setEntities(null);
    }
    // umnount
    return () => {
      setIsSubscribed(false);
      _unsubscribe?.();
      _unsubscribe = undefined;
    };
  }, [client, memoizedQuery, entityNamespace, enabled, logging]);

  return {
    entities,
    isSubscribed,
  };
}

export async function subscribeToEntities<S extends SchemaType, T = any>(
  client: MetagameClient<S>,
  options: SubscriptionOptions
): Promise<SubscriptionResult<T>> {
  const { query, namespace, logging = false, transform } = options;
  const entityNamespace = namespace;
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

  const { dojoSDK } = client.getConfig();
  const [_initialEntities, subscription] = await dojoSDK.subscribeEntityQuery({
    query,
    callback: (response) => {
      if (response.error) {
        console.error('Subscription error:', response.error.message);
      } else if (response.data && response.data.length > 0) {
        response.data.forEach((entity) => {
          state.updateEntity(entity);
        });
      }
    },
  });

  const entities = _initialEntities.map(transformEntity);

  return {
    entities,
    unsubscribe: () => subscription.cancel(),
  };
}
