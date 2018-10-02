import {Observable} from 'rxjs';
import {Subject} from 'rxjs';
import {of} from 'rxjs';
import {merge} from 'rxjs';
import {NEVER} from 'rxjs';
import {ReplaySubject} from 'rxjs/internal/ReplaySubject';
import {distinctUntilChanged, map, multicast, refCount, scan} from 'rxjs/operators';
import {Evolution, evolutionWithLens} from './evolution';
import {Lens} from './lens';

type Evolver<A> = (evolution: Evolution<A>) => void;

export class Telescope<U> {

  public static of<U>(initialState: U): Telescope<U> {
    const evolutions = new Subject();
    const evolver: Evolver<U> = (evolution) => evolutions.next(evolution);
    const stream = merge(
      of<Evolution<U>>((u) => u), evolutions, NEVER)
      .pipe(
        scan((acc, elem: Evolution<U>) => elem(acc), initialState),
        multicast(() => new ReplaySubject(1)),
        refCount());
    return new Telescope<U>(evolver, stream);
  }

  public readonly stream: Observable<U>;

  private readonly evolver: Evolver<U>;

  constructor(evolver: Evolver<U>, stream: Observable<U>) {
    this.evolver = evolver;
    this.stream = stream.pipe(distinctUntilChanged());
  }

  public evolve(evolution: Evolution<U>): void {
    this.evolver(evolution);
  }

  public update(newState: U): void {
    this.evolve((_) => newState);
  }

  public magnify<P>(lens: Lens<U, P>): Telescope<P> {
    return new Telescope<P>(
      (evolve) => this.evolver(evolutionWithLens(lens, evolve)),
      this.stream.pipe(map(lens.getter), distinctUntilChanged()),
    );
  }
}
