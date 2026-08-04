const LEVELS = { VIEW: 1, EDIT: 2 };

const RequireSubcorpusPermission = ({ level, userPermission, children, fallback = null }) => {
    if (!userPermission || LEVELS[userPermission] < LEVELS[level]) {
        return fallback;
    }
    return children;
};

export default RequireSubcorpusPermission;
