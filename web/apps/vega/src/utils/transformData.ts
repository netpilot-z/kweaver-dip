export const proxyData = <T extends Record<string, any>>(data: T): T => {
  const handler: ProxyHandler<T> = {
    get: (target: T, key: PropertyKey, receiver: any): any => {
      try {
        if (typeof key === 'string') {
          const underlineKey = key.replace(/[A-Z]/g, (word) => `_${word.toLowerCase()}`);

          const value = Reflect.get(target, underlineKey, receiver);

          return typeof value === 'undefined' ? Reflect.get(target, key, receiver) : value;
        }
      } catch (e) {
        console.error(`is not ${String(key)}`);
      }
    },
  };

  return new Proxy(data, handler);
};

export function transformData<T>(data: any): T {
  if (typeof data !== 'object' || data === null) return data;

  const newData = proxyData(data);

  const fn = (obj: any): void => {
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        obj[key] = proxyData(obj[key]);
        fn(obj[key]);
      }
    });
  };

  fn(newData);

  return newData;
}
