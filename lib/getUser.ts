import Cookies from "js-cookie";

export const getUser = (): UserData | null => {
  const userCookie = Cookies.get("catSprayUser");
  if (userCookie) {
    try {
      return JSON.parse(userCookie);
    } catch (error) {
      console.error("Error parsing user cookie:", error);
      return null;
    }
  }
  return null;
};
