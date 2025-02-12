import { useState, useEffect } from "react";

// Custom hook that delays updating a value until a specified delay has passed
// Useful for preventing too many rapid updates (e.g., during typing)
// T: Generic type parameter for the value being debounced
// value: The value to debounce
// delay: The delay in milliseconds before updating the debounced value
export const useDebounce = <T>(value: T, delay: number): T => {
	// State to hold the debounced value
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		// Set up timer to update the debounced value after the delay
		const timer = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		// Clean up timer if value changes before delay has passed
		return () => {
			clearTimeout(timer);
		};
	}, [value, delay]);

	return debouncedValue;
};
