export interface FilterOptions {
  exclude?: string | string[];
  include?: string | string[];
}

export default interface Options extends FilterOptions {
  from: string | string[];
  silent?: boolean;
}
