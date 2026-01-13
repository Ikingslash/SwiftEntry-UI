export const getInitials = (firstName, lastName) => {
    if (!firstName && !lastName) return "";

    // If only one argument is provided and it looks like a full name
    if (firstName && !lastName) {
        const parts = firstName.trim().split(" ");
        if (parts.length > 1) {
            return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
        }
        return firstName.charAt(0).toUpperCase();
    }

    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : "";
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : "";
    return firstInitial + lastInitial;
};

export const getAvatarColor = (name) => {
    if (!name) return "#007bff"; // Default blue
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return "#" + "00000".substring(0, 6 - c.length) + c;
};
