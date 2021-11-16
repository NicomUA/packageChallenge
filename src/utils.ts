import { IPackageItem } from './packer.interface';

const sortReverseByCost = (a: IPackageItem, b: IPackageItem) =>
  a.cost > b.cost ? -1 : a.cost < b.cost ? 1 : 0;
const sortByWeight = (a: IPackageItem, b: IPackageItem) =>
  a.weight < b.weight ? -1 : a.weight > b.weight ? 1 : 0;

const weightSum = (items: IPackageItem[]): number => {
  return items.reduce((a, b) => a + b.weight, 0);
};

export { sortReverseByCost, sortByWeight, weightSum };
