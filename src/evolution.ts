import {Pair} from './par';

export type Evolution<A, B> = (a: A) => Pair<A, B>;
