module.exports = {
  apps: [
    {
      name: 'crm-api',
      script: 'dist/server.js',
      cwd: './apps/api',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
  ],
};
