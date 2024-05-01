export function debounce<F extends (...args: unknown[]) => unknown>(func: F, delay: number): (...args: Parameters<F>) => void {
    let debounceTimer: number;
    return (...args: Parameters<F>) => {
        clearTimeout(debounceTimer);
        debounceTimer = window.setTimeout(() => func(...args), delay);
    }
}