export function getCompactAge(birthDate) {
    const birth = new Date(birthDate);
    const today = new Date();

    // If birth date is invalid or in the future, return "0D"
    if (isNaN(birth.getTime()) || birth > today) {
        return "0D";
    }

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
        months--;
        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += prevMonth.getDate();
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    // Return age in the compact format
    if (years > 0) {
        return `${years}Y`;
    } else if (months > 0) {
        return `${months}M`;
    } else {
        return `${days}D`;
    }
}
