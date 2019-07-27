import {merge, NEVER, Observable, of, ReplaySubject, Subject} from 'rxjs';
import {distinctUntilChanged, map, multicast, refCount, scan} from 'rxjs/operators';
import {Evolution} from './evolution';
import {Lens} from './lens';

type Evolver<A> = (evolution: Evolution<A>) => void;

/**
 * A stateful container that exposing a stream of state values that users can subscribe to.
 *
 * A Telescope is an endo-profunctor for a type U which means it accepts new U values and
 * produces U values on the associated stream.
 */
export class Telescope<U> {

  /**
   * Creates a new instance of Telescope containing the given initial value.
   * @param initialState
   */
  static of<U>(initialState: U): Telescope<U> {
    const evolutions = new Subject();
    const evolver: Evolver<U> = evolution => evolutions.next(evolution);
    const stream = merge(
      of<Evolution<U>>(u => u), evolutions, NEVER)
      .pipe(
        scan((acc, elem: Evolution<U>) => elem(acc), initialState),
        // LOCAL MOD: compatible with https://github.com/ReactiveX/rxjs/pull/4816
        multicast(() => new ReplaySubject<U>(1)),
        refCount());
    return new Telescope<U>(evolver, stream);
  }

  /**
   * A stream of the changes in the values of this Telescope.
   */
  readonly stream: Observable<U>;

  constructor(private readonly evolver: Evolver<U>, stream: Observable<U>) {
    this.stream = stream.pipe(distinctUntilChanged());
  }

  /**
   * Converts this Telescope to a new one when given translations "from" a and "to" the new type.
   * @param to: (u: U) => P
   * @param from: (p: P) => U
   */
  dimap<P>(to: (u: U) => P, from: (p: P) => U): Telescope<P> {
    return this.magnify(new Lens(to, (p: P, u: U) => from(p)));
  }

  /**
   * Produces a new Telescope of tuples where the first element is the state of this Telescope and the second one is the
   * given value.
   *
   * After the telescope has been generated, regular evolutions can be applied to the tuple values. If the value of the
   * first entry is not updated, the source Telescope will not emit new changes.
   * @param value
   */
  uplift<C>(value: C): Telescope<{ first: U; second: C; }> {
    let lastC = value;
    const to = (u: U) => ({first: u, second: lastC});
    const constrain = (evolution: Evolution<{ first: U; second: C; }>): Evolution<U> => u => {
      const newPair = evolution({first: u, second: lastC});
      lastC = newPair.second;
      return newPair.first;
    };

    return new Telescope<{ first: U; second: C; }>(evolution => this.evolver(constrain(evolution)),
      this.stream.pipe(map(to), distinctUntilChanged()),
    );
  }

  /**
   * Updates the state of this Telescope using a given evolution [(a: A) => A] as the representation of a delta to be
   * applied. The resulting new state will be a new event in the associated stream.
   * @param evolution
   */
  evolve(evolution: Evolution<U>): void {
    this.evolver(evolution);
  }

  /**
   * Updates the state on this Telescope to the given value causing a new event on the associated stream.
   * @param newState
   */
  update(newState: U): void {
    this.evolve(_ => newState);
  }

  /**
   * Produces a new Telescope focused on a states with a type that can be seen as a projection of the type parameter of
   * this Telescope. The projection is controlled by a Lens wrapping the setter and getter functions.
   * @param lens
   */
  magnify<P>(lens: Lens<U, P>): Telescope<P> {
    const extend = (evolution: Evolution<P>): Evolution<U> => u => lens.setter(evolution(lens.getter(u)), u);

    return new Telescope<P>(evolution => this.evolver(extend(evolution)),
      this.stream.pipe(map(lens.getter), distinctUntilChanged()),
    );
  }
}
