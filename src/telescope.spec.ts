import {skip} from 'rxjs/operators';
import {Lens} from './lens';
import {Telescope} from './telescope';

describe('Telescope', () => {
  it('brand new should emit initial value', done => {
    Telescope.of(1).stream.subscribe(n => {
      expect(n).toBe(1);
      done();
    });
  });

  it('should update', done => {
    const t = Telescope.of(1);
    t.stream.pipe(skip(1)).subscribe(n => {
      expect(n).toBe(2);
      done();
    });
    t.update(2);
  });

  it('dimap', done => {
    const divideBy2 = (u: number) => u / 2;
    const multiplyBy2 = (p: number) => p * 2;
    const tNat = Telescope.of(2);
    const tEven = tNat.dimap(multiplyBy2, divideBy2);
    tEven.stream.pipe(skip(1)).subscribe(next => {
      expect(next).toBe(2);
      done();
    });
    tNat.update(1);
  });

  it('uplift with update on source should update first element', done => {
    const tInt = Telescope.of(1);
    const tIntString = tInt.uplift<string>('a');
    tIntString.stream.pipe(skip(1)).subscribe(next => {
      expect(next.first).toBe(2);
      expect(next.second).toBe('a');
      done();
    });
    tInt.update(2);
  });

  it('uplift with update on second element should update all', done => {
    const tInt = Telescope.of(1);
    const tIntString = tInt.uplift<string>('a');
    tIntString.stream.pipe(skip(1)).subscribe(next => {
      expect(next.first).toBe(2);
      expect(next.second).toBe('b');
      done();
    });
    tIntString.update({first: 2, second: 'b'});
  });

  it('getter should magnify when given a lens', done => {
    const divideBy2 = (u: number) => u / 2;
    const multiplyBy2 = (p: number, _: number) => p * 2;
    const lensTwo = new Lens(divideBy2, multiplyBy2);
    const tUniverse = Telescope.of(2);
    const tPart = tUniverse.magnify(lensTwo);
    tPart.stream.pipe(skip(1)).subscribe(next => {
      expect(next).toBe(2);
      done();
    });
    tUniverse.update(4);
  });

  it('setter should magnify when given a lens', done => {
    const divideBy2 = (u: number) => u / 2;
    const multiplyBy2 = (p: number, _: number) => p * 2;
    const lensTwo = new Lens(divideBy2, multiplyBy2);
    const tUniverse = Telescope.of(2);
    const tPart = tUniverse.magnify(lensTwo);
    tUniverse.stream.pipe(skip(1)).subscribe(next => {
      expect(next).toBe(6);
      done();
    });
    tPart.update(3);
  });
});
