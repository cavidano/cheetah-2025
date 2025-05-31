export const getCurrentBreakpoint = () => {
  const breakpoint = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue('--current-bp')
    .trim()
    .replace(/^["']|["']$/g, ''); // remove quotes

  const isDesktop = ['lg', 'xl', 'xxl'].includes(breakpoint);
  const isMobile = ['sm', 'md'].includes(breakpoint);

  return {
    value: breakpoint,
    isDesktop,
    isMobile,
  };
};
