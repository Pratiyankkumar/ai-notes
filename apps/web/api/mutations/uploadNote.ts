import axiosInstance from "../axiosInstance";
let token: string | null = null;

if (typeof window !== "undefined") {
  token = localStorage.getItem("token");
}

export const uploadNote = async (note: FormData) => {
  const data = await axiosInstance.post("/notes/upload", note, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};
