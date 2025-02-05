import axiosInstance from "../axiosInstance";
let token: string | null = null;

if (typeof window !== "undefined") {
  token = localStorage.getItem("token");
}

export const getNote = async () => {
  const data = await axiosInstance.get("/notes/get", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};
