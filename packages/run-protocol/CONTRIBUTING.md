# Contract style

## Invitations

Facet methods that create invitations should adhere to this style:

```
makeFooInvitation: () => {
    …
    return zcf.makeInvitation(helper.handleFooOffer, 'Foo');
},
```

For example,
```
makeVaultCloseInvitation: () => {
    …
    return zcf.makeInvitation(helper.handleVaultCloseOffer, 'VaultClose');
},
```
