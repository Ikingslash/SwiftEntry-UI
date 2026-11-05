import React from "react";
import { getInitials, getAvatarColor } from "../utils/avatarUtils";

const UserAvatar = ({ image, firstName, lastName, size = 40, className = "" }) => {
    if (image) {
        return (
            <img
                src={image}
                alt={`${firstName} ${lastName}`}
                className={`rounded-full object-cover ${className}`}
                style={{ width: size, height: size, minWidth: size, minHeight: size }}
            />
        );
    }

    const initials = getInitials(firstName, lastName);
    const backgroundColor = getAvatarColor(firstName + " " + lastName);

    return (
        <div
            className={`flex items-center justify-center rounded-full text-white font-bold select-none shrink-0 ${className}`}
            style={{
                width: size,
                height: size,
                minWidth: size,
                minHeight: size,
                backgroundColor: backgroundColor,
                fontSize: size * 0.4,
                lineHeight: 1,
            }}
        >
            {initials}
        </div>
    );
};

export default UserAvatar;