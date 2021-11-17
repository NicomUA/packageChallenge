import { ApiError } from './error';
import * as fs from 'fs';
import { IPackage, IPackageItem } from './packer.interface';
import LineReader from 'n-readlines';
import { sortByWeight, sortReverseByCost, weightSum } from './utils';

export class Packer {
  static pack(inputFile: string): string {
    if (!inputFile) throw new ApiError('File path in empty');
    if (!fs.existsSync(inputFile)) throw new ApiError(`File doesn't exist`);

    const results = [];
    const liner = new LineReader(inputFile);
    let buffer;

    // use buffer read lib to avoid big memory consumption in large files
    while ((buffer = liner.next())) {
      try {
        const line = buffer.toString();
        const pack = Packer.parse(line);
        results.push(Packer.calculate(pack));
      } catch (e) {
        throw e;
      }
    }

    return results.join('\n');
  }

  static parse(line: string): IPackage {
    const WEIGHT_LIMIT = 100;
    const ITEMS_LIMIT = 15;
    const ITEM_MAX_WEIGHT_COST = 100;

    // regular expression for parsing items
    const re = /(?<index>\d+),(?<weight>\d+\.\d+),.(?<cost>\d+(\.\d+)?)/i;
    // split weight and items
    const [totalWeight, itemsLine] = line.split(':').map((s) => s.trim());

    if (parseInt(totalWeight) > WEIGHT_LIMIT) {
      throw new ApiError(
        `Target package weight should not be more than ${WEIGHT_LIMIT}`,
      );
    }

    const itemsSplitted = itemsLine.split(' ');
    if (itemsSplitted.length > ITEMS_LIMIT) {
      throw new ApiError(
        `Items in line should not be more than ${ITEMS_LIMIT}`,
      );
    }

    const items = itemsSplitted.map((l) => {
      // check if items in right format
      if (!re.test(l)) throw new ApiError(`Line "${line}" format is incorrect`);
      const matches = re.exec(l);
      // extract data from regular expression results
      const { index, weight, cost } = matches?.groups || {};

      if (parseFloat(weight) > ITEM_MAX_WEIGHT_COST) {
        throw new ApiError(
          `Item weight should not be more than ${ITEM_MAX_WEIGHT_COST}`,
        );
      }

      if (parseFloat(cost) > ITEM_MAX_WEIGHT_COST) {
        throw new ApiError(
          `Item cost should not be more than ${ITEM_MAX_WEIGHT_COST}`,
        );
      }

      // convert all items to numbers to prevent any data mismatch in calculation
      return {
        index: parseInt(index),
        weight: parseFloat(weight),
        cost: parseFloat(cost),
      } as IPackageItem;
    });

    return {
      totalWeight: parseInt(totalWeight),
      items,
    };
  }

  static calculate(pack: IPackage): string {
    const { totalWeight } = pack;
    const items = pack.items
      // filtering items that already bigger then target weight
      .filter((i) => i.weight < totalWeight)
      // reverse sorting by cost
      .sort(sortReverseByCost);

    // if there are no items left then skip logic and return '-'
    if (!items.length) return '-';

    const combinations = new Map();
    //calculate combination and hash them by total cost
    for (const n of items) {
      let tWeight = n.weight;
      let tCost = n.cost;
      const currentCombo = [n];

      for (const nn of items) {
        // skip same item
        if (n.index == nn.index) continue;

        // is current combination will exceed package limit
        if (tWeight + nn.weight > totalWeight) continue;

        tWeight += nn.weight;
        tCost += nn.cost;
        currentCombo.push(nn);
      }

      // if where are already combination with same cost choose lighter
      if (combinations.has(tCost)) {
        const existCombo = combinations.get(tCost);
        if (weightSum(existCombo) > weightSum(currentCombo)) {
          combinations.set(tCost, currentCombo);
        }
      } else {
        combinations.set(tCost, currentCombo);
      }
    }

    const maxCost = Math.max(...combinations.keys());
    const resultItems: IPackageItem[] = combinations.get(maxCost);

    return resultItems
      .sort(sortByWeight)
      .map((i) => i.index)
      .join(',');
  }
}
