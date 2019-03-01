# server

A good `.vscode/launch.json` configuration.
```json
{
  "type": "node",
  "request": "attach",
  "name": "Debug server",
  "processId": "${command:PickProcess}",
  "restart": true,
  "protocol": "inspector",
  "outFiles": [
    "${workspaceFolder}/packages/server/build/main.js",
    "${workspaceFolder}/packages/server/build/main.map"
  ]
}
```

Changing `--inspect` to `--inspect-brk` in `dev` script will pause the run until the debugger attaches.