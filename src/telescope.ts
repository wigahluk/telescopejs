import {merge, NEVER, Observable, of, Subject} from 'rxjs';
import {ReplaySubject} from 'rxjs/internal/ReplaySubject';
import {distinctUntilChanged, map, multicast, refCount, scan} from 'rxjs/operators';
import {Evolution} from './evolution';
import {Lens} from './lens';

type Evolver<A> = (evolution: Evolution<A>) => void;

interface Pair<A, B> {first: A; second: B; }

/**
 * A stateful container that exposing a stream of state values that users can subscribe to.
 *
 * A Telescope is an endo-profunctor for a type U which means it accepts new U values and
 * produces U values on the associated stream.
 */
export class Telescope<U> {

  public static of<U>(initialState: U): Telescope<U> {
    const evolutions = new Subject();
    const evolver: Evolver<U> = evolution => evolutions.next(evolution);
    const stream = merge(
      of<Evolution<U>>(u => u), evolutions, NEVER)
      .pipe(
        scan((acc, elem: Evolution<U>) => elem(acc), initialState),
        multicast(() => new ReplaySubject(1)),
        refCount());
    return new Telescope<U>(evolver, stream);
  }

  public readonly stream: Observable<U>;

  constructor(private readonly evolver: Evolver<U>, stream: Observable<U>) {
    this.stream = stream.pipe(distinctUntilChanged());
  }

  public dimap<P>(to: (u: U) => P, from: (p: P) => U): Telescope<P> {
    const extend = (evolution: Evolution<P>): Evolution<U> => u => from(evolution(to(u)));
    return new Telescope<P>(evolution => this.evolver(extend(evolution)),
      this.stream.pipe(map(to), distinctUntilChanged()),
    );
  }

  public uplift<C>(value: C): Telescope<{first: U; second: C; }> {
    let lastC = value;
    const to = (u: U) => ({first: u, second: lastC });
    const extend = (evolution: Evolution<{first: U; second: C; }>): Evolution<U> => u => {
      const newPair = evolution({first: u, second: lastC});
      lastC = newPair.second;
      return newPair.first;
    };

    return new Telescope<{first: U; second: C; }>(evolution => this.evolver(extend(evolution)),
      this.stream.pipe(map(to), distinctUntilChanged()),
    );
  }

  public evolve(evolution: Evolution<U>): void {
    this.evolver(evolution);
  }

  public update(newState: U): void {
    this.evolve(_ => newState);
  }

  public magnify<P>(lens: Lens<U, P>): Telescope<P> {
    const extend = (evolution: Evolution<P>): Evolution<U> => u => lens.setter(evolution(lens.getter(u)), u);

    return new Telescope<P>(evolution => this.evolver(extend(evolution)),
      this.stream.pipe(map(lens.getter), distinctUntilChanged()),
    );
  }
}
