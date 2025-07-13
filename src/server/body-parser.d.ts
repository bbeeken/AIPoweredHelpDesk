declare module 'custom-body-parser' {
  import { json } from 'body-parser';
  const _default: { json: typeof json };
  export { json };
  export default _default;
}
