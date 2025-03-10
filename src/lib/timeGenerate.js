let currentDate = new Date();

// Format the date and time
const timeOptions = { hour: "numeric", minute: "numeric" };
export const formattedTime = () => currentDate.toLocaleTimeString(undefined, timeOptions);