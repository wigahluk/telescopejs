import {merge, NEVER, Observable, of, Subject} from 'rxjs';
import {ReplaySubject} from 'rxjs/internal/ReplaySubject';
import {distinctUntilChanged, map, multicast, refCount, scan} from 'rxjs/operators';
import {Evolution} from './evolution';
import {Lens} from './lens';
import {Pair} from './par';

type Evolver<S, T> = (evolution: Evolution<S, T>) => void;

export class Telescope<S, T> {

  public static of<U>(initialState: U): Telescope<U, U> {
    const evolutions = new Subject();
    const evolver: Evolver<U, U> = evolution => evolutions.next(evolution);
    const stream = merge(
      of<Evolution<U, U>>(u => new Pair(u, u)), evolutions, NEVER)
      .pipe(
        scan(
          (acc, elem: Evolution<U, U>) => elem(acc.first),
          new Pair(initialState, initialState)),
        multicast(() => new ReplaySubject(1)),
        refCount());
    return new Telescope<U, U>(evolver, stream);
  }

  public readonly stream: Observable<Pair<S, T>>;

  private readonly evolver: Evolver<S, T>;

  constructor(evolver: Evolver<S, T>, stream: Observable<Pair<S, T>>) {
    this.evolver = evolver;
    this.stream = stream.pipe(distinctUntilChanged());
  }

  public evolve(evolution: Evolution<S, T>): void {
    this.evolver(evolution);
  }

  public update(newState: T): void {
    this.evolve(s => new Pair(s, newState));
  }

  public magnify<A, B>(lens: Lens<S, T, A, B>): Telescope<A, B> {
    const StToAb = (evolution: Evolution<A, B>): Evolution<S, T> => {
      return s => {
        const a: A = lens.getter(s);
        const pairAB = evolution(a);
        const t = lens.setter(pairAB.second, s);
        return new Pair(s, t);
      };
    };

    const abEvolver = (evolution: Evolution<A, B>) => this.evolver(StToAb(evolution));

    const m = (st: Pair<S, T>): Pair<A, B> => {
      const a: A = lens.getter(st.first);

      // This means there will be no new b's
      // unless there is a new evolution a -> b
      return new Pair(a, undefined);
    };

    return new Telescope<A, B>(abEvolver,
      this.stream.pipe(map(m), distinctUntilChanged()),
    );
  }
}
