import React from 'react';

/**
 * Scalable and flexible lazy loader for application routes.
 * Supports both named and default exports seamlessly with automatic type safety.
 *
 * Usage with named export:
 *   const LandingPage = lazyLoad(() => import('../pages/public/LandingPage'), 'LandingPage');
 *
 * Usage with default export:
 *   const AdminSettingsPage = lazyLoad(() => import('../pages/admin/AdminSettingsPage'));
 */
export function lazyLoad<T extends Record<string, any>>(
  importer: () => Promise<T>,
  exportName?: keyof T
): React.LazyExoticComponent<React.ComponentType<any>> {
  return React.lazy(async () => {
    try {
      const module = await importer();
      if (exportName && module[exportName]) {
        return { default: module[exportName] as React.ComponentType<any> };
      }
      if (module.default) {
        return { default: module.default as React.ComponentType<any> };
      }
      // Fallback: pick the first exported component function
      const firstExport = Object.values(module).find((val) => typeof val === 'function');
      if (firstExport) {
        return { default: firstExport as React.ComponentType<any> };
      }
      throw new Error(`Component could not be resolved from module.`);
    } catch (error) {
      console.error('Route chunk load failure:', error);
      throw error;
    }
  });
}
