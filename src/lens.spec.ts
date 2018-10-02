import {Lens} from "./lens";

describe('Lens', () => {
  it('Identity', () => {
    const l = new Lens(u => u, (u, _) => u);
    expect(l.getter(1)).toBe(1);
  });
});