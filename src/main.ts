import './styles/main.css';

const titleScreen = document.getElementById('title-screen')!;
const screen      = document.getElementById('screen')!;
const output      = document.getElementById('output')!;

function print(text: string, cssClass?: string): void {
    const line = document.createElement('div');
    if (cssClass) line.className = cssClass;
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function startGame(): void {
    titleScreen.classList.add('hidden');
    screen.classList.remove('hidden');

    print('MOVIE MOGUL', 'bright bold center');
    print('', 'center');
    print('Written by Anthony Chiang', 'dim center');
    print('Converted to the C-64 by Alan Gardner', 'dim center');
    print('', 'center');
    print('Copyright 1985 Chiang Brothers Software', 'dim center');
}

// Any keypress on the title screen advances to the game
window.addEventListener('keydown', startGame, { once: true });
titleScreen.addEventListener('click', startGame, { once: true });
