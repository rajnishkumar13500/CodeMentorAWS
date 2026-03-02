module.exports = {
    apps: [{
        name: 'compiler-ai-backend',
        script: 'index.js',
        instances: 'max', // Use all available CPU cores
        exec_mode: 'cluster', // Enable cluster mode for load balancing
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'development',
            PORT: 4000
        },
        env_production: {
            NODE_ENV: 'production',
            PORT: 4000
        },
        // Logging configuration
        log_file: './logs/pm2-combined.log',
        error_file: './logs/pm2-error.log',
        out_file: './logs/pm2-out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        merge_logs: true,
        // Graceful shutdown
        kill_timeout: 5000,
        wait_ready: true,
        listen_timeout: 10000
    }]
};
