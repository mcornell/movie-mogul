import './styles/main.css';

const output = document.getElementById('output')!;

function print(text: string, cssClass?: string): void {
    const line = document.createElement('div');
    if (cssClass) line.className = cssClass;
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function printBlank(): void {
    print('');
}

// Splash screen
print('  MOVIE MOGUL', 'bright bold center');
printBlank();
print('  A Hollywood Production Simulator', 'dim center');
print('  ─────────────────────────────────', 'dim center');
printBlank();
print('  Loading...', 'dim');
