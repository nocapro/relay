import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/dashboard.tsx'),
  route('history', 'routes/history.tsx'),
  route('settings', 'routes/settings.tsx'),
] satisfies RouteConfig;
