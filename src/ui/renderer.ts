// Terminal renderer — all output and input for the game UI.
// Writes to the #output div; reads keypresses via a promise-based queue.

type CssClass = 'dim' | 'bright' | 'green' | 'red' | 'center' | 'bold';

const output = document.getElementById('output')!;
const inputPrompt = document.getElementById('prompt')!;
const textInput = document.getElementById('text-input') as HTMLInputElement;

// On mobile, tapping the screen focuses the input (pops keyboard) when readLine is waiting.
let readLineActive = false;
document.getElementById('screen')!.addEventListener('touchstart', () => {
    if (readLineActive) textInput.focus();
}, { passive: true });

// When the virtual keyboard appears/disappears, shrink the screen to the
// visible area so the input line is never hidden behind the keyboard.
const screenEl = document.getElementById('screen')!;
window.visualViewport?.addEventListener('resize', () => {
    screenEl.style.height = `${window.visualViewport!.height}px`;
    output.scrollTop = output.scrollHeight;
});

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

/** Wait for a single keypress or screen tap and return the key string. */
export function waitForKey(): Promise<string> {
    return new Promise(resolve => {
        let done = false;
        const finish = (key: string) => {
            if (done) return;
            done = true;
            window.removeEventListener('keydown', onKey);
            resolve(key);
        };
        const onKey = (e: KeyboardEvent) => { e.preventDefault(); finish(e.key); };
        window.addEventListener('keydown', onKey);

        // Delay tap listener so we don't immediately catch the pointerup
        // from the interaction that triggered this waitForKey call.
        setTimeout(() => {
            if (done) return;
            const onTap = () => finish('');
            document.addEventListener('pointerup', onTap, { once: true });
        }, 300);
    });
}

/** Show a prompt and collect a line of text input. */
export function readLine(promptText: string, maxLength = Infinity): Promise<string> {
    return new Promise(resolve => {
        inputPrompt.textContent = promptText + ' ';
        textInput.value = '';
        if (isFinite(maxLength)) {
            textInput.maxLength = maxLength;
        } else {
            textInput.removeAttribute('maxlength');
        }
        readLineActive = true;
        textInput.focus(); // works on Android; iOS requires user tap (see touchstart handler)

        let submitted = false;
        const submit = () => {
            if (submitted) return;
            submitted = true;
            readLineActive = false;
            window.removeEventListener('keydown', onKey);
            const value = textInput.value;
            print(promptText + ' ' + value);
            inputPrompt.textContent = '> ';
            textInput.value = '';
            resolve(value);
        };

        const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } };

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

export function sleep(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
}
