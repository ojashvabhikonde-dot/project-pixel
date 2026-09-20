import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/pixie-ai',
        destination: '/assistant',
        permanent: true,
      },
      {
        source: '/pixie',
        destination: '/assistant',
        permanent: true,
      },
      {
        source: '/ai',
        destination: '/assistant',
        permanent: true,
      },
      {
        source: '/events',
        destination: '/shutter-stories',
        permanent: true,
      },
      {
        source: '/exhibition',
        destination: '/shutter-stories',
        permanent: true,
      },
      {
        source: '/contact',
        destination: '/hire',
        permanent: true,
      },
      {
        source: '/booking',
        destination: '/hire',
        permanent: true,
      },
      {
        source: '/bookings',
        destination: '/hire',
        permanent: true,
      },
      {
        source: '/members',
        destination: '/leadership',
        permanent: true,
      },
      {
        source: '/crew',
        destination: '/leadership',
        permanent: true,
      },
      {
        source: '/team',
        destination: '/leadership',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

