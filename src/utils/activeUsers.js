const activeUsers = {};

const getActiveUsers = () => activeUsers;

const setActiveUser = (email, data) => {
    if (!activeUsers[email]) {
        activeUsers[email] = {};
    }
    Object.assign(activeUsers[email], data);
};

const getActiveUser = (email) => activeUsers[email] || null;

const deleteActiveUser = (email) => delete activeUsers[email];

module.exports = { getActiveUsers, setActiveUser, getActiveUser, deleteActiveUser };
