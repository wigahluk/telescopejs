export class Lens<S, T, A, B> {
  public readonly getter: (s: S) => A;
  public readonly setter: (b: B, s: S) => T;

  constructor(getter: (s: S) => A, setter: (b: B, s: S) => T) {
    this.getter = getter;
    this.setter = setter;
  }

  public compose<C, D>(lens: Lens<A, B, C, D>): Lens<S, T, C, D> {
    const newGetter = (s: S) =>
      lens.getter(this.getter(s));
    const newSetter = (d: D, s: S) =>
      this.setter(lens.setter(d, this.getter(s)), s);

    return new Lens<S, T, C, D>(newGetter, newSetter);
  }
}

export type SimpleLens<S, A> = Lens<S, S, A, A>;
