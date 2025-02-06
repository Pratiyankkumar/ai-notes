import axiosInstance from "../axiosInstance";
let token: string | null = null;

if (typeof window !== "undefined") {
  token = localStorage.getItem("token");
}

type User = {
  name?: string;
  email?: string;
  password?: string;
};

export const getUser = async () => {
  const data = await axiosInstance.get("/user/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};

export const updateUser = async (user: User) => {
  const data = await axiosInstance.put("/user/me", user, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};

export const deleteUser = async () => {
  const data = await axiosInstance.delete("/user/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};
