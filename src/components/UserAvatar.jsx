import React from "react";
import { getInitials, getAvatarColor } from "../utils/avatarUtils";

const UserAvatar = ({ image, firstName, lastName, size = 40, className = "" }) => {
    if (image) {
        return (
            <img
                src={image}
                alt={`${firstName} ${lastName}`}
                className={`rounded-circle object-fit-cover ${className}`}
                style={{ width: size, height: size }}
            />
        );
    }

    const initials = getInitials(firstName, lastName);
    const backgroundColor = getAvatarColor(firstName + " " + lastName);

    return (
        <div
            className={`d-flex align-items-center justify-content-center rounded-circle text-white fw-bold ${className}`}
            style={{
                width: size,
                height: size,
                backgroundColor: backgroundColor,
                fontSize: size * 0.4,
            }}
        >
            {initials}
        </div>
    );
};

export default UserAvatar;
