import { useCallback, useEffect, useState } from 'react';
import { SchemaType } from '@dojoengine/sdk';
import { MetagameClient } from '../../client';
import { getMetagameClient } from '../../singleton';
import { logger } from '../../utils/logger';
import { addAddressPadding } from 'starknet';

export interface UseTokenSubscriptionOptions {
  contractAddress: string;
  enabled?: boolean;
  logging?: boolean;
  transform?: (entity: any) => any; // Custom transform function
  onUpdate?: (entity: any) => void; // Callback for entity updates
}

export interface UseTokenSubscriptionResult<T> {
  entities: T[] | null;
  isSubscribed: boolean;
  error?: Error;
}

export interface SubscriptionResult<T> {
  entities: T[] | null;
  unsubscribe: () => void;
}

/**
 * Base hook for subscribing to entity queries
 */
export function useTokenSubscription<S extends SchemaType, T = any>(
  client: MetagameClient<S> | null,
  options: UseTokenSubscriptionOptions
): UseTokenSubscriptionResult<T> {
  const { contractAddress, enabled = true, logging = false, transform, onUpdate } = options;

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [entities, setEntities] = useState<any[] | null>(null);
  const [error, setError] = useState<Error | undefined>(undefined);

  // Default transform function if none provided
  const defaultTransform = (entity: any) => {
    return entity;
  };

  // Use custom transform or default
  const transformEntity = transform || defaultTransform;

  useEffect(() => {
    let _unsubscribe: (() => void) | undefined;
    const _subscribe = async () => {
      try {
        if (!client) {
          setEntities(null);
          setIsSubscribed(false);
          return;
        }

        if (logging) {
          logger.debug('Subscribing to contract:', contractAddress);
        }

        const { dojoSDK } = client.getConfig();

        // Check if dojoSDK exists
        if (!dojoSDK) {
          const error = new Error(
            'dojoSDK is required for token subscriptions. Please provide dojoSDK when initializing the MetagameClient.'
          );
          setError(error);
          logger.error(error.message);
          return;
        }

        const state = client.getStore().getState();

        const [_response, subscription] = await dojoSDK.subscribeToken({
          contractAddresses: [contractAddress],
          callback: (response) => {
            if (response.error) {
              logger.error('Subscription error:', response.error.message);
            } else if (onUpdate && response.data) {
              logger.debug('useSdkSubscribeEntities() response.data:', response.data);
              onUpdate(transformEntity(response.data));
            }
          },
        });

        setEntities(_response.items);
        state.setEntities(_response.items.map(transformEntity));

        // Trigger onUpdate for initial items if provided
        if (onUpdate && _response.items) {
          _response.items.forEach((item: any) => {
            onUpdate(transformEntity(item));
          });
        }

        setIsSubscribed(true);
        _unsubscribe = () => subscription.cancel();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        logger.error('Error in entity subscription:', error.message);
      }
    };

    setIsSubscribed(false);
    setError(undefined);

    if (enabled && client) {
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
