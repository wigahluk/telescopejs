export class Lens<U, P> {
  readonly getter : (u: U) => P;
  readonly setter : (p: P, u: U) => U;

  constructor(getter: (u: U) => P, setter: (p: P, u: U) => U) {
    this.getter = getter;
    this.setter = setter;
  }

  compose<Q>(lens: Lens<P, Q>): Lens<U,Q> {
    const newGetter = (u: U) => lens.getter(this.getter(u));
    const newSetter = (q: Q, u: U) => this.setter(lens.setter(q, this.getter(u)), u);

    return new Lens<U, Q>(newGetter, newSetter);
  }
}
