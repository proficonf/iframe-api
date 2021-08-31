import {
    FactoryMockHelper,
    AsyncHelper
} from '@proficonf/utils/testing/helpers';

export const factoryMockHelper = new FactoryMockHelper(jasmine);
export const asyncHelper = new AsyncHelper(jasmine, setImmediate);
