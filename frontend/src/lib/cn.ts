// Utility for conditional classNames (like clsx or cn)
export function cn(...args: any[]): string {
  return args
    .flat(Infinity)
    .filter(Boolean)
    .map((arg) => {
      if (typeof arg === 'string') return arg;
      if (typeof arg === 'object') {
        return Object.entries(arg)
          .filter(([_, v]) => !!v)
          .map(([k]) => k)
          .join(' ');
      }
      return '';
    })
    .filter(Boolean)
    .join(' ');
}
