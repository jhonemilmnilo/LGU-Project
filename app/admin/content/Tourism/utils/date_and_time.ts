/**
 * Formats a date string or Date object into a readable format.
 */
export function formatDate(dateInput: Date | string | null | undefined): string {
    if (!dateInput) return "N/A";

    try {
        const date = new Date(dateInput);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return "Invalid Date";
    }
}
