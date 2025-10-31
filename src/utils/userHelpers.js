export const getUserDisplayName = (userObj) => {
  if (userObj?.displayName) return userObj.displayName;
  if (userObj?.email) return userObj.email.split('@')[0];
  return "Usuario";
};

export const getUserInitials = (userObj) => {
  const name = getUserDisplayName(userObj);
  return name.substring(0, 2).toUpperCase();
};