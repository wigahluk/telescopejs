import {merge, NEVER, Observable, of, Subject} from 'rxjs';
import {ReplaySubject} from 'rxjs/internal/ReplaySubject';
import {distinctUntilChanged, map, multicast, refCount, scan} from 'rxjs/operators';
import {Evolution} from './evolution';
import {Lens} from './lens';

type Evolver<A> = (evolution: Evolution<A>) => void;

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
