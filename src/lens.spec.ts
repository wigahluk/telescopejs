import {Lens} from './lens';

describe('Lens', () => {
  const idGetter = <A>(a: A) => a;
  const idSetter = <A>(a: A, _: A) => a;
  const identityLens = new Lens(idGetter, idSetter);

  it('Identity getter', () => {
    expect(identityLens.getter(1)).toBe(1);
  });

  it('Identity setter', () => {
    expect(identityLens.setter(1, 2)).toBe(1);
  });

  // The well behaved lens.
  it('set.get law with identity', () => {
    expect(identityLens.setter(identityLens.getter(1), 2)).toBe(1);
  });

  it('get.set law with identity', () => {
    expect(identityLens.getter(identityLens.setter(1, 2))).toBe(1);
  });

  it('set.set law with identity', () => {
    expect(identityLens.setter(3, identityLens.setter(1, 2))).toBe(identityLens.setter(3, 2));
  });

  describe('Composing commutative lenses', () => {
    const divideBy2 = (u: number) => u / 2;
    const divideBy3 = (u: number) => u / 3;
    const multiplyBy2 = (p: number, _: number) => p * 2;
    const multiplyBy3 = (p: number, _: number) => p * 3;
    const lensTwo = new Lens(divideBy2, multiplyBy2);
    const lensThree = new Lens(divideBy3, multiplyBy3);
    const lensSix = lensTwo.compose(lensThree);

    it('composition getter', () => {
      expect(lensSix.getter(2 * 3 * 5)).toBe(lensThree.getter(lensTwo.getter(2 * 3 * 5)));
    });

    it('composition setter', () => {
      expect(lensSix.setter(5, 1)).toBe(lensTwo.setter(lensThree.setter(5, 1), 2));
    });
  });

  describe('Composing noncommutative lenses', () => {
    const addPlus = (u: string) => `${u}+`;
    const addMinus = (u: string) => `${u}-`;
    const removeLast = (p: string, _: string) => p.substr(0, p.length - 1);
    const lensPlus = new Lens(addPlus, removeLast);
    const lensMinus = new Lens(addMinus, removeLast);
    const lens = lensPlus.compose(lensMinus);

    it('composition getter', () => {
      expect(lens.getter('x')).toBe(lensMinus.getter(lensPlus.getter('x')));
    });

    it('composition setter', () => {
      expect(lens.setter('aaa', '')).toBe(lensPlus.setter(lensMinus.setter('aaa', ''), ''));
    });
  });
});
