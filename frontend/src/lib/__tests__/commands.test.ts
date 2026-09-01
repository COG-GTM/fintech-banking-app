import {
  buildCommands,
  filterCommands,
} from '../commands';

describe('command filtering', () => {
  const commands = buildCommands();

  it('returns all commands for an empty query', () => {
    expect(filterCommands(commands, '')).toEqual(commands);
  });

  it('ranks label prefix matches before keyword matches', () => {
    const results = filterCommands(commands, 'trans');

    expect(results.slice(0, 2).map((command) => command.label)).toEqual([
      'Transactions',
      'Transfer',
    ]);
  });

  it('matches keywords', () => {
    expect(filterCommands(commands, 'wire')[0].label).toBe('Transfer');
  });

  it('matches labels with fuzzy subsequences', () => {
    const labels = filterCommands(commands, 'crd').map((command) => command.label);

    expect(labels).toEqual(expect.arrayContaining(['Cards', 'Credit Cards']));
  });

  it('returns no results for nonsense', () => {
    expect(filterCommands(commands, 'zzzz-not-a-command')).toEqual([]);
  });
});
