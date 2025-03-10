
export const getDate = () => {
    const now = new Date();
  
    // Get the UTC time
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  
    // Calculate IST time by adding the IST offset (5 hours 30 minutes in milliseconds)
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(utcTime + istOffset);
  
    return istTime.toISOString().slice(0, 10); // Returns date in YYYY-MM-DD format
  };
  