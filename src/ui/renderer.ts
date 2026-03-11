// Terminal renderer — all output and input for the game UI.
// Writes to the #output div; reads keypresses via a promise-based queue.

type CssClass = 'dim' | 'bright' | 'green' | 'red' | 'center' | 'bold';

const output = document.getElementById('output')!;
const inputPrompt = document.getElementById('prompt')!;

// ── Output ────────────────────────────────────────────────────────────────────

export function clearScreen(): void {
    output.innerHTML = '';
}

export function print(text: string, ...classes: CssClass[]): void {
    const line = document.createElement('div');
    if (classes.length) line.className = classes.join(' ');
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

export function printBlank(): void {
    print('');
}

export function printSeparator(): void {
    print('----------------------------------------', 'dim');
}

/** Print text character-by-character with a small delay, like the C64 reviewer output. */
export async function printSlow(text: string, delayMs = 30): Promise<void> {
    const line = document.createElement('div');
    output.appendChild(line);
    for (const ch of text) {
        line.textContent += ch;
        output.scrollTop = output.scrollHeight;
        await sleep(delayMs);
    }
}

/** Print a centered heading with a blank line above and below. */
export function printHeading(text: string): void {
    printBlank();
    print(text, 'bright', 'bold', 'center');
    printBlank();
}

// ── Input ─────────────────────────────────────────────────────────────────────

/** Wait for a single keypress and return the key string. */
export function waitForKey(): Promise<string> {
    return new Promise(resolve => {
        window.addEventListener('keydown', e => resolve(e.key), { once: true });
    });
}

/** Show a prompt and collect a line of text input, echoing each character. */
export function readLine(promptText: string): Promise<string> {
    return new Promise(resolve => {
        inputPrompt.textContent = promptText + ' ';
        let value = '';

        const cursor = document.getElementById('cursor')!;
        cursor.textContent = '█';

        function onKey(e: KeyboardEvent): void {
            if (e.key === 'Enter') {
                window.removeEventListener('keydown', onKey);
                print(promptText + ' ' + value);
                inputPrompt.textContent = '> ';
                cursor.textContent = '█';
                resolve(value);
                return;
            }
            if (e.key === 'Backspace') {
                value = value.slice(0, -1);
            } else if (e.key.length === 1) {
                value += e.key;
            }
            cursor.textContent = value + '█';
        }

        window.addEventListener('keydown', onKey);
    });
}

/** Show "Press any key to continue" and wait. */
export async function pressAnyKey(): Promise<void> {
    print('Press any key to continue', 'dim');
    await waitForKey();
    printBlank();
}

export { formatMoney } from './format';

function sleep(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
}
