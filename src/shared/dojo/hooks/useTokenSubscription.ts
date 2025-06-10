import { useEffect, useMemo, useState } from 'react';
import { SchemaType } from '@dojoengine/sdk';
import { MetagameClient } from '../../client';

export interface UseTokenSubscriptionOptions {
  contractAddress: string;
  enabled?: boolean;
  logging?: boolean;
  transform?: (entity: any) => any; // Custom transform function
}

export interface UseTokenSubscriptionResult<T> {
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
export function useTokenSubscription<S extends SchemaType, T = any>(
  client: MetagameClient<S>,
  options: UseTokenSubscriptionOptions
): UseTokenSubscriptionResult<T> {
  const { contractAddress, enabled = true, logging = false, transform } = options;

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [entities, setEntities] = useState<any[] | null>(null);
  const [error, setError] = useState<Error | undefined>(undefined);

  // Default transform function if none provided
  const defaultTransform = (entity: any) => {
    const { entityId, models } = entity;
    return {
      entityId,
      ...models[contractAddress],
    } as T;
  };

  // Use custom transform or default
  const transformEntity = transform || defaultTransform;

  useEffect(() => {
    let _unsubscribe: (() => void) | undefined;
    const _subscribe = async () => {
      try {
        if (logging) {
          console.log('Subscribing to contract:', contractAddress);
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

        const subscription = await dojoSDK.client.onTokenUpdated(
          [contractAddress],
          [],
          (response: any) => {
            console.log('response:', response);
          }
        );
        // setEntities(response);
        // state.setEntities(response.items.map(transformEntity));
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
  }, [client, contractAddress, enabled, logging]);

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
