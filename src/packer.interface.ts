export interface IPackageItem {
  index: number;
  weight: number;
  cost: number;
}

export interface IPackage {
  totalWeight: number;
  items: IPackageItem[];
}
