export const bookingState = {
    pendingBooking: null
};

export function generateBoardingNumber() {
    return Math.floor(Math.random() * 10000000) + 60000000;
}