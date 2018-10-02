import {Lens} from './lens';

export type Evolution<A> = (a: A) => A;

export const evolutionWithLens = <P, U>(lens: Lens<U, P>, evolution: Evolution<P>): Evolution<U> =>
    (u) => lens.setter(evolution(lens.getter(u)), u);
