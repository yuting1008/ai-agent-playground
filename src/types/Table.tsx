export type TableItem = {
  value: string;
  key: string;
  unit?: string;
};

export type TableSheet = {
  name: string;
  items: TableItem[];
};
