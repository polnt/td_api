let pkg: any;
(async () => {
  const autoBind = await import('auto-bind');
  pkg = autoBind.default;
})();

export { pkg };
