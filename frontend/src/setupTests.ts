import '@testing-library/jest-dom';

// keep existing Korean-text assertions passing regardless of jsdom's default navigator.language
localStorage.setItem('mtl_locale', 'ko');

if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
