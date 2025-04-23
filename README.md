# Metagame SDK

A JavaScript/TypeScript SDK for interacting with Metagame components in Dojo.

## Getting Started

1. Add `metagame-sdk` to your dependencies.

```shell
bun add metagame-sdk
```

2. Wrap your app with `MetagameProvider` and pass in your `toriiUrl` and starknet `provider`.

```tsx
export const MetagameProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [metagameClient, setMetagameClient] = useState<MetagameClient<any> | null>(null);
  const { provider } = useProvider();

  useEffect(() => {
    async function initialize() {
      const metagameClient = initMetagame<SchemaType>({
        toriiUrl: dojoConfig.toriiUrl,
        provider: provider,
      });

      setMetagameClient(metagameClient);
    }

    initialize();
  }, []);

  if (!metagameClient) {
    return <div>Loading...</div>;
  }

  return <MetagameProviderSDK metagameClient={metagameClient!}>{children}</MetagameProviderSDK>;
};
```

3. Access the hooks from your components.

```tsx
const { data: miniGames } = useMiniGames({});
```

Output:

```ts
[
  {
    contract_address: '0x020fc3c9efd0dde5f53642dac7f53638aeaae98ff9af5f1642546f389ce9dec5',
    creator_address: '0x000b39b235b44c53a2e9f0c5d35939d9c8e8dafdd0a2ba2e695b501fc1e9fd2f',
    description: "Dark Shuffle is a turn-based, collectible card game. Build your deck, battle monsters, and explore a procedurally generated world.",
    developer: 'Provable Games',
    genre: 'Digital TCG / Deck Building',
    image: 'https://github.com/Provable-Games/dark-shuffle/blob/main/client/public/favicon.svg',
    name: 'Dark Shuffle',
    publisher: 'Provable Games',
  },
]
```

## License

This project is licensed under the MIT License.
