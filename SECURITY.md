# Security

Do not commit `.env`, private keys, mnemonic phrases, API keys, session tokens, or rendered logs containing secrets.

Read-only commands accept public wallet addresses and do not need wallet secrets.

Write commands require:

- `PRIVATE_KEY`
- `CROSS_TREASURY_ENABLE_WRITES=true`
- `--execute`
- `--confirm`
- CROSS chain id `612055`
- configured gas reserve and notional caps

Report security issues privately to the repository owner before public disclosure.
