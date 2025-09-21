// functions/worker-shim.d.ts
declare module '../dist/_worker.js' {
  const worker: {
    fetch: (request: Request, env: Env, ctx: any) => Promise<Response>;
  };
  export default worker;
}
