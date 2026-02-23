/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features if needed
  experimental: {
    // serverActions: true,
  },
  
  // TypeScript decorators require this
  typescript: {
    // Disable type checking during build if needed
    // ignoreBuildErrors: false,
  },
  
  // Webpack configuration for decorators
  webpack: (config) => {
    // Ensure decorators work properly
    config.module.rules.push({
      test: /\.tsx?$/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            compilerOptions: {
              experimentalDecorators: true,
              emitDecoratorMetadata: true,
            },
          },
        },
      ],
    })
    
    return config
  },
}

module.exports = nextConfig
