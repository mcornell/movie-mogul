import { describe, it, expect } from 'vitest';
import { initialGameState } from './gameState';

describe('initialGameState', () => {
    it('starts in the title phase', () => {
        expect(initialGameState().phase).toBe('title');
    });

    it('has no movie selection yet', () => {
        const state = initialGameState();
        expect(state.movieChoices).toBeNull();
        expect(state.selectedMovie).toBeNull();
    });

    it('has empty casting state', () => {
        const state = initialGameState();
        expect(state.actorPool).toEqual([]);
        expect(state.actorPays).toEqual([]);
        expect(state.cast).toEqual([]);
    });

    it('has zero financial state', () => {
        const state = initialGameState();
        expect(state.salaryCost).toBe(0);
        expect(state.productionBudget).toBe(0);
        expect(state.totalCost).toBe(0);
    });

    it('starts reviewScore at 3 (matching the C64 BASIC initial value)', () => {
        expect(initialGameState().reviewScore).toBe(3);
    });

    it('has empty release state', () => {
        const state = initialGameState();
        expect(state.weeklyGross).toEqual([]);
        expect(state.totalGross).toBe(0);
    });

    it('has zero awards state', () => {
        const state = initialGameState();
        expect(state.oscarsWon).toBe(0);
        expect(state.reReleaseGross).toBe(0);
    });

    it('returns a fresh independent object on each call', () => {
        const a = initialGameState();
        const b = initialGameState();
        a.cast.push({ roleIndex: 0, actor: {} as never, pay: 100 });
        expect(b.cast).toHaveLength(0);
    });
});
