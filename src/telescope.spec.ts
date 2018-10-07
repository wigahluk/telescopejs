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
