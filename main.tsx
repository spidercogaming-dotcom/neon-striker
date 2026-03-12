services:
  - type: web
    name: neon-strike-server
    env: node
    plan: free
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: PORT
        value: 10000
