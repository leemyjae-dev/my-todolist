import { describe, it, expect, beforeEach } from 'vitest';
import { useFilterStore } from './filterStore';

describe('useFilterStore', () => {
  beforeEach(() => {
    useFilterStore.setState({ categoryId: undefined, status: undefined, page: 1 });
  });

  it('setCategoryId 호출시 page가 1로 리셋된다', () => {
    useFilterStore.getState().setPage(3);
    useFilterStore.getState().setCategoryId('cat-1');
    expect(useFilterStore.getState().categoryId).toBe('cat-1');
    expect(useFilterStore.getState().page).toBe(1);
  });

  it('setStatus 호출시 page가 1로 리셋된다', () => {
    useFilterStore.getState().setPage(5);
    useFilterStore.getState().setStatus('IN_PROGRESS');
    expect(useFilterStore.getState().status).toBe('IN_PROGRESS');
    expect(useFilterStore.getState().page).toBe(1);
  });
});
