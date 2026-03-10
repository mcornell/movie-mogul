// gameState.ts

// This module manages the state of the game

interface GameState {
    score: number;
    level: number;
    lives: number;
    isGameOver: boolean;
}

class Game {
    private state: GameState;

    constructor() {
        this.state = this.initializeState();
    }

    private initializeState(): GameState {
        return {
            score: 0,
            level: 1,
            lives: 3,
            isGameOver: false,
        };
    }

    public getState(): GameState {
        return this.state;
    }

    public updateScore(points: number): void {
        this.state.score += points;
    }

    public levelUp(): void {
        this.state.level += 1;
    }

    public loseLife(): void {
        this.state.lives -= 1;
        if (this.state.lives <= 0) {
            this.state.isGameOver = true;
        }
    }

    public resetGame(): void {
        this.state = this.initializeState();
    }
}

export default Game;