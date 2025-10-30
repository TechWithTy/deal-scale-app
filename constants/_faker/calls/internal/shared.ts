import { Faker, faker as globalFaker } from "@faker-js/faker";

export const getRandomizer = (randomizer?: Faker): Faker =>
        randomizer ?? globalFaker;

export const generatePhoneNumber = (randomizer?: Faker): string => {
        const source = getRandomizer(randomizer);
        const areaCode = source.number.int({ min: 100, max: 999 });
        const prefix = source.number.int({ min: 100, max: 999 });
        const lineNumber = source.number.int({ min: 1000, max: 9999 });
        return `+1-${areaCode}-${prefix}-${lineNumber}`;
};
